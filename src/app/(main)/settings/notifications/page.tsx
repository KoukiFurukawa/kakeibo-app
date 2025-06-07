'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
    const [settings, setSettings] = useState({
        expenseReminder: true,
        budgetAlert: true,
        monthlyReport: false,
        goalProgress: true
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const notificationItems = [
        {
            key: 'expenseReminder' as const,
            title: '支出入力リマインダー',
            description: '支出の入力を忘れたときに通知',
            enabled: settings.expenseReminder
        },
        {
            key: 'budgetAlert' as const,
            title: '予算超過アラート',
            description: '予算を超えそうなときに通知',
            enabled: settings.budgetAlert
        },
        {
            key: 'monthlyReport' as const,
            title: '月次レポート',
            description: '月末に家計の振り返りレポートを送信',
            enabled: settings.monthlyReport
        },
        {
            key: 'goalProgress' as const,
            title: '目標達成進捗',
            description: '貯金目標の達成状況を通知',
            enabled: settings.goalProgress
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">通知</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">通知設定</h2>
                    <p className="text-sm text-gray-500 mt-1">受け取りたい通知を選択してください</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {notificationItems.map((item) => (
                        <div key={item.key} className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            </div>
                            <button
                                onClick={() => handleToggle(item.key)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    item.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        item.enabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
