'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';

export default function NotificationSettings() {
  const { supported, permission, requestPermission, sendNotification } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        sendNotification('通知が有効になりました！', {
          body: '家計簿アプリから重要な情報をお知らせします。'
        });
      }
    } catch (error) {
      console.error('通知許可エラー:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = () => {
    sendNotification('テスト通知', {
      body: '通知機能が正常に動作しています。',
      tag: 'test'
    });
  };

  if (!supported) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">プッシュ通知</h3>
        <p className="text-gray-600 text-sm">
          お使いのブラウザは通知機能をサポートしていません。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold text-gray-900 mb-4">プッシュ通知設定</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700">通知の許可状態</h4>
            <p className="text-sm text-gray-500">
              {permission === 'granted' && '✓ 許可済み'}
              {permission === 'denied' && '✗ 拒否済み'}
              {permission === 'default' && '? 未設定'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            permission === 'granted' 
              ? 'bg-green-100 text-green-800' 
              : permission === 'denied'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {permission === 'granted' ? '有効' : permission === 'denied' ? '無効' : '未設定'}
          </span>
        </div>

        {permission === 'default' && (
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRequesting ? '許可を要求中...' : '通知を許可する'}
          </button>
        )}

        {permission === 'granted' && (
          <div className="space-y-2">
            <button
              onClick={handleTestNotification}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              テスト通知を送信
            </button>
            <p className="text-xs text-gray-500 text-center">
              予算超過や支払い期限の通知を受け取れます
            </p>
          </div>
        )}

        {permission === 'denied' && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              通知が拒否されています。ブラウザの設定から手動で許可してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
