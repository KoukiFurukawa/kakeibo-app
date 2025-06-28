import { useState } from 'react';
import { IUserProfile, IGroupMember } from '@/types/user';

interface IUserSwitcherProps {
    currentUser: IUserProfile | null;
    groupMembers: IGroupMember[];
    onSwitchUser: (userId: string) => void;
}

export default function UserSwitcher({
    currentUser,
    groupMembers,
    onSwitchUser
}: IUserSwitcherProps) {
    const [showModal, setShowModal] = useState(false);

    // 現在のユーザー以外のメンバーを取得
    const otherMembers = groupMembers.filter(member => member.id !== currentUser?.id);
    
    // 切り替え先ユーザーの表示名を取得
    const targetUserName = otherMembers.length > 0 
        ? (otherMembers[0].username || otherMembers[0].email.split('@')[0] || '他のメンバー')
        : '他のメンバー';

    // メンバーが2人未満の場合は表示しない
    if (groupMembers.length < 2) {
        return null;
    }

    return (
        <>
            {/* ユーザー切り替えボタン */}
            <div className="fixed bottom-18 left-4 z-20">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-md border border-gray-200"
                >
                    <span className="text-sm font-medium truncate max-w-[150px]">
                        {currentUser?.username}を表示中
                    </span>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </button>
            </div>

            {/* ユーザー切り替え確認モーダル */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 h-screen">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-semibold mb-3">ユーザーを切り替える</h3>
                        <p className="text-gray-600 mb-5">
                            {`${targetUserName}の家計簿を表示しますか？`}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                戻る
                            </button>
                            <button
                                onClick={() => {
                                    if (otherMembers.length > 0) {
                                        onSwitchUser(otherMembers[0].id);
                                    }
                                    setShowModal(false);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                はい
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
