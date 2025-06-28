'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface PendingOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  table: 'transactions' | 'fixed_costs';
  data: any;
  timestamp: number;
}

const STORAGE_KEY = 'kakeibo_pending_operations';

export function useOfflineSync() {
  const { user, refreshAll } = useUser();
  const isOnline = useOnlineStatus();
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 保留中の操作を追加
  const addPendingOperation = (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    
    setPendingOperations(prev => [...prev, newOperation]);
    return newOperation.id;
  };

  // 保留中の操作を同期
  const syncPendingOperations = async () => {
    if (!user || pendingOperations.length === 0) return;

    setIsSyncing(true);
    const failedOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      try {
        // 実際の同期処理は簡略化版
        // 本格的な実装では各操作タイプに応じた処理が必要
        console.log('同期中:', operation);
        
        // 成功した操作はリストから削除
        // 失敗した操作は後で再試行
      } catch (error) {
        console.error('操作同期エラー:', error);
        failedOperations.push(operation);
      }
    }

    // 失敗した操作のみ保持
    setPendingOperations(failedOperations);
    
    // 同期完了後にデータを再取得
    if (failedOperations.length < pendingOperations.length) {
      await refreshAll();
    }
    
    setIsSyncing(false);
  };

  // 保留中の操作をクリア
  const clearPendingOperations = () => {
    setPendingOperations([]);
  };

  // ローカルストレージから保留中の操作を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setPendingOperations(JSON.parse(saved));
        } catch (error) {
          console.error('保留中の操作の読み込みエラー:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // 保留中の操作をローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingOperations));
    }
  }, [pendingOperations]);

  // オンラインになった時に同期を実行
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0 && user && !isSyncing) {
      syncPendingOperations();
    }
  }, [isOnline, pendingOperations.length, user, isSyncing]);

  return {
    pendingOperations,
    isSyncing,
    isOnline,
    addPendingOperation,
    syncPendingOperations,
    clearPendingOperations
  };
}
