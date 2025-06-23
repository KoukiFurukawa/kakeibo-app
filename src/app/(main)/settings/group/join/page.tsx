'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function JoinGroupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userGroup, loading, joinGroupWithInviteCode } = useUser();
    
    const [inviteCode, setInviteCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // URLからコードを取得
    useEffect(() => {
        if (searchParams) {
            const code = searchParams.get('code');
            if (code) {
                setInviteCode(code);
            }
        }
    }, [searchParams]);

    // 既にグループに参加している場合はリダイレクト
    useEffect(() => {
        if (!loading && userGroup) {
            setTimeout(() => {
                router.push('/settings/group');
            }, 2000);
        }
    }, [loading, userGroup, router]);

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsJoining(true);
        setError('');
        
        try {
            if (!inviteCode.trim()) {
                throw new Error('招待コードを入力してください');
            }
            
            await joinGroupWithInviteCode(inviteCode.trim());
            setSuccess(true);
            
            // 成功後、リダイレクト
            setTimeout(() => {
                router.push('/settings/group');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'グループ参加に失敗しました');
        } finally {
            setIsJoining(false);
        }
    };

    // ローディング中
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">グループに参加</h1>
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

    // 既にグループに参加している場合
    if (userGroup) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">グループに参加</h1>
                </div>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <p className="text-yellow-800">
                        あなたは既にグループに参加しています。別のグループに参加するには、まず現在のグループから離脱してください。
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
                <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">グループに参加</h1>
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

            {success && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                グループに参加しました！リダイレクトします...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">招待コードの入力</h2>
                </div>
                <form onSubmit={handleJoinGroup} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">招待コード</label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm font-mono uppercase"
                            placeholder="招待コードを入力（例: ABC123）"
                            required
                        />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                        招待コードを入力してグループに参加します。グループに参加すると、メンバー間で家計簿データが共有されます。
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isJoining || success}
                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 flex-1"
                        >
                            {isJoining ? '参加中...' : 'グループに参加'}
                        </button>
                        <Link
                            href="/settings/group"
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center flex-1"
                        >
                            キャンセル
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
