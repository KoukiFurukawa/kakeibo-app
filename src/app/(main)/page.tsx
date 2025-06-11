"use client"

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import LoadingWithReload from "@/components/LoadingWithReload";

// 円グラフコンポーネント
function PieChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded">
        <p className="text-gray-500 text-sm">支出データがありません</p>
      </div>
    );
  }

  const strokeWidth = 12;
  
  // モバイルとデスクトップの設定を統一
  const mobileConfig = { cx: 80, cy: 80, r: 60, size: 160 };
  const desktopConfig = { cx: 80, cy: 80, r: 60, size: 200 };

  let accumulatedAngle = 0;

  const createPath = (startAngle: number, endAngle: number, centerX: number, centerY: number, radius: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="h-48 sm:h-64 flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-2">
      {/* グラフ部分 */}
      <div className="flex-shrink-0">
        <svg width={mobileConfig.size} height={mobileConfig.size} className="sm:w-[200px] sm:h-[200px]">
          {/* 背景円 */}
          <circle
            cx={mobileConfig.cx}
            cy={mobileConfig.cy}
            r={mobileConfig.r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            className="sm:cx-[100] sm:cy-[100] sm:r-[75]"
          />
          
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = accumulatedAngle;
            const endAngle = accumulatedAngle + angle;
            
            // モバイル用のパス（デフォルト）
            const pathData = createPath(startAngle, endAngle, mobileConfig.cx, mobileConfig.cy, mobileConfig.r);
            accumulatedAngle += angle;

            return (
              <path
                key={index}
                d={pathData}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="sm:hidden"
              />
            );
          })}
          
          {/* デスクトップ用のパス（レスポンシブ対応） */}
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0);
            const endAngle = startAngle + angle;
            
            const pathData = createPath(startAngle, endAngle, desktopConfig.cx, desktopConfig.cy, desktopConfig.r);

            return (
              <path
                key={`desktop-${index}`}
                d={pathData}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="hidden sm:block"
              />
            );
          })}
          
          {/* 中央のテキスト */}
          <text x={mobileConfig.cx} y={mobileConfig.cy - 4} textAnchor="middle" className="text-xs sm:text-sm font-medium fill-gray-700 sm:x-[100] sm:y-[94]">
            総支出
          </text>
          <text x={mobileConfig.cx} y={mobileConfig.cy + 8} textAnchor="middle" className="text-xs fill-gray-600 sm:x-[100] sm:y-[108]">
            ¥{total.toLocaleString()}
          </text>
        </svg>
      </div>
      
      {/* 凡例部分 */}
      <div className="flex-1 min-w-0 max-w-full sm:max-w-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center min-w-0">
              <div 
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="truncate">
                {item.label}: ¥{item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
          {data.length > 6 && (
            <div className="text-xs text-gray-500 sm:col-span-2 mt-1">
              他 {data.length - 6} 項目
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 予算使用率グラフコンポーネント
function BudgetProgressChart({ used, budget, label, isSavings = false }: { 
  used: number; 
  budget: number; 
  label: string;
  isSavings?: boolean;
}) {
  const percentage = budget > 0 ? Math.min((used / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - used, 0);
  
  const getColor = () => {
    if (isSavings) {
      // 貯金の場合は達成度に応じて色を変える
      if (percentage >= 100) return 'bg-green-500';
      if (percentage >= 80) return 'bg-blue-500';
      return 'bg-gray-400';
    } else {
      // 支出の場合は予算オーバーを警告
      if (percentage >= 100) return 'bg-red-500';
      if (percentage >= 80) return 'bg-yellow-500';
      return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    if (isSavings) {
      return percentage >= 100 ? '目標達成！' : `目標まで ¥${remaining.toLocaleString()}`;
    } else {
      return percentage >= 100 ? '予算オーバー' : `残り ¥${remaining.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>
          {isSavings ? '貯金' : '支出'}: ¥{used.toLocaleString()}
        </span>
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { 
    user,
    userProfile, 
    userFinance,
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

  // 新しいstate
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const tags = [
    '食費', '日用品', '交通費', '娯楽', '衣服', '医療', '住居', '水道光熱費', '通信費', '教育', '給料', 'その他'
  ];

  // 現在の月の統計を取得
  const currentDate = new Date();
  const monthlyStats = transactions.length > 0 
    ? getMonthlyStats(currentDate.getFullYear(), currentDate.getMonth() + 1)
    : { income: 0, expense: 0, balance: 0 };

  // 今月の取引データを取得
  const currentMonthTransactions = useMemo(() => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, currentDate]);

  // 支出タグごとの集計データ
  const expenseByTag = useMemo(() => {
    const expenseTransactions = currentMonthTransactions.filter(t => !t.is_income);
    const tagTotals: { [key: string]: number } = {};

    expenseTransactions.forEach(transaction => {
      tagTotals[transaction.tag] = (tagTotals[transaction.tag] || 0) + transaction.amount;
    });

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280',
      '#14b8a6', '#f97316', '#a855f7', '#22c55e'
    ];

    return Object.entries(tagTotals)
      .map(([tag, amount], index) => ({
        label: tag,
        value: amount,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  // タグフィルタリングされた取引
  const filteredTransactions = useMemo(() => {
    let filtered = currentMonthTransactions.filter(t => 
      activeTab === 'expense' ? !t.is_income : t.is_income
    );

    if (selectedTag !== 'all') {
      filtered = filtered.filter(t => t.tag === selectedTag);
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [currentMonthTransactions, activeTab, selectedTag]);

  // 使用可能なタグ一覧
  const availableTags = useMemo(() => {
    const tagsInTransactions = Array.from(new Set(
      currentMonthTransactions
        .filter(t => activeTab === 'expense' ? !t.is_income : t.is_income)
        .map(t => t.tag)
    ));
    return tagsInTransactions.sort();
  }, [currentMonthTransactions, activeTab]);

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
    let timeoutId: NodeJS.Timeout;
    
    // ユーザーがログインしているが、まだtransactionsが初期化されていない場合のみrefreshを実行
    if (!loading && transactions.length === 0 && user) {
      timeoutId = setTimeout(() => {
        console.log('取引データが空のため、データを再取得します');
        refreshAll();
      }, 1000); // 1秒待ってからリフレッシュ
    }
    
    // 長時間のローディングを防ぐためのタイムアウト
    if (loading) {
      timeoutId = setTimeout(() => {
        console.warn('ローディングが長時間続いています。強制的に終了します。');
        // 強制的にローディングを終了（最後の手段）
        if (user) {
          refreshAll();
        }
      }, 10000); // 10秒でタイムアウト
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, transactions.length, refreshAll, user]);

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
          <div className="mt-2 text-xs text-gray-400">
            取引件数: {transactions.length}件
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">支出の内訳</h2>
          <PieChart data={expenseByTag} />
        </div>
      </div>

      {/* 予算使用率セクション */}
      {userFinance && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">予算・目標の進捗</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BudgetProgressChart 
              used={expenseByTag.find(item => item.label === '食費')?.value || 0}
              budget={userFinance.food}
              label="食費"
            />
            <BudgetProgressChart 
              used={expenseByTag.find(item => item.label === '娯楽')?.value || 0}
              budget={userFinance.entertainment}
              label="娯楽"
            />
            <BudgetProgressChart 
              used={expenseByTag.find(item => item.label === '衣服')?.value || 0}
              budget={userFinance.clothing}
              label="衣服"
            />
            <BudgetProgressChart 
              used={expenseByTag.find(item => item.label === '日用品')?.value || 0}
              budget={userFinance.daily_goods}
              label="日用品"
            />
            <BudgetProgressChart 
              used={expenseByTag.filter(item => !['食費', '娯楽', '衣服', '日用品'].includes(item.label)).reduce((sum, item) => sum + item.value, 0)}
              budget={userFinance.other}
              label="その他"
            />
            <BudgetProgressChart 
              used={Math.max(monthlyStats.balance, 0)}
              budget={userFinance.savings_goal}
              label="貯金目標"
              isSavings={true}
            />
          </div>
        </div>
      )}
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">今月の取引</h2>
          
          {/* タブ切り替え */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('expense');
                setSelectedTag('all');
              }}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => {
                setActiveTab('income');
                setSelectedTag('all');
              }}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              収入
            </button>
          </div>
        </div>

        {/* タグフィルター */}
        {availableTags.length > 0 && (
          <div className="mb-4">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">すべてのタグ</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        )}

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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500" colSpan={4}>
                    {loading ? '読み込み中...' : `${activeTab === 'expense' ? '支出' : '収入'}データがありません`}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {transaction.title}
                      {transaction.description && (
                        <div className="text-xs text-gray-500 mt-1">{transaction.description}</div>
                      )}
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

        {filteredTransactions.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            {filteredTransactions.length}件の取引を表示
          </div>
        )}
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
