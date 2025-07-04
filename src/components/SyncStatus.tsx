"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function SyncStatus() {
  const { pendingOperations, isSyncing, isOnline } = useOfflineSync();

  if (pendingOperations.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-80 z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-3">
          {isSyncing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-yellow-500" : "bg-red-500"
              }`}
            ></div>
          )}

          <div className="flex-1">
            <h4 className="font-medium text-gray-900">
              {isSyncing
                ? "同期中..."
                : `${pendingOperations.length}件の未同期データ`}
            </h4>
            <p className="text-sm text-gray-500">
              {isSyncing
                ? "データを同期しています"
                : isOnline
                  ? "間もなく同期されます"
                  : "オンライン時に自動同期されます"}
            </p>
          </div>

          {!isSyncing && (
            <div className="text-xs text-gray-400">
              {pendingOperations.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
