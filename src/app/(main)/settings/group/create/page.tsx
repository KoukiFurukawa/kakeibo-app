'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { GroupService } from '@/services/groupService';

export default function CreateGroupPage() {
    const router = useRouter();
    const { user, userGroup, loading: userLoading, refreshUserGroup } = useUser();
    
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 既にグループに参加している場合はリダイレクト
    if (userGroup && !userLoading) {
        setTimeout(() => {
            router.push('/settings/group');
        }, 2000);
        
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold">グループ作成</h1>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-yellow-800">
                        既にグループに参加しています。新しいグループを作成するには、まず現在のグループから離脱してください。
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!groupName.trim()) {
            setError('グループ名を入力してください');
            setLoading(false);
            return;
        }

        if (!user) {
            setError('ユーザー情報が取得できません。再度ログインしてください。');
            setLoading(false);
            return;
        }

        try {
            await GroupService.createUserGroup(user.id, {
                group_name: groupName.trim(),
                description: description.trim() || undefined,
                author_user_id: '',  // この値はサーバー側で設定されます
            });
            
            await refreshUserGroup(); // ユーザーグループ情報を更新
            // 成功したら設定ページに戻る
            router.push('/settings/group?created=true');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'グループの作成に失敗しました');
            }
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">グループ作成</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium">新しいグループの作成</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">グループ名 *</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm"
                            placeholder="例: 我が家の家計簿"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm h-24"
                            placeholder="グループの説明（任意）"
                        />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-700">
                            グループを作成すると、他のユーザーを招待してグループに参加させることができます。
                            グループメンバーは家計簿データを共有します。
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={loading || userLoading}
                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 flex-1"
                        >
                            {loading ? '作成中...' : 'グループを作成'}
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
