import { ITransactionInput, ITransaction } from "@/types/transaction";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/manage_supabase"; // Import supabase client

interface ITransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ITransactionInput) => Promise<void>;
    saving: boolean;
    editTransaction?: ITransaction | null;
}

const TransactionModal: React.FC<ITransactionModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    saving, 
    editTransaction 
}) => {
    const [inputType, setInputType] = useState<'income' | 'expense'>('expense');
    const [inputTitle, setInputTitle] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [inputAmount, setInputAmount] = useState('');
    const [inputTag, setInputTag] = useState('');
    const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);

    const tags = [
        '食費', '日用品', '交通費', '娯楽', '衣服', '医療', '住居', '水道光熱費', '通信費', '教育', '給料', 'その他'
    ];
    
    const refreshSession = async () => {
        try {
            console.log('セッションを更新しています...');
            // セッションの更新を試みる
            const { data, error } = await supabase.auth.refreshSession();
            
            if (error) {
                console.error('セッション更新エラー:', error);
                return false;
            }
            
            if (data.session) {
                console.log('セッションを更新しました');
                return true;
            } else {
                console.warn('セッションが存在しませんでした');
                return false;
            }
        } catch (error) {
            console.error('セッション更新中に例外が発生しました:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!inputTitle.trim() || !inputTag || !inputAmount || Number(inputAmount) <= 0) {
            return;
        }
        
        try {
            const transactionData = {
                title: inputTitle,
                description: inputDescription,
                amount: Number(inputAmount),
                tag: inputTag,
                is_income: inputType === 'income',
                date: inputDate
            };
            
            // 3秒タイムアウトの初回試行
            const firstAttemptTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('初回試行タイムアウト')), 3000)
            );
            
            try {
                await Promise.race([
                    onSubmit(transactionData),
                    firstAttemptTimeout
                ]);
                
                // 成功した場合
                resetForm();
                return;
            } catch (initialError: unknown) {
                if (initialError instanceof Error) {
                    console.warn('初回試行でタイムアウト:', initialError.message);
                }
                // 3秒以内に成功しなかった場合、セッションを更新して再試行
                console.log('最初の試行がタイムアウトしました。セッションを更新して再試行します。');
                
                // セッション更新処理を実行
                const refreshed = await refreshSession();
                if (!refreshed) {
                    console.warn('セッション更新に失敗しました。再試行を続行します。');
                }
                
                // 最終的なタイムアウト (合計で15秒)
                const finalTimeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('リクエストがタイムアウトしました')), 12000)
                );
                
                // セッション更新後に再試行
                await Promise.race([
                    onSubmit(transactionData),
                    finalTimeoutPromise
                ]);
                
                // 再試行が成功した場合
                resetForm();
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            console.error('保存エラー:', error);
            
            // トークンエラーの場合はセッションを更新して再試行
            if (error?.message?.includes('JWT') || error?.message?.includes('token') || 
                error?.message?.includes('認証')) {
                alert('セッションの更新が必要です。再度お試しください。');
                
                // エラー発生時にもセッション更新を試みる
                try {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        alert('セッションを更新しました。もう一度操作をお試しください。');
                    }
                } catch (refreshError) {
                    console.error('エラー後のセッション更新に失敗:', refreshError);
                }
            } else {
                alert(`保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
            }
            
            // モーダルを閉じるオプションを提供
            if (confirm('入力内容を保持したまま閉じますか？')) {
                onClose();
            }
        }
    };

    const resetForm = () => {
        setInputTitle('');
        setInputDescription('');
        setInputAmount('');
        setInputTag('');
        setInputDate(new Date().toISOString().split('T')[0]);
        setInputType('expense');
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    // 編集モードの場合、データをフォームに設定
    useEffect(() => {
        if (editTransaction) {
            setInputType(editTransaction.is_income ? 'income' : 'expense');
            setInputTitle(editTransaction.title || '');
            setInputDescription(editTransaction.description || '');
            setInputAmount(editTransaction.amount.toString());
            setInputTag(editTransaction.tag || '');
            setInputDate(editTransaction.date || new Date().toISOString().split('T')[0]);
        } else {
            resetForm();
        }
    }, [editTransaction]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{editTransaction ? '収支を編集' : '収支を追加'}</h2>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setInputType('income')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm ${inputType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200'
                                    }`}
                            >
                                収入
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('expense')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm ${inputType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200'
                                    }`}
                            >
                                支出
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                        <input
                            type="text"
                            value={inputTitle}
                            onChange={(e) => setInputTitle(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm"
                            placeholder="例: 昼食、電車代"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
                        <input
                            type="text"
                            value={inputDescription}
                            onChange={(e) => setInputDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm"
                            placeholder="詳細な説明"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                        <select
                            value={inputTag}
                            onChange={(e) => setInputTag(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm"
                            required
                        >
                            <option value="">タグを選択</option>
                            {tags.map((tag) => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                        <input
                            type="date"
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                ¥
                            </span>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={inputAmount}
                                onChange={(e) => setInputAmount(e.target.value)}
                                className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 py-3 px-4 rounded-md font-medium text-sm bg-gray-300 text-gray-800 hover:bg-gray-400"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex-1 py-3 px-4 rounded-md font-medium text-sm ${saving
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {saving ? '保存中...' : (editTransaction ? '更新' : '保存')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
