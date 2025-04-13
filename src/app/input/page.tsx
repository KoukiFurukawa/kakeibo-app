'use client';

import { useState } from 'react';

export default function InputPage() {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [tag, setTag] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [customTag, setCustomTag] = useState('');
    const [showCustomTagInput, setShowCustomTagInput] = useState(false);

    const tags = [
        '食費', '日用品', '交通費', '娯楽', '衣服', '医療', '住居', '水道光熱費', '通信費', '教育', '給料', 'その他'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ここでデータを保存する処理を実装
        alert(`${type === 'income' ? '収入' : '支出'} ${tag}: ${amount}円 (${date})`);
        setTag('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleTagSelection = (selectedTag: string) => {
        if (selectedTag === '新規タグ') {
            setShowCustomTagInput(true);
        } else {
            setTag(selectedTag);
            setShowCustomTagInput(false);
        }
    };

    const handleCustomTagSubmit = () => {
        if (customTag.trim()) {
            setTag(customTag.trim());
            setShowCustomTagInput(false);
            setCustomTag('');
            // 新しいタグをタグリストに追加する処理（必要に応じて）
        }
    };

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">収支の入力</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                    <div className="flex gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'
                                }`}
                        >
                            収入
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'
                                }`}
                        >
                            支出
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                    {showCustomTagInput ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                                placeholder="新しいタグ名"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleCustomTagSubmit}
                                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base whitespace-nowrap"
                            >
                                追加
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleTagSelection(t)}
                                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${tag === t ? 'bg-blue-500 text-white' : 'bg-gray-200'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleTagSelection('新規タグ')}
                                className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm bg-gray-200"
                            >
                                + 新規タグ
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            ¥
                        </span>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 text-sm sm:text-base font-medium"
                >
                    保存
                </button>
            </form>
        </div>
    );
}
