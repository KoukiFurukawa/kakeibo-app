'use client';

import Link from 'next/link';

const aboutItems = [
    {
        title: 'バージョン',
        value: '0.0.1',
        description: '現在のアプリバージョン'
    },
    {
        title: '最終更新',
        value: '2025年1月',
        description: 'アプリの最終更新日'
    },
    {
        title: '開発者',
        value: 'Kakeibo Team',
        description: 'アプリケーションの開発チーム'
    }
];

const linkItems = [
    {
        title: '利用規約',
        href: '#',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    },
    {
        title: 'プライバシーポリシー',
        href: '#',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    },
    {
        title: 'お問い合わせ',
        href: '#',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        )
    }
];

export default function AboutPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">アプリ情報</h1>
            </div>

            {/* アプリ情報 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">アプリケーション情報</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {aboutItems.map((item, index) => (
                        <div key={index} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                </div>
                                <span className="text-sm text-gray-600 font-medium">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* リンク */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">サポート</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {linkItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="block p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="text-blue-500">
                                        {item.icon}
                                    </div>
                                    <span className="text-base font-medium text-gray-900">{item.title}</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
