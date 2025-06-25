"use client"

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo } from "react";
import LoadingWithReload from "@/components/LoadingWithReload";
import PieChart from "@/components/home/PieChart";
import MonthSelector from "@/components/home/MonthSelector";
import MonthSummary from "@/components/home/MonthSummary";
import BudgetProgress from "@/components/home/BudgetProgress";
import TransactionList from "@/components/home/TransactionList";
import TransactionModal from "@/components/home/TransactionModal";
import UserSwitcher from "@/components/home/UserSwitcher";
import { generateExpenseByTag } from "@/utils/chartHelpers";
import { TransactionInput } from "@/types/transaction";
import { FinanceService } from "@/services/financeService";
import { GroupMember } from "@/types/user";

export default function Home() {
  const {
    user,
    userFinance,
    userProfile,
    transactions,
    loading,
    refreshTransactions,
    refreshAll,
    userGroup,
    groupMembers,
  } = useUser();

  // 給料日（デフォルトは1日）
  const salaryDay = userProfile?.salary_day || 1;

  // 状態管理
  const [showInputModal, setShowInputModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [currentUser, setCurrentUser] = useState<GroupMember | null>(groupMembers?.find(member => member.id === user?.id) || null);

  // グループメンバーが2人以上（自分含む）かどうかを判定
  const hasMultipleMembers = useMemo(() => {
    return groupMembers && groupMembers.length >= 2;
  }, [groupMembers]);

  // 給料日ベースの期間を計算
  const getPeriodDates = (year: number, month: number, day: number = 1) => {
    if (day === 1) {
      // 給料日が1日の場合は通常の月表示
      return {
        startDate: new Date(year, month - 1, 1, 0, 0, 0),
        endDate: new Date(year, month, 0, 23, 59, 59)
      };
    }

    // 開始日: 前月の給料日
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const startDate = new Date(prevYear, prevMonth - 1, day, 0, 0, 0);
    
    // 終了日: 当月の給料日前日
    const endDate = new Date(year, month - 1, day - 1, 23, 59, 59);
    
    // 給料日が月末より大きい場合の調整
    if (day > new Date(year, month, 0).getDate()) {
      endDate.setDate(new Date(year, month, 0).getDate());
    }
    
    return { startDate, endDate };
  };

  // 月別統計データ
  const monthlyStats = transactions.length > 0
    ? FinanceService.getMonthlyStats(transactions, selectedYear, selectedMonth, salaryDay)
    : { income: 0, expense: 0, balance: 0 };

  // 選択された月の取引データを取得
  const currentMonthTransactions = useMemo(() => {
    const { startDate, endDate } = getPeriodDates(selectedYear, selectedMonth, salaryDay);

    return transactions.filter(transaction => {
      const dateToUse = transaction.date || transaction.created_at;
      const transactionDate = new Date(dateToUse);
      
      // 日付の比較で、同じ日付（時間差あり）もカバーするための調整
      const transactionDateOnly = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate(),
        0, 0, 0
      );
      const startDateOnly = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0
      );
      
      // 開始日を含み、終了日を含む範囲で比較
      return transactionDateOnly >= startDateOnly && transactionDate <= endDate;
    });
  }, [transactions, selectedYear, selectedMonth, salaryDay]);

  // 支出タグごとの集計データ
  const expenseByTag = useMemo(() =>
    generateExpenseByTag(currentMonthTransactions),
    [currentMonthTransactions]
  );

  // タグフィルタリングされた取引
  const filteredTransactions = useMemo(() => {
    let filtered = currentMonthTransactions.filter(t =>
      activeTab === 'expense' ? !t.is_income : t.is_income
    );

    if (selectedTag !== 'all') {
      filtered = filtered.filter(t => t.tag === selectedTag);
    }

    return filtered.sort((a, b) => {
      const dateA = a.date || a.created_at;
      const dateB = b.date || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
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

  // 月変更ハンドラ
  const handleMonthChange = async (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    if (salaryDay !== 1)
    {
      year = month === 1 ? year - 1 : year;
      month = month === 1 ? 12 : month - 1;
    }
    await refreshTransactions(year, month, currentUser?.id);
  };

  // 取引追加ハンドラ - 常にログインユーザーのIDを使用
  const handleTransactionSubmit = async (data: TransactionInput) => {
    setSaving(true);
    setMessage('');

    try {
      if (!user) {
        setMessage('ユーザー情報が取得できません。再ログインしてください。');
        return;
      }
      // 必ずログインユーザーのIDでトランザクションを追加
      const newTransaction = await FinanceService.addTransaction(user.id, data);

      if (newTransaction) {
        setShowInputModal(false);
        setMessage('収支を追加しました');
        let year = selectedYear;
        let month = selectedMonth;
        if (salaryDay !== 1) {
          year = month === 1 ? year - 1 : year;
          month = month === 1 ? 12 : month - 1;
        }
        // 現在表示中のユーザーのトランザクションを再取得
        await refreshTransactions(year, month, currentUser?.id);
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

  // タブ変更ハンドラ
  const handleTabChange = (tab: 'expense' | 'income') => {
    setActiveTab(tab);
    setSelectedTag('all');
  };

  // ユーザー切り替えハンドラ
  const handleSwitchUser = async (userId: string) => {
    setCurrentUser(groupMembers.find(member => member.id === userId) || null);
    setMessage('ユーザーを切り替えました');
    let year = selectedYear;
      let month = selectedMonth;
      if (salaryDay !== 1) {
        year = month === 1 ? year - 1 : year;
        month = month === 1 ? 12 : month - 1;
      }
    await refreshTransactions(year, month, userId);
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    const getCurrentPeriod = () => {
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1; // JavaScriptの月は0から始まるので+1
        
        if (salaryDay > 1) {
            const currentDay = now.getDate();
            
            // 現在が給料日以降なら、次の月度に
            if (currentDay >= salaryDay) {
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            }
        }
        
        return { year, month };
    };
    const { year, month } = getCurrentPeriod();
    setSelectedYear(year);
    setSelectedMonth(month);
  }, [userProfile?.salary_day]);

  useEffect(() => {
    if (!user || !groupMembers) return;
    setCurrentUser(groupMembers?.find(member => member.id === user?.id) || null);
  }, [groupMembers])

  // データ初期化監視
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (loading) {
      timeoutId = setTimeout(() => {
        console.warn('ローディングが長時間続いています。強制的に終了します。');
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
  }, [loading, transactions.length, refreshAll, user, selectedYear, selectedMonth]);

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
        <div className={`p-3 rounded-md text-sm ${message.includes('失敗')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
          {message}
        </div>
      )}

      {/* 月選択 */}
      <MonthSelector
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        salaryDay={salaryDay}
        onMonthChange={handleMonthChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-3">
        {/* 月次収支概要 */}
        <MonthSummary
          year={selectedYear}
          month={selectedMonth}
          stats={monthlyStats}
          transactionCount={currentMonthTransactions.length}
          salaryDay={salaryDay}
        />

        {/* 支出内訳 */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">支出の内訳</h2>
          <PieChart data={expenseByTag} />
        </div>
      </div>

      {/* 予算使用率セクション */}
      <BudgetProgress
        userFinance={userFinance}
        expenseByTag={expenseByTag}
        monthlyStats={monthlyStats}
      />

      {/* 取引一覧 */}
      <TransactionList
        year={selectedYear}
        month={selectedMonth}
        transactions={filteredTransactions}
        activeTab={activeTab}
        selectedTag={selectedTag}
        availableTags={availableTags}
        loading={loading}
        onTabChange={handleTabChange}
        onTagChange={setSelectedTag}
      />

      {/* ユーザー切り替えボタン */}
      {userGroup && hasMultipleMembers && currentUser &&(
        <UserSwitcher
          groupMembers={groupMembers}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
        />
      )}

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
      <TransactionModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSubmit={handleTransactionSubmit}
        saving={saving}
      />
    </div>
  );
}
