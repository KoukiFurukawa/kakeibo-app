'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth, useHandleLogout } from '@/utils/manage_supabase';

const Navbar = () => {
    const pathname = usePathname();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const { user, loading, isAuthenticated } = useAuth();

    const navItems = [
        { name: 'ホーム', path: '/' },
        { name: 'ToDo', path: '/todo' },
        { name: 'カレンダー', path: '/calendar' },
        { name: '設定', path: '/settings' },
    ];

    // 仮のお知らせデータ（後で外部から取得）
    const notifications = [
        { id: 1, title: 'システムメンテナンスのお知らせ', date: '2024-01-15', content: '1月20日にシステムメンテナンスを実施します。' },
        { id: 2, title: '新機能追加のお知らせ', date: '2024-01-10', content: 'カレンダー機能が追加されました。' },
    ];

    // 現在のページ名を取得する関数（サブパスにも対応）
    const getCurrentPageName = () => {
        // 設定系のサブページ用の詳細なマッピング
        const detailedMapping: { [key: string]: string } = {
            '/settings': '設定',
            '/settings/profile': '設定',
            '/settings/notifications': '設定',
            '/settings/group': '設定',
            '/settings/finance': '設定',
            '/settings/finance/budget': '設定',
            '/settings/finance/fixed-costs': '設定',
            '/todo': 'ToDo',
            '/calendar': 'カレンダー',
            '/': 'ホーム'
        };

        // 完全一致を最初にチェック
        if (detailedMapping[pathname]) {
            return detailedMapping[pathname];
        }

        // 部分一致でチェック（長いパスから順番に）
        const sortedPaths = Object.keys(detailedMapping).sort((a, b) => b.length - a.length);
        for (const path of sortedPaths) {
            if (path !== '/' && pathname.startsWith(path)) {
                return detailedMapping[path];
            }
        }

        // デフォルトはホーム
        return 'ホーム';
    };

    const handleLogout = useHandleLogout();

    // ローディング中の表示
    if (loading) {
        return (
            <nav className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="font-bold text-xl">家計簿アプリ</div>
                        </div>
                        <div className="flex items-center">
                            <div className="text-sm text-gray-500">読み込み中...</div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        {/* デスクトップ: 家計簿アプリ、モバイル: 現在のページ名 */}
                        <div className="font-bold text-xl">
                            <span className="hidden md:inline">家計簿アプリ</span>
                            <span className="md:hidden">{getCurrentPageName()}</span>
                        </div>
                    </div>

                    {/* デスクトップメニュー */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated && (
                            <div className="flex items-center">
                                {navItems.map((item) => (
                                    <Link
                                        href={item.path}
                                        key={item.path}
                                        className={`px-4 py-2 mx-1 rounded-md ${
                                            // アクティブ判定も修正
                                            (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path))
                                                ? 'bg-blue-500 text-white' 
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                        
                        {isAuthenticated && (
                            <>
                                {/* 通知ベルボタン */}
                                <button
                                    onClick={() => setIsNotificationOpen(true)}
                                    className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                    {notifications.length > 0 && (
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                                    )}
                                </button>

                                {/* User menu */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {user?.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            </>
                        )}
                    </div> 
                    
                    {/* モバイル用通知ボタン */}
                    {isAuthenticated && (
                        <div className="md:hidden flex items-center space-x-2 w-[70%]">
                            <div className="text-sm text-gray-600 w-[80%] truncate text-right">
                                {user?.email ? user.email : 'ログインしていません'}
                            </div>
                            <button
                                onClick={() => setIsNotificationOpen(true)}
                                className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none flex-shrink-0"
                            >
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* お知らせモーダル */}
            {isNotificationOpen && (
                <div className="fixed inset-0 bg-gray-900/50 bg-opacity-50 flex items-center justify-center z-20 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">お知らせ</h3>
                            <button
                                onClick={() => setIsNotificationOpen(false)}
                                className="p-1 rounded-md hover:bg-gray-100"
                            >
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-80">
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="border-b pb-3 last:border-b-0">
                                            <h4 className="font-medium text-sm">{notification.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                                            <p className="text-sm text-gray-700 mt-2">{notification.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">特になし</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
