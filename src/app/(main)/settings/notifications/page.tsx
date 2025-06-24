'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import NotificationSettings from '@/components/NotificationSettings';
import Link from 'next/link';
import { UserService } from '@/services/userService';

export default function NotificationsPage() {
    const { user, notificationSettings, refreshNotificationSettings } = useUser();
    const [localSettings, setLocalSettings] = useState({
        todo: false,
        event: false,
        system: false
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (notificationSettings) {
            setLocalSettings(notificationSettings);
        }
    }, [notificationSettings]);

    const handleToggle = (key: 'todo' | 'event' | 'system') => {
        const newSettings = {
            ...localSettings,
            [key]: !localSettings[key]
        };
        setLocalSettings(newSettings);
        
        // Check if there are changes compared to original settings
        const hasChanges = notificationSettings ? 
            Object.keys(newSettings).some(k => newSettings[k as keyof typeof newSettings] !== notificationSettings[k as keyof typeof notificationSettings]) :
            Object.values(newSettings).some(v => v);
        setHasChanges(hasChanges);
    };

    const handleSave = async () => {
        if (!user)
        {
            console.error('User is not logged in');
            return;
        }
        try {
            await UserService.updateNotificationSettings(user.id, localSettings);
            setHasChanges(false);
            await refreshNotificationSettings(); // Refresh settings after save
        } catch (error) {
            console.error('Failed to save notification settings:', error);
        }
    };

    const notificationItems = [
        {
            key: 'todo' as const,
            title: 'ToDo通知',
            description: '期限が近いToDoを通知',
            enabled: localSettings?.todo
        },
        {
            key: 'event' as const,
            title: 'カレンダー通知',
            description: '本日のカレンダー情報を通知',
            enabled: localSettings?.event
        },
        {
            key: 'system' as const,
            title: 'システム通知',
            description: 'アプリの重要なお知らせや更新情報',
            enabled: localSettings?.system
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">通知</h1>            </div>

            {/* PWA Push Notifications */}
            <NotificationSettings />

            {/* App Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">アプリ内通知設定</h2>
                    <p className="text-sm text-gray-500 mt-1">アプリ内で表示される通知の設定を変更できます</p>
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

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        hasChanges
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    保存
                </button>
            </div>
        </div>
    );
}
