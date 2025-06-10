"use client"

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import LoadingWithReload from "@/components/LoadingWithReload";

export default function Home() {
  const { 
    userProfile, 
    transactions, 
    loading, 
    refreshAll, 
    addTransaction,
    getMonthlyStats 
  } = useUser();

  // 収支入力モーダルの状態
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputType, setInputType] = useState<'income' | 'expense'>('expense');
  const [inputTitle, setInputTitle] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputTag, setInputTag] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const tags = [
    '食費', '日用品', '交通費', '娯楽', '衣服', '医療', '住居', '水道光熱費', '通信費', '教育', '給料', 'その他'
  ];

  // 現在の月の統計を取得（transactionsが空の場合は初期値を返す）
  const currentDate = new Date();
  const monthlyStats = transactions.length > 0 
    ? getMonthlyStats(currentDate.getFullYear(), currentDate.getMonth() + 1)
    : { income: 0, expense: 0, balance: 0 };

  // 最近の取引（最大5件）
  const recentTransactions = transactions.slice(0, 5);

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputTitle.trim() || !inputTag || !inputAmount || Number(inputAmount) <= 0) {
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const newTransaction = await addTransaction({
        title: inputTitle,
        description: inputDescription,
        amount: Number(inputAmount),
        tag: inputTag,
        is_income: inputType === 'income'
      });

      if (newTransaction) {
        setShowInputModal(false);
        setMessage('収支を追加しました');
        // フォームをリセット
        setInputTitle('');
        setInputDescription('');
        setInputAmount('');
        setInputTag('');
        setInputDate(new Date().toISOString().split('T')[0]);
        setInputType('expense');
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('追加に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('収支追加エラー:', error);
      setMessage('追加に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelInput = () => {
    setShowInputModal(false);
    setInputTitle('');
    setInputDescription('');
    setInputAmount('');
    setInputTag('');
    setInputDate(new Date().toISOString().split('T')[0]);
    setInputType('expense');
    setMessage('');
  };

  // UserContextのデータ初期化を待つ
  useEffect(() => {
    // ユーザーがログインしているが、まだtransactionsが初期化されていない場合のみrefreshを実行
    if (!loading && transactions.length === 0) {
      const timer = setTimeout(() => {
        refreshAll();
      }, 100); // 短い遅延でUserContextの初期化を待つ
      
      return () => clearTimeout(timer);
    }
  }, [loading, transactions.length, refreshAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingWithReload 
          message="ダッシュボードデータを読み込み中..."
          onReload={refreshAll}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* メッセージ表示 */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.includes('失敗') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-3">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">今月の収支</h2>
          <div className="flex justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">収入</p>
              <p className="text-base sm:text-lg font-bold text-green-600">¥{monthlyStats.income.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">支出</p>
              <p className="text-base sm:text-lg font-bold text-red-600">¥{monthlyStats.expense.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">残高</p>
              <p className={`text-base sm:text-lg font-bold ${monthlyStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{monthlyStats.balance.toLocaleString()}
              </p>
            </div>
          </div>
          {/* デバッグ用：データが読み込まれているかを表示 */}
          <div className="mt-2 text-xs text-gray-400">
            取引件数: {transactions.length}件
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">支出の内訳</h2>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded">
            <p className="text-gray-500 text-sm">ここに円グラフが表示されます</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">最近の取引</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500" colSpan={4}>
                    {loading ? '読み込み中...' : '取引データがありません'}
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {transaction.title}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {transaction.tag}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={transaction.is_income ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {transaction.is_income ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 浮動追加ボタン */}
      <button
        onClick={() => setShowInputModal(true)}
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors z-20"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* 収支入力モーダル */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-30 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">収支を追加</h2>
                <button
                  onClick={handleCancelInput}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleInputSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setInputType('income')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm ${
                      inputType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    収入
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('expense')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm ${
                      inputType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    支出
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="例: 昼食、電車代"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
                <input
                  type="text"
                  value={inputDescription}
                  onChange={(e) => setInputDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  placeholder="詳細な説明"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                <select
                  value={inputTag}
                  onChange={(e) => setInputTag(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="">タグを選択</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    ¥
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancelInput}
                  className="flex-1 py-3 px-4 rounded-md font-medium text-sm bg-gray-300 text-gray-800 hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm ${
                    saving
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
