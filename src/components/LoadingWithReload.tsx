"use client";

import { useState, useEffect } from "react";

interface ILoadingWithReloadProps {
  message?: string;
  showReloadAfter?: number; // ミリ秒
  onReload?: () => void;
}

export default function LoadingWithReload({
  message = "読み込み中...",
  showReloadAfter = 3000,
  onReload,
}: ILoadingWithReloadProps) {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReload(true);
    }, showReloadAfter);

    return () => clearTimeout(timer);
  }, [showReloadAfter]);

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 mb-4">{message}</p>
      {showReload && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            読み込みに時間がかかっています
          </p>
          <button
            onClick={handleReload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            ページを更新
          </button>
        </div>
      )}
    </div>
  );
}
