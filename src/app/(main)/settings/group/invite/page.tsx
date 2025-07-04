'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { GroupService } from '@/services/groupService';

export default function InviteGroupPage() {
    const router = useRouter();
    const { user, userGroup, loading } = useUser();
    
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // 管理者権限の確認
    const isAdmin = userGroup?.author_user_id === user?.id;

    // 招待コードの生成
    const handleGenerateCode = async () => {
        setIsGenerating(true);
        setError('');

        if (!user || !userGroup) {
            setError('ユーザー情報が取得できません。再度ログインしてください。');
            setIsGenerating(false);
            return;
        }
        
        try {
            const code = await GroupService.generateInviteCode(user.id, userGroup.id);
            if (code) {
                setInviteCode(code);
            } else {
                throw new Error('招待コードの生成に失敗しました');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || '招待コードの生成に失敗しました');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // 招待リンクのコピー
    const copyInviteLink = () => {
        if (!inviteCode) return;
        
        const inviteLink = `${window.location.origin}/settings/group/join?code=${inviteCode}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('コピーに失敗しました:', err);
        });
    };

     // ユーザーがグループに所属しているか確認
    useEffect(() => {
        if (!loading && !userGroup) {
            router.push('/settings/group');
        }
    }, [loading, userGroup, router]);

    // ローディング中
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/group/manage" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">グループ招待</h1>
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

    // グループが存在しない場合
    if (!userGroup) {
        return null; // リダイレクト中
    }

    // 管理者でない場合
    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">グループ招待</h1>
                </div>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <p className="text-yellow-800">
                        グループの管理者のみが招待コードを生成できます。
                    </p>
                    <div className="mt-4">
                        <Link 
                            href="/settings/group" 
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            グループ設定に戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings/group/manage" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">グループ招待</h1>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 招待コード生成セクション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">招待コード生成</h2>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-600">
                        他のユーザーを「{userGroup.group_name}」グループに招待できます。
                        招待コードは7日間有効です。
                    </p>

                    {inviteCode ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">招待コード</h3>
                                <div className="bg-white p-3 rounded border border-gray-300 font-mono text-lg text-center">
                                    {inviteCode}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    このコードを共有して、他のユーザーをグループに招待できます。
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">招待リンク</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/settings/group/join?code=${inviteCode}`}
                                        className="w-full p-3 pr-20 border border-gray-300 rounded-md text-sm bg-white"
                                    />
                                    <button
                                        onClick={copyInviteLink}
                                        className="absolute right-2 top-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                    >
                                        {copied ? 'コピー済み' : 'コピー'}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    このリンクを共有して、他のユーザーを直接招待できます。
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleGenerateCode}
                                    disabled={isGenerating}
                                    className="bg-blue-500 text-white py-2 px-4 my-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex-1"
                                >
                                    {isGenerating ? '生成中...' : '新しく生成'}
                                </button>
                                <Link
                                    href="/settings/group/manage"
                                    className="bg-gray-200 text-gray-800 py-2 px-4 my-2 rounded-md hover:bg-gray-300 text-center flex-1"
                                >
                                    管理画面に戻る
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={handleGenerateCode}
                                disabled={isGenerating}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isGenerating ? '生成中...' : '招待コードを生成'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 招待の説明 */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">グループ招待について</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>招待コードは7日間のみ有効です</li>
                    <li>コードが漏洩した場合は、すぐに新しいコードを生成してください</li>
                    <li>グループに参加したメンバーは、グループの支出データにアクセスできます</li>
                    <li>管理者としてグループメンバーを管理できます</li>
                </ul>
            </div>
        </div>
    );
}
