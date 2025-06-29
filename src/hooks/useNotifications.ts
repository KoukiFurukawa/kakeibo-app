'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/manage_supabase';
import { INotificationWithReadStatus } from '@/types/notification';
import { useUser } from '@/contexts/UserContext';

interface INotificationState {
  supported: boolean;
  permission: NotificationPermission;
}

// ローカルストレージのキー
const READ_NOTIFICATIONS_KEY = 'kakeibo-read-notifications';

export function useNotifications() {
  const [state, setState] = useState<INotificationState>({
    supported: false,
    permission: 'default'
  });
  const [notifications, setNotifications] = useState<INotificationWithReadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

    // 未読の通知数を取得
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ローカルストレージから既読状態を取得
  const getReadNotifications = (): string[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const userKey = `${READ_NOTIFICATIONS_KEY}-${user?.id || 'anonymous'}`;
      const storedData = localStorage.getItem(userKey);
      return storedData ? JSON.parse(storedData) : [];
    } catch (err) {
      console.error('既読通知の取得に失敗しました:', err);
      return [];
    }
  };

  // ローカルストレージに既読状態を保存
  const saveReadNotifications = (ids: string[]) => {
    if (typeof window === 'undefined' || !user) return;
    
    try {
      const userKey = `${READ_NOTIFICATIONS_KEY}-${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(ids));
    } catch (err) {
      console.error('既読通知の保存に失敗しました:', err);
    }
  };

  // 通知データを取得する
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // 現在の日付
      const now = new Date().toISOString();
      
      // 通知を取得
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .or(`close_date.gt.${now},close_date.is.null`)
        .order('created_at', { ascending: false });
      
      if (notificationsError) throw notificationsError;

      // ローカルストレージから既読状態を取得
      const readIds = getReadNotifications();
      
      // 現在有効な通知IDのリスト
      const activeNotificationIds = (notificationsData || []).map(notification => notification.id);
      
      // 不要な既読通知IDをクリーンアップ
      cleanupReadNotifications(readIds, activeNotificationIds);

      // 既読状態をマージ
      const notificationsWithReadStatus = (notificationsData || []).map(notification => {
        const isRead = readIds.includes(notification.id);
        return { ...notification, is_read: isRead };
      });

      setNotifications(notificationsWithReadStatus);
    } catch (err) {
      console.error('通知の取得に失敗しました:', err);
      setError('通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 不要な既読通知IDをクリーンアップする関数
  const cleanupReadNotifications = (readIds: string[], activeIds: string[]) => {
    if (!user || readIds.length === 0) return;
    
    try {
      // 現在のアクティブな通知に存在しないIDをフィルタリング
      const validReadIds = readIds.filter(id => activeIds.includes(id));
      
      // 不要なIDを削除する必要があるかチェック
      if (validReadIds.length < readIds.length) {
        console.log(`不要な通知ID ${readIds.length - validReadIds.length}件をクリーンアップします`);
        
        // クリーンアップした既読IDリストを保存
        const userKey = `${READ_NOTIFICATIONS_KEY}-${user.id}`;
        localStorage.setItem(userKey, JSON.stringify(validReadIds));
      }
    } catch (err) {
      console.error('既読通知のクリーンアップに失敗しました:', err);
    }
  };

  // 通知を既読にする
  const markAsRead = async (notificationId: string) => {
    if (!user) return false;

    try {
      // 現在の既読IDリストを取得
      const readIds = getReadNotifications();
      
      // まだ既読でなければ追加
      if (!readIds.includes(notificationId)) {
        const newReadIds = [...readIds, notificationId];
        saveReadNotifications(newReadIds);
        
        // ローカル状態を更新
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
      }
      
      return true;
    } catch (err) {
      console.error('通知の既読処理に失敗しました:', err);
      return false;
    }
  };

  // 全ての通知を既読にする
  const markAllAsRead = async () => {
    if (!user) return false;

    try {
      // 未読の通知IDを取得
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);
      
      if (unreadIds.length === 0) return true;

      // 現在の既読IDリストと結合
      const currentReadIds = getReadNotifications();
      const allReadIds = [...new Set([...currentReadIds, ...unreadIds])];
      
      // 保存
      saveReadNotifications(allReadIds);
      
      // ローカル状態を更新
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      return true;
    } catch (err) {
      console.error('全通知の既読処理に失敗しました:', err);
      return false;
    }
  };

  // 通知許可のリクエスト
  const requestPermission = async (): Promise<boolean> => {
    if (!state.supported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('通知許可リクエストエラー:', error);
      return false;
    }
  };

  // ブラウザ通知の送信
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!state.supported || state.permission !== 'granted') {
      console.warn('通知がサポートされていないか、許可されていません');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        ...options
      });

      // 通知クリック時にアプリにフォーカス
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('通知送信エラー:', error);
    }
  };

  // ブラウザ通知APIの対応チェック
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setState({
        supported: true,
        permission: Notification.permission
      });
    }
  }, []);

  // ユーザーが変わったら通知を再取得
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  return {
    ...state,
    notifications,
    unreadCount,
    loading,
    error,
    requestPermission,
    sendNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
