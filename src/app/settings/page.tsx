'use client';

import { useState } from 'react';

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

    const handleSave = () => {
        // 設定を保存する処理を実装
        alert('設定が保存されました');
    };

    const handleExportData = () => {
        // データエクスポート処理を実装
        alert('データをエクスポートしました');
    };

    const handleImportData = () => {
        // データインポート処理を実装
        alert('データをインポートしました');
    };

    const handleResetData = () => {
        if (confirm('全てのデータが削除されます。本当に実行しますか？')) {
            alert('データをリセットしました');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold">設定</h1>

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

            {/* テーマ設定 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">外観設定</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">テーマ</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleInputChange('theme', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        >
                            <option value="light">ライト</option>
                            <option value="dark">ダーク</option>
                            <option value="auto">システム設定に従う</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">自動バックアップ</span>
                        <input
                            type="checkbox"
                            checked={settings.autoBackup}
                            onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                            className="h-4 w-4"
                        />
                    </div>
                </div>
            </div>

            {/* データ管理 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">データ管理</h2>
                
                <div className="space-y-3">
                    <button
                        onClick={handleExportData}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 text-sm sm:text-base"
                    >
                        データをエクスポート
                    </button>

                    <button
                        onClick={handleImportData}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-sm sm:text-base"
                    >
                        データをインポート
                    </button>

                    <button
                        onClick={handleResetData}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 text-sm sm:text-base"
                    >
                        全データをリセット
                    </button>
                </div>
            </div>

            {/* 保存ボタン */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 text-sm sm:text-base font-medium"
                >
                    設定を保存
                </button>
            </div>

            {/* アプリ情報 */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">アプリ情報</h2>
                <div className="text-sm sm:text-base text-gray-600 space-y-1">
                    <p>バージョン: 1.0.0</p>
                    <p>最終更新: 2024年1月</p>
                    <p>開発者: GitHub Copilot</p>
                </div>
            </div>
        </div>
    );
}
