'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // オンラインに復帰した時の通知
      setShowOffline(false);
      // 3秒後に復帰通知を非表示
      setTimeout(() => setWasOffline(false), 3000);
    }
  }, [isOnline, wasOffline]);

  if (!showOffline && !wasOffline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      !isOnline 
        ? 'bg-red-600 text-white' 
        : 'bg-green-600 text-white'
    }`}>
      <div className="container mx-auto px-4 py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          {!isOnline ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">オフライン - データは後で同期されます</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">オンラインに復帰しました</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
