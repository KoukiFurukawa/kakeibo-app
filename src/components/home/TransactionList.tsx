import { Transaction } from "@/types/transaction";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi"; // React Icons から編集アイコンをインポート

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
    onEditTransaction?: (transaction: Transaction) => void;
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
    onTagChange,
    onEditTransaction
}) => {
    // 説明を開いたトランザクションのIDを保持する状態
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

    // 説明の展開/折りたたみを切り替える関数
    const toggleDescription = (id: string) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // 説明テキストを切り詰める関数
    const truncateText = (text: string, maxLength: number = 40) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

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

            {/* デスクトップ表示: テーブル */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ</th>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                            {onEditTransaction && (
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.length === 0 ? (
                            <tr>
                                <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500" colSpan={onEditTransaction ? 5 : 4}>
                                    {loading ? '読み込み中...' : `${activeTab === 'expense' ? '支出' : '収入'}データがありません`}
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                        {new Date(transaction.date || transaction.created_at).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-xs">
                                        <div className="font-medium">{transaction.title}</div>
                                        {transaction.description && (
                                            <div className="text-xs text-gray-500 mt-1 break-words">
                                                {transaction.description.length > 50 ? (
                                                    <>
                                                        {expandedDescriptions.has(transaction.id) 
                                                            ? transaction.description 
                                                            : truncateText(transaction.description)
                                                        }
                                                        <button 
                                                            onClick={() => toggleDescription(transaction.id)}
                                                            className="text-blue-500 hover:text-blue-700 text-xs ml-1"
                                                        >
                                                            {expandedDescriptions.has(transaction.id) ? '折りたたむ' : 'もっと見る'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    transaction.description
                                                )}
                                            </div>
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
                                    {onEditTransaction && (
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => onEditTransaction(transaction)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FiEdit2 className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* モバイル表示: カードUI */}
            <div className="md:hidden">
                {transactions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        {loading ? '読み込み中...' : `${activeTab === 'expense' ? '支出' : '収入'}データがありません`}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center">
                                            <h3 className="font-medium text-gray-900 text-sm">
                                                {transaction.title.length > 12 
                                                    ? truncateText(transaction.title, 12) 
                                                    : transaction.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <p className="text-xs text-gray-500">
                                                {new Date(transaction.date || transaction.created_at).toLocaleDateString('ja-JP')}
                                            </p>
                                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {transaction.tag}
                                            </span>
                                        </div>
                                        
                                        {transaction.description && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {transaction.description.length > 15 ? (
                                                    <>
                                                        {expandedDescriptions.has(transaction.id) 
                                                            ? transaction.description 
                                                            : truncateText(transaction.description, 15)
                                                        }
                                                    </>
                                                ) : (
                                                    transaction.description
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <span className={`font-medium ${transaction.is_income ? 'text-green-600' : 'text-red-600'} text-sm mr-15 mt-4`}>
                                        {transaction.is_income ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                                    </span>
                                </div>
                                
                                {onEditTransaction && (
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={() => onEditTransaction(transaction)}
                                            className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-200"
                                            aria-label="編集"
                                        >
                                            <FiEdit2 className="w-4 h-4 text-blue-600" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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
