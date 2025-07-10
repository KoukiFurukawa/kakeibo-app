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
				className={`w-6 h-6 mx-auto ${
					isActive ? "text-blue-500" : "text-gray-500"
				}`}
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
				className={`w-6 h-6 mx-auto ${
					isActive ? "text-blue-500" : "text-gray-500"
				}`}
			>
				<path d="M9 11l3 3 8-8" />
				<path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.84 0 3.55.56 4.96 1.51" />
			</svg>
		),
	},
	{
		name: "ほしいもの",
		path: "/wishlist",
		icon: (isActive: boolean) => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={`w-6 h-6 mx-auto ${
					isActive ? "text-pink-500" : "text-gray-500"
				}`}
			>
				<path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
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
				className={`w-6 h-6 mx-auto ${
					isActive ? "text-blue-500" : "text-gray-500"
				}`}
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

