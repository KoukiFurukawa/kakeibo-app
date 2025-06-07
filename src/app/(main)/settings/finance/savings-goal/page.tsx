'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function SavingsGoalPage() {
    const { userProfile, loading: userLoading, updateUserProfile } = useUser();
    const [monthlyGoal, setMonthlyGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // ユーザープロフィールが読み込まれたら初期値を設定
    useEffect(() => {
        if (userProfile) {
            setMonthlyGoal(userProfile.target_month_savings?.toString() || '');
        }
    }, [userProfile]);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        try {
            const success = await updateUserProfile({
                target_month_savings: monthlyGoal ? Number(monthlyGoal) : 0,
            });

            if (success) {
                setMessage(`月の貯金目標を¥${Number(monthlyGoal).toLocaleString()}に設定しました`);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('設定の保存に失敗しました。もう一度お試しください。');
            }
        } catch (error) {
            console.error('貯金目標設定エラー:', error);
            setMessage('設定の保存に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/finance" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">貯金目標</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings/finance" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">貯金目標</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">月の貯金目標額</h2>
                    <p className="text-sm text-gray-500 mt-1">毎月の貯金目標額を設定してください</p>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">目標額</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                ¥
                            </span>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={monthlyGoal}
                                onChange={(e) => setMonthlyGoal(e.target.value)}
                                className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                                placeholder="50000"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* メッセージ表示 */}
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${
                            message.includes('設定しました') 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">貯金目標について</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>設定した目標額は家計簿のダッシュボードで進捗として表示されます。現実的な目標を設定することをおすすめします。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
