'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// フッターに表示するアイテムとそのアイコン
const footerItems = [
    {
        name: 'ホーム',
        path: '/',
        icon: (isActive: boolean) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 mx-auto ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )
    },
    {
        name: '入力',
        path: '/input',
        icon: (isActive: boolean) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 mx-auto ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        )
    },
    {
        name: '固定費',
        path: '/fixed-costs',
        icon: (isActive: boolean) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 mx-auto ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        )
    },
    {
        name: 'カレンダー',
        path: '/calendar',
        icon: (isActive: boolean) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 mx-auto ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    }
];

export default function Footer() {
    const pathname = usePathname();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden">
            <div className="grid grid-cols-4 h-16">
                {footerItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            href={item.path}
                            key={item.path}
                            className={`flex flex-col items-center justify-center ${isActive ? 'text-blue-500' : 'text-gray-500'
                                }`}
                        >
                            {item.icon(isActive)}
                            <span className="text-xs mt-1 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </footer>
    );
}
