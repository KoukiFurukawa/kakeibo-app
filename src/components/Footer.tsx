"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// フッターに表示するアイテムとそのアイコン
const footerItems = [
  {
    name: "ホーム",
    path: "/",
    icon: (isActive: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-6 h-6 mx-auto ${isActive ? "text-blue-500" : "text-gray-500"}`}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "ToDo",
    path: "/todo",
    icon: (isActive: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-6 h-6 mx-auto ${isActive ? "text-blue-500" : "text-gray-500"}`}
      >
        <path d="M9 11l3 3 8-8" />
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.84 0 3.55.56 4.96 1.51" />
      </svg>
    ),
  },
  {
    name: "カレンダー",
    path: "/calendar",
    icon: (isActive: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-6 h-6 mx-auto ${isActive ? "text-blue-500" : "text-gray-500"}`}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    name: "設定",
    path: "/settings",
    icon: (isActive: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-6 h-6 mx-auto ${isActive ? "text-blue-500" : "text-gray-500"}`}
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
      </svg>
    ),
  },
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
              className={`flex flex-col items-center justify-center ${
                isActive ? "text-blue-500" : "text-gray-500"
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
