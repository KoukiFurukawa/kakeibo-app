import { TransactionInput } from "@/types/transaction";
import { useState } from "react";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TransactionInput) => Promise<void>;
    saving: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit, saving }) => {
    const [inputType, setInputType] = useState<'income' | 'expense'>('expense');
    const [inputTitle, setInputTitle] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [inputAmount, setInputAmount] = useState('');
    const [inputTag, setInputTag] = useState('');
    const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);

    const tags = [
        '食費', '日用品', '交通費', '娯楽', '衣服', '医療', '住居', '水道光熱費', '通信費', '教育', '給料', 'その他'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputTitle.trim() || !inputTag || !inputAmount || Number(inputAmount) <= 0) {
            return;
        }

        await onSubmit({
            title: inputTitle,
            description: inputDescription,
            amount: Number(inputAmount),
            tag: inputTag,
            is_income: inputType === 'income',
            date: inputDate
        });

        // リセット
        resetForm();
    };

    const resetForm = () => {
        setInputTitle('');
        setInputDescription('');
        setInputAmount('');
        setInputTag('');
        setInputDate(new Date().toISOString().split('T')[0]);
        setInputType('expense');
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">収支を追加</h2>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setInputType('income')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm ${inputType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'
                                    }`}
                            >
                                収入
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('expense')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm ${inputType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                        <input
                            type="date"
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm"
                            required
                        />
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
                            onClick={handleCancel}
                            className="flex-1 py-3 px-4 rounded-md font-medium text-sm bg-gray-300 text-gray-800 hover:bg-gray-400"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex-1 py-3 px-4 rounded-md font-medium text-sm ${saving
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
    );
};

export default TransactionModal;
