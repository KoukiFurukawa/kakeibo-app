'use client';

import { useState } from 'react';
import { useHandleLogout } from '@/utils/manage_supabase';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        username: '',
        currency: 'JPY',
        language: 'ja',
        notifications: {
            income: true,
            expense: true,
            todo: true,
            monthlyReport: true,
        },
        theme: 'light',
        budgetLimit: '',
        autoBackup: true,
    });

    const handleInputChange = (field: string, value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNotificationChange = (field: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [field]: value
            }
        }));
    };

    const handleLogout = useHandleLogout();

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* 基本設定 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">基本設定</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ユーザー名</label>
                        <input
                            type="text"
                            value={settings.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                            placeholder="ユーザー名を入力"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">通貨</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        >
                            <option value="JPY">日本円 (¥)</option>
                            <option value="USD">米ドル ($)</option>
                            <option value="EUR">ユーロ (€)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">言語</label>
                        <select
                            value={settings.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        >
                            <option value="ja">日本語</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">月予算上限</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                ¥
                            </span>
                            <input
                                type="number"
                                value={settings.budgetLimit}
                                onChange={(e) => handleInputChange('budgetLimit', e.target.value)}
                                className="w-full pl-8 p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 通知設定 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">通知設定</h2>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">収入記録時の通知</span>
                        <input
                            type="checkbox"
                            checked={settings.notifications.income}
                            onChange={(e) => handleNotificationChange('income', e.target.checked)}
                            className="h-4 w-4"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">支出記録時の通知</span>
                        <input
                            type="checkbox"
                            checked={settings.notifications.expense}
                            onChange={(e) => handleNotificationChange('expense', e.target.checked)}
                            className="h-4 w-4"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">ToDo期限の通知</span>
                        <input
                            type="checkbox"
                            checked={settings.notifications.todo}
                            onChange={(e) => handleNotificationChange('todo', e.target.checked)}
                            className="h-4 w-4"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">月次レポートの通知</span>
                        <input
                            type="checkbox"
                            checked={settings.notifications.monthlyReport}
                            onChange={(e) => handleNotificationChange('monthlyReport', e.target.checked)}
                            className="h-4 w-4"
                        />
                    </div>
                </div>
            </div>

            {/* アカウント管理 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">アカウント管理</h2>
                
                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 text-sm sm:text-base"
                    >
                        ログアウト
                    </button>
                </div>
            </div>

            {/* アプリ情報 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">アプリ情報</h2>
                <div className="text-sm sm:text-base text-gray-600 space-y-1">
                    <p>バージョン: 0.0.1</p>
                    <p>最終更新: 2025年6月</p>
                </div>
            </div>
        </div>
    );
}
