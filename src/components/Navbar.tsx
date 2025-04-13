'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const Navbar = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'ホーム', path: '/' },
        { name: '入力', path: '/input' },
        { name: '固定費', path: '/fixed-costs' },
        { name: 'カレンダー', path: '/calendar' },
    ];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="font-bold text-xl">家計簿アプリ</Link>
                    </div>

                    {/* デスクトップメニュー */}
                    <div className="hidden md:flex items-center">
                        {navItems.map((item) => (
                            <Link
                                href={item.path}
                                key={item.path}
                                className={`px-4 py-2 mx-1 rounded-md ${
                                    pathname === item.path 
                                        ? 'bg-blue-500 text-white' 
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* モバイルメニューボタン - モバイルではフッターを使用するため非表示に */}
                    <div className="md:hidden flex items-center opacity-0">
                        <button
                            className="p-2 rounded-md focus:outline-none"
                            disabled
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* モバイルメニューは削除（フッターに置き換え） */}
        </nav>
    );
};

export default Navbar;
