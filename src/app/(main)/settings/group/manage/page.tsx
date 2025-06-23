'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function ManageGroupPage() {
    const router = useRouter();
    const { user, userGroup, groupMembers, loading, updateUserGroup, fetchGroupMembers, removeGroupMember } = useUser();
    
    const [isEditing, setIsEditing] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [adminMessage, setAdminMessage] = useState('');

    // グループ情報の初期設定
    useEffect(() => {
        if (userGroup) {
            setGroupName(userGroup.group_name || '');
            setGroupDescription(userGroup.description || '');
        }
    }, [userGroup]);

    // グループメンバーの取得
    useEffect(() => {
        if (userGroup && !loading) {
            // メンバー情報を取得
            fetchGroupMembers();
        }
    }, [userGroup?.id, loading]);

    // ユーザーがグループに所属していない場合はリダイレクト
    useEffect(() => {
        if (!loading && !userGroup) {
            router.push('/settings/group');
        }
    }, [loading, userGroup, router]);

    // グループ情報の更新
    const handleUpdateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            if (!groupName.trim()) {
                throw new Error('グループ名は必須です');
            }

            const success = await updateUserGroup({
                group_name: groupName.trim(),
                description: groupDescription.trim() || undefined,
            });

            if (success) {
                setIsEditing(false);
                setAdminMessage('グループ情報を更新しました');
                setTimeout(() => {
                    setAdminMessage('');
                }, 3000);
            } else {
                throw new Error('グループ更新に失敗しました');
            }
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    // メンバーの削除
    const handleRemoveMember = async (memberId: string) => {
        if (removeConfirm !== memberId) return;
        
        setIsRemoving(true);
        setError('');
        
        try {
            const success = await removeGroupMember(memberId);
            if (success) {
                setAdminMessage('メンバーを削除しました');
                setTimeout(() => {
                    setAdminMessage('');
                }, 3000);
            } else {
                throw new Error('メンバー削除に失敗しました');
            }
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
        } finally {
            setIsRemoving(false);
            setRemoveConfirm(null);
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
                    <h1 className="text-xl sm:text-2xl font-bold">グループ管理</h1>
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
        return null;  // リダイレクト中
    }

    const isAdmin = userGroup.author_user_id === user?.id;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings/group" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">グループ管理</h1>
            </div>

            {adminMessage && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{adminMessage}</p>
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
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* グループ基本情報 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium">グループ情報</h2>
                    {isAdmin && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                            編集
                        </button>
                    )}
                </div>
                
                <div className="p-4">
                    {isEditing ? (
                        <form onSubmit={handleUpdateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">グループ名 *</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md text-sm h-24"
                                    placeholder="グループの説明（任意）"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 flex-1"
                                >
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setGroupName(userGroup.group_name || '');
                                        setGroupDescription(userGroup.description || '');
                                    }}
                                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 flex-1"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">グループ名</h3>
                                <p className="text-lg font-medium">{userGroup.group_name}</p>
                            </div>
                            {userGroup.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">説明</h3>
                                    <p className="text-base">{userGroup.description}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">作成日時</h3>
                                <p className="text-sm text-gray-600">
                                    {userGroup.created_at ? new Date(userGroup.created_at).toLocaleString('ja-JP') : '不明'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* グループメンバー */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium">メンバー ({groupMembers.length})</h2>
                    {isAdmin && (
                        <Link href="/settings/group/invite" className="text-blue-500 hover:text-blue-700 text-sm">
                            招待する
                        </Link>
                    )}
                </div>

                <div className="p-4">
                    {groupMembers.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">メンバーがいません</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {groupMembers.map((member) => (
                                <li key={member.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{member.username || '名前未設定'}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                        {member.isAdmin && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                                管理者
                                            </span>
                                        )}
                                    </div>
                                    {isAdmin && !member.isAdmin && (
                                        <div>
                                            {removeConfirm === member.id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        disabled={isRemoving}
                                                        className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                                                    >
                                                        {isRemoving ? '処理中...' : '確認'}
                                                    </button>
                                                    <button
                                                        onClick={() => setRemoveConfirm(null)}
                                                        className="bg-gray-200 text-gray-800 py-1 px-3 rounded text-xs hover:bg-gray-300"
                                                    >
                                                        キャンセル
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setRemoveConfirm(member.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    削除
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* 招待リンク（管理者のみ） */}
            {isAdmin && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium">招待</h2>
                    </div>
                    <div className="p-4">
                        <p className="text-sm mb-3">他のユーザーをグループに招待できます。</p>
                        <Link href="/settings/group/invite" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 block text-center">
                            招待コードを生成する
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}