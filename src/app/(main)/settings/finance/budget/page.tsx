"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import LoadingWithReload from "@/components/LoadingWithReload";
import { FinanceService } from "@/services/financeService";

export default function BudgetSettingsPage() {
  const {
    userFinance,
    loading: userLoading,
    refreshAll,
    user,
    refreshUserFinance,
  } = useUser();
  const [savingGoal, setSavingGoal] = useState("");
  const [food, setFood] = useState("");
  const [entertainment, setEntertainment] = useState("");
  const [clothing, setClothing] = useState("");
  const [dailyGoods, setDailyGoods] = useState("");
  const [other, setOther] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!user) {
        setMessage("ユーザー情報が取得できません。ログインしてください。");
        return;
      }
      const success = await FinanceService.updateUserFinance(user.id, {
        savings_goal: savingGoal ? Number(savingGoal) : 0,
        food: food ? Number(food) : 0,
        entertainment: entertainment ? Number(entertainment) : 0,
        clothing: clothing ? Number(clothing) : 0,
        daily_goods: dailyGoods ? Number(dailyGoods) : 0,
        other: other ? Number(other) : 0,
      });

      if (success) {
        setMessage("予算設定を保存しました");
        setHasChanges(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("設定の保存に失敗しました。もう一度お試しください。");
      }

      await refreshUserFinance(); // ユーザーファイナンスを再取得
    } catch (error) {
      console.error("予算設定保存エラー:", error);
      setMessage("設定の保存に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  // UserFinanceが読み込まれたら初期値を設定
  useEffect(() => {
    if (userFinance) {
      setSavingGoal(userFinance.savings_goal?.toString() || "");
      setFood(userFinance.food?.toString() || "");
      setEntertainment(userFinance.entertainment?.toString() || "");
      setClothing(userFinance.clothing?.toString() || "");
      setDailyGoods(userFinance.daily_goods?.toString() || "");
      setOther(userFinance.other?.toString() || "");
    }
  }, [userFinance]);

  // 変更を検知
  useEffect(() => {
    if (userFinance) {
      const hasChanges =
        savingGoal !== (userFinance.savings_goal?.toString() || "") ||
        food !== (userFinance.food?.toString() || "") ||
        entertainment !== (userFinance.entertainment?.toString() || "") ||
        clothing !== (userFinance.clothing?.toString() || "") ||
        dailyGoods !== (userFinance.daily_goods?.toString() || "") ||
        other !== (userFinance.other?.toString() || "");
      setHasChanges(hasChanges);
    }
  }, [
    savingGoal,
    food,
    entertainment,
    clothing,
    dailyGoods,
    other,
    userFinance,
  ]);

  if (userLoading) {
    return (
      <div className="pb-32">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/settings/finance"
              className="p-2 hover:bg-gray-100 rounded-md"
            >
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
            <h1 className="text-xl sm:text-2xl font-bold">予算設定</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <LoadingWithReload
              message="予算設定データを読み込み中..."
              onReload={refreshAll}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {" "}
      {/* フッター + 保存ボタン分の余白 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/settings/finance"
            className="p-2 hover:bg-gray-100 rounded-md"
          >
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
          <h1 className="text-xl sm:text-2xl font-bold">予算設定</h1>
        </div>

        {/* 貯金目標セクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">月の貯金目標</h2>
            <p className="text-sm text-gray-500 mt-1">
              毎月の貯金目標額を設定してください
            </p>
          </div>
          <div className="p-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                ¥
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={savingGoal}
                onChange={(e) => setSavingGoal(e.target.value)}
                className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                placeholder="50000"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* カテゴリ別予算セクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">カテゴリ別予算</h2>
            <p className="text-sm text-gray-500 mt-1">
              各カテゴリの月間予算を設定してください
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                食費
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="30000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                娯楽
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={entertainment}
                  onChange={(e) => setEntertainment(e.target.value)}
                  className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="20000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                衣服
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={clothing}
                  onChange={(e) => setClothing(e.target.value)}
                  className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="15000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日用品
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={dailyGoods}
                  onChange={(e) => setDailyGoods(e.target.value)}
                  className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="10000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                その他
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="10000"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("保存しました")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                予算設定について
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  設定した予算は家計簿のダッシュボードで進捗として表示されます。現実的な予算を設定することをおすすめします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 固定保存ボタン - フッターの上部に配置 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleSave}
            disabled={!hasChanges || loading}
            className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
              hasChanges && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
