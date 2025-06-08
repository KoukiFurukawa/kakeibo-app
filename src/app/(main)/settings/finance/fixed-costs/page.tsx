'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function FixedCostsPage() {
    const { fixedCosts, addFixedCost, updateFixedCost, deleteFixedCost, fetchFixedCosts, loading } = useUser();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [tag, setTag] = useState('');
    const [paymentDay, setPaymentDay] = useState('1');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const tags = [
        '住居費', '水道光熱費', '通信費', '保険料', 'サブスクリプション', 'ローン', 'その他'
    ];

    useEffect(() => {
        fetchFixedCosts();
    }, []);

    const handleSubmit = async (e: React.FormEvent, continueAdding = false) => {
        e.preventDefault();

        if (!name.trim() || !tag || !amount || Number(amount) <= 0 || !paymentDay || Number(paymentDay) < 1 || Number(paymentDay) > 31) {
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            if (editingId) {
                const success = await updateFixedCost(editingId, {
                    title: name,
                    cost: Number(amount),
                    tag,
                    debit_date: Number(paymentDay)
                });

                if (success) {
                    setEditingId(null);
                    setShowForm(false);
                    setMessage('固定費を更新しました');
                } else {
                    setMessage('更新に失敗しました。もう一度お試しください。');
                }
            } else {
                const newFixedCost = await addFixedCost({
                    title: name,
                    cost: Number(amount),
                    tag,
                    debit_date: Number(paymentDay)
                });

                if (newFixedCost) {
                    if (!continueAdding) {
                        setShowForm(false);
                    }
                    setMessage('固定費を追加しました');
                } else {
                    setMessage('追加に失敗しました。もう一度お試しください。');
                }
            }

            setName('');
            setAmount('');
            setTag('');
            setPaymentDay('1');

            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('固定費保存エラー:', error);
            setMessage('保存に失敗しました。もう一度お試しください。');
        } finally {
            setSaving(false);
        }
    };

    const handleContinueAdding = async () => {
        if (!name.trim() || !tag || !amount || Number(amount) <= 0 || !paymentDay || Number(paymentDay) < 1 || Number(paymentDay) > 31) {
            const form = document.querySelector('form');
            if (form) {
                form.reportValidity();
            }
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const newFixedCost = await addFixedCost({
                title: name,
                cost: Number(amount),
                tag,
                debit_date: Number(paymentDay)
            });

            if (newFixedCost) {
                setName('');
                setAmount('');
                setTag('');
                setPaymentDay('1');
                setMessage('固定費を追加しました');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('追加に失敗しました。もう一度お試しください。');
            }
        } catch (error) {
            console.error('固定費保存エラー:', error);
            setMessage('保存に失敗しました。もう一度お試しください。');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cost: any) => {
        setEditingId(cost.id);
        setName(cost.title);
        setAmount(cost.cost.toString());
        setTag(cost.tag);
        setPaymentDay(cost.debit_date.toString());
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この固定費を削除しますか？')) return;

        const success = await deleteFixedCost(id);
        if (success) {
            setMessage('固定費を削除しました');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('削除に失敗しました。もう一度お試しください。');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
        setAmount('');
        setTag('');
        setPaymentDay('1');
        setShowForm(false);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setName('');
        setAmount('');
        setTag('');
        setPaymentDay('1');
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="space-y-4 sm:space-y-6 pb-20">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/finance" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">固定費設定</h1>
                </div>
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                    <div className="text-center text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <div className="flex items-center space-x-4">
                <Link href="/settings/finance" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">固定費設定</h1>
            </div>

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

            {/* 固定費リスト */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">固定費リスト</h2>
                    <p className="text-sm text-gray-500 mt-1">登録済みの固定費一覧</p>
                </div>
                <div className="p-4">
                    {fixedCosts.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-sm mt-2">固定費はまだ登録されていません</p>
                            <p className="text-gray-400 text-xs mt-1">右下の + ボタンから追加してください</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {fixedCosts.map((cost) => (
                                <div key={cost.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="font-medium text-gray-900">{cost.title}</h3>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {cost.tag}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span className="font-semibold text-lg text-gray-900">¥{cost.cost.toLocaleString()}</span>
                                                <span>毎月{cost.debit_date}日</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(cost)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-md"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cost.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 浮動追加ボタン */}
            <button
                onClick={handleAddNew}
                className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors z-20"
            >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>

            {/* フォームモーダル */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-30 p-4">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    {editingId ? '固定費を編集' : '新しい固定費を追加'}
                                </h2>
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

                        <form onSubmit={(e) => handleSubmit(e)} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                                    placeholder="例: 家賃、携帯料金"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
                                <select
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                                    required
                                >
                                    <option value="">カテゴリーを選択</option>
                                    {tags.map((t) => (
                                        <option key={t} value={t}>{t}</option>
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
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">引き落とし日</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={paymentDay}
                                    onChange={(e) => setPaymentDay(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                                    placeholder="1"
                                    min="1"
                                    max="31"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`flex-1 py-3 px-4 rounded-md font-medium text-sm ${
                                        saving
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {saving ? '保存中...' : (editingId ? '更新' : '保存')}
                                </button>

                                {!editingId && (
                                    <button
                                        type="button"
                                        onClick={handleContinueAdding}
                                        disabled={saving}
                                        className={`flex-1 py-3 px-4 rounded-md font-medium text-sm ${
                                            saving
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        {saving ? '保存中...' : '保存して続ける'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
