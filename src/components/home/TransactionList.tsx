import { Transaction } from "@/types/transaction";

interface TransactionListProps {
    year: number;
    month: number;
    transactions: Transaction[];
    activeTab: 'expense' | 'income';
    selectedTag: string;
    availableTags: string[];
    loading: boolean;
    onTabChange: (tab: 'expense' | 'income') => void;
    onTagChange: (tag: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
    year,
    month,
    transactions,
    activeTab,
    selectedTag,
    availableTags,
    loading,
    onTabChange,
    onTagChange
}) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">{year}年{month}月の取引</h2>

                {/* タブ切り替え */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onTabChange('expense')}
                        className={`px-3 py-1 rounded text-sm ${activeTab === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'
                            }`}
                    >
                        支出
                    </button>
                    <button
                        onClick={() => onTabChange('income')}
                        className={`px-3 py-1 rounded text-sm ${activeTab === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'
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
                        onChange={(e) => onTagChange(e.target.value)}
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
                        {transactions.length === 0 ? (
                            <tr>
                                <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500" colSpan={4}>
                                    {loading ? '読み込み中...' : `${activeTab === 'expense' ? '支出' : '収入'}データがありません`}
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                        {new Date(transaction.date || transaction.created_at).toLocaleDateString('ja-JP')}
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

            {transactions.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    {transactions.length}件の取引を表示
                </div>
            )}
        </div>
    );
};

export default TransactionList;
