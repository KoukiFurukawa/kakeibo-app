import { MonthlyStats } from "@/types/transaction";

interface MonthSummaryProps {
    year: number;
    month: number;
    stats: MonthlyStats;
    transactionCount: number;
}

const MonthSummary: React.FC<MonthSummaryProps> = ({ year, month, stats, transactionCount }) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{year}年{month}月の収支</h2>
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
