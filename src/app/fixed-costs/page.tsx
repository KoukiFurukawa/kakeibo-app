'use client';

import { useState } from 'react';

interface FixedCost {
    id: string;
    name: string;
    amount: number;
    tag: string;
    paymentDay: number;
}

export default function FixedCostsPage() {
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [tag, setTag] = useState('');
    const [paymentDay, setPaymentDay] = useState('1');
    const [editingId, setEditingId] = useState<string | null>(null);

    const tags = [
        '住居費', '水道光熱費', '通信費', '保険料', 'subscriptions', 'ローン', 'その他'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            // 編集モード
            setFixedCosts(fixedCosts.map(cost =>
                cost.id === editingId
                    ? { ...cost, name, amount: Number(amount), tag, paymentDay: Number(paymentDay) }
                    : cost
            ));
            setEditingId(null);
        } else {
            // 新規追加モード
            const newFixedCost: FixedCost = {
                id: Date.now().toString(),
                name,
                amount: Number(amount),
                tag,
                paymentDay: Number(paymentDay),
            };
            setFixedCosts([...fixedCosts, newFixedCost]);
        }

        // フォームをリセット
        setName('');
        setAmount('');
        setTag('');
        setPaymentDay('1');
    };

    const handleEdit = (cost: FixedCost) => {
        setEditingId(cost.id);
        setName(cost.name);
        setAmount(cost.amount.toString());
        setTag(cost.tag);
        setPaymentDay(cost.paymentDay.toString());
    };

    const handleDelete = (id: string) => {
        setFixedCosts(fixedCosts.filter(cost => cost.id !== id));
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
        setAmount('');
        setTag('');
        setPaymentDay('1');
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold">固定費設定</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                    {editingId ? '固定費を編集' : '新しい固定費を追加'}
                </h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">名前</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        placeholder="例: 家賃、携帯料金"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">カテゴリー</label>
                    <select
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        required
                    >
                        <option value="">カテゴリーを選択</option>
                        {tags.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">金額</label>
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">引き落とし日</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        value={paymentDay}
                        onChange={(e) => setPaymentDay(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        placeholder="1"
                        min="1"
                        max="31"
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex-1 text-sm sm:text-base"
                    >
                        {editingId ? '更新' : '追加'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 text-sm sm:text-base"
                        >
                            キャンセル
                        </button>
                    )}
                </div>
            </form>

            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">固定費リスト</h2>
                {fixedCosts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">固定費はまだ登録されていません</p>
                ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリー</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">引き落とし日</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fixedCosts.map((cost) => (
                                    <tr key={cost.id}>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{cost.name}</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{cost.tag}</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{cost.paymentDay}日</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">¥{cost.amount.toLocaleString()}</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap space-x-1 sm:space-x-2 text-xs sm:text-sm">
                                            <button
                                                onClick={() => handleEdit(cost)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cost.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
