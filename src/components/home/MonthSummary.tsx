import { IMonthlyStats } from "@/types/transaction";

interface IMonthSummaryProps {
    year: number;
    month: number;
    stats: IMonthlyStats;
    transactionCount: number;
    salaryDay?: number;
}

const MonthSummary: React.FC<IMonthSummaryProps> = ({ year, month, stats, transactionCount, salaryDay = 1 }) => {
    // 給料日ベースの期間を計算
    const formatPeriod = () => {
        if (salaryDay === 1) {
            // 給料日が1日の場合は通常の月表示
            return `${year}年${month}月の収支`;
        }

        // 開始日: 前月の給料日
        const startMonth = month === 1 ? 12 : month - 1;
        const startYear = month === 1 ? year - 1 : year;
        
        // 終了日: 当月の給料日前日
        const endDate = new Date(year, month - 1, salaryDay - 1);
        
        return `${startYear}/${startMonth}/${salaryDay} ~ ${year}/${month}/${salaryDay - 1} の収支`;
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{formatPeriod()}</h2>
            <div className="flex justify-between">
                <div>
                    <p className="text-xs sm:text-sm text-gray-500">収入</p>
                    <p className="text-base sm:text-lg font-bold text-green-600">¥{stats.income.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm text-gray-500">支出</p>
                    <p className="text-base sm:text-lg font-bold text-red-600">¥{stats.expense.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm text-gray-500">残高</p>
                    <p className={`text-base sm:text-lg font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ¥{stats.balance.toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
                取引件数: {transactionCount}件
            </div>
        </div>
    );
};

export default MonthSummary;
