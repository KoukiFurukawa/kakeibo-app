'use client';

import { useState, useEffect } from 'react';

interface NotificationState {
  supported: boolean;
  permission: NotificationPermission;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    supported: false,
    permission: 'default'
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setState({
        supported: true,
        permission: Notification.permission
      });
    }
  }, []);

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

  return {
    ...state,
    requestPermission,
    sendNotification
  };
}
