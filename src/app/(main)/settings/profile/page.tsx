"use client";

import { useState, useEffect } from "react";
import { useHandleLogout } from "@/utils/manage_supabase";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import LoadingWithReload from "@/components/LoadingWithReload";
import { UserService } from "@/services/userService";

export default function ProfileSettingsPage() {
  const {
    user,
    userProfile,
    loading: userLoading,
    refreshAll,
    refreshUserProfile,
  } = useUser();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const handleLogout = useHandleLogout();

  const handleSave = async () => {
    if (!user) {
      setMessage("ログインが必要です");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const success = await UserService.updateUserProfile(user.id, {
        username: userName || null,
        updated_at: new Date().toISOString(),
      });

      if (success) {
        setMessage("プロフィールを更新しました");
        // 3秒後にメッセージを消去
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("更新に失敗しました。もう一度お試しください。");
      }
      await refreshUserProfile(); // ユーザープロフィールを更新
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      setMessage("更新に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  // ユーザープロフィールが読み込まれたら初期値を設定
  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.username || "");
    }
  }, [userProfile]);

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">プロフィール</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <LoadingWithReload
            message="プロフィールデータを読み込み中..."
            onReload={refreshAll}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">プロフィール</h1>
      </div>

      {/* ユーザー情報セクション */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">ユーザー情報</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-600">
                {user?.email || "Loading..."}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              placeholder="ユーザー名を入力"
            />
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes("成功") || message.includes("更新しました")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* アカウント管理セクション */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">アカウント管理</h2>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}
