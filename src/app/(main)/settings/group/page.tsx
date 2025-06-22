'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function GroupSettingsPage() {
    const { userGroup, loading, updateUserGroup, leaveGroup } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showCreateSuccess, setShowCreateSuccess] = useState(false);
    const [leavingGroup, setLeavingGroup] = useState(false);
    const [error, setError] = useState('');
    
    // クエリパラメータからの成功メッセージ表示
    useEffect(() => {
        if (searchParams?.get('created') === 'true') {
            setShowCreateSuccess(true);
            setTimeout(() => {
                setShowCreateSuccess(false);
            }, 5000);
        }
    }, [searchParams]);

    // グループに参加している場合のアクション
    const memberActions = [
        {
            title: 'グループ管理',
            description: 'メンバー管理や設定の変更',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            action: () => router.push('/settings/group/manage')
        },
        {
            title: 'メンバーを招待',
            description: '招待コードで他のユーザーを招待',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            action: () => router.push('/settings/group/invite')
        }
    ];

    // グループに参加していない場合のアクション
    const nonMemberActions = [
        {
            title: 'グループを新規作成',
            description: '新しい家計簿グループを作成',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            action: () => router.push('/settings/group/create')
        },
        {
            title: 'グループに参加',
            description: '招待コードでグループに参加',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            action: () => router.push('/settings/group/join')
        }
    ];

    const handleLeaveGroup = async () => {
        if (confirm('本当にグループから離脱しますか？\n\n管理者の場合、グループは削除されます。')) {
            setLeavingGroup(true);
            setError('');
            
            try {
                const success = await leaveGroup();
                if (!success) {
                    setError('グループからの離脱に失敗しました。');
                }
            } catch (err: any) {
                setError(err.message || 'エラーが発生しました');
            } finally {
                setLeavingGroup(false);
            }
        }
    };

    // ローディング中の表示
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">グループ</h1>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-500">読み込み中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">グループ</h1>
            </div>

            {showCreateSuccess && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                グループを作成しました！
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {userGroup ? (
                // グループに参加している場合
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h3 className="text-lg font-medium mb-2">参加中のグループ</h3>
                        <div className="bg-blue-50 rounded-md p-4">
                            <h4 className="font-bold text-lg">{userGroup.group_name}</h4>
                            {userGroup.description && (
                                <p className="text-sm text-gray-600 mt-1">{userGroup.description}</p>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                                {userGroup.author_user_id === userGroup.author_user_id ? 
                                    "あなたはこのグループの管理者です" : 
                                    "あなたはこのグループのメンバーです"
                                }
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {memberActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="w-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                            >
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-blue-500">
                                            {action.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900">{action.title}</h3>
                                            <p className="text-sm text-gray-500">{action.description}</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={handleLeaveGroup}
                            disabled={leavingGroup}
                            className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
                        >
                            {leavingGroup ? '処理中...' : 'グループから離脱する'}
                        </button>
                    </div>
                </div>
            ) : (
                // グループに参加していない場合
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-medium">グループに参加していません</h3>
                                <p className="text-sm text-gray-500">新しいグループを作成するか、招待から参加してください。</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {nonMemberActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="w-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                            >
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-blue-500">
                                            {action.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900">{action.title}</h3>
                                            <p className="text-sm text-gray-500">{action.description}</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">グループ機能について</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>グループ機能を使用すると、家族や友人と家計簿を共有できます。一部の機能は開発中です。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
