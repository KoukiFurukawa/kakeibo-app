'use client';

import Link from 'next/link';

const settingsCategories = [
    {
        title: 'プロフィール',
        description: 'ユーザー情報・アカウント設定',
        href: '/settings/profile',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        bgColor: 'bg-blue-500'
    },
    {
        title: '通知',
        description: '通知の設定・管理',
        href: '/settings/notifications',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        bgColor: 'bg-red-500'
    },
    {
        title: '家計管理',
        description: '貯金目標・固定費設定',
        href: '/settings/finance',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
        ),
        bgColor: 'bg-green-500'
    },
    {
        title: 'グループ',
        description: 'グループ作成・参加・管理',
        href: '/settings/group',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        bgColor: 'bg-purple-500'
    },
    {
        title: 'アプリ情報',
        description: 'バージョン・利用規約・お問い合わせ',
        href: '/settings/about',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        bgColor: 'bg-gray-500'
    }
];

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-4 mt-3">
                {settingsCategories.map((category) => (
                    <Link
                        key={category.href}
                        href={category.href}
                        className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <div className="p-4 flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${category.bgColor} text-white flex-shrink-0`}>
                                {category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-medium text-gray-900">{category.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
