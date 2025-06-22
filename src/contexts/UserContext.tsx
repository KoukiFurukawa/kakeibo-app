'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/manage_supabase';
import { UserProfile, UserNotificationSettings, UserFinance, FixedCost, UserTransaction, UserGroup, GroupMember } from '@/types/user';

interface UserContextType {
    user: User | null;
    userProfile: UserProfile | null;
    notificationSettings: UserNotificationSettings | null;
    userFinance: UserFinance | null;
    fixedCosts: FixedCost[];
    transactions: UserTransaction[];
    loading: boolean;
    userGroup: UserGroup | null;
    groupMembers: GroupMember[];
    refreshAll: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
    refreshNotificationSettings: () => Promise<void>;
    updateNotificationSettings: (updates: Partial<UserNotificationSettings>) => Promise<boolean>;
    refreshUserFinance: () => Promise<void>;
    updateUserFinance: (updates: Partial<UserFinance>) => Promise<boolean>;
    fetchFixedCosts: () => Promise<void>;
    addFixedCost: (fixedCost: Omit<FixedCost, 'id' | 'created_by' | 'created_at'>) => Promise<FixedCost | null>;
    updateFixedCost: (id: string, fixedCost: Partial<FixedCost>) => Promise<boolean>;
    deleteFixedCost: (id: string) => Promise<boolean>;
    fetchTransactions: (year?: number, month?: number) => Promise<void>;
    addTransaction: (transaction: Omit<UserTransaction, 'id' | 'created_by' | 'created_at'>) => Promise<UserTransaction | null>;
    updateTransaction: (id: string, transaction: Partial<UserTransaction>) => Promise<boolean>;
    deleteTransaction: (id: string) => Promise<boolean>;
    getMonthlyStats: (year: number, month: number) => { income: number; expense: number; balance: number };
    fetchUserGroup: () => Promise<void>;
    createUserGroup: (groupData: Omit<UserGroup, 'id' | 'created_at'>) => Promise<UserGroup | null>;
    updateUserGroup: (updates: Partial<UserGroup>) => Promise<boolean>;
    fetchGroupMembers: () => Promise<void>;
    generateInviteCode: () => Promise<string | null>;
    joinGroupWithInviteCode: (inviteCode: string) => Promise<boolean>;
    removeGroupMember: (memberId: string) => Promise<boolean>;
    leaveGroup: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(null);
    const [userFinance, setUserFinance] = useState<UserFinance | null>(null);
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);
    const [userGroup, setUserGroup] = useState<UserGroup | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

    // リトライ用のヘルパー関数

    // セッションの有効性を検証する関数
    const validateSession = async (): Promise<boolean> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.warn('セッションが無効です。再認証が必要です。');
                return false;
            }

            console.log('セッションが有効です:', session.user.id);
            
            // セッションはあるがJWTの有効期限が近い場合は更新
            const tokenExpirationTime = new Date((session.access_token.split('.')[1] || '') as any).getTime();
            const currentTime = Date.now();
            const timeToExpire = tokenExpirationTime - currentTime;
            
            // 5分以内に期限切れになる場合は更新
            if (timeToExpire < 5 * 60 * 1000) {
                console.log('トークンの期限が近いので更新します');
                await supabase.auth.refreshSession();
            }
            
            return true;
        } catch (error) {
            console.error('セッション検証エラー:', error);
            return false;
        }
    };

    // ユーザープロフィールを取得する関数
    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            return data;
        });
    };

    // ユーザープロフィールを更新する関数
    const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        });

        if (result) {
            setUserProfile(result);
            return true;
        }
        return false;
    };

    // ユーザープロフィールを再取得する関数
    const refreshUserProfile = async () => {
        if (!user) return;
        const profile = await fetchUserProfile(user.id);
        setUserProfile(profile);
    };

    // 通知設定を取得する関数
    const fetchNotificationSettings = async (userId: string): Promise<UserNotificationSettings | null> => {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('notification_settings')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            return data;
        });
    };

    // 通知設定を更新する関数
    const updateNotificationSettings = async (updates: Partial<UserNotificationSettings>): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('notification_settings')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        });

        if (result) {
            setNotificationSettings(result);
            return true;
        }
        return false;
    };

    // 通知設定を再取得する関数
    const refreshNotificationSettings = async () => {
        if (!user) return;
        const settings = await fetchNotificationSettings(user.id);
        setNotificationSettings(settings);
    };

    // 家計設定を取得する関数
    const fetchUserFinance = async (userId: string): Promise<UserFinance | null> => {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('finance')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            return data;
        });
    };

    // 家計設定を更新する関数
    const updateUserFinance = async (updates: Partial<UserFinance>): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('finance')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        });

        if (result) {
            setUserFinance(result);
            return true;
        }
        return false;
    };

    // 家計設定を再取得する関数
    const refreshUserFinance = async () => {
        if (!user) return;
        const finance = await fetchUserFinance(user.id);
        setUserFinance(finance);
    };

    // 固定費を取得する関数
    const fetchFixedCosts = async () => {
        if (!user) return;

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('fixed_costs')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        });

        if (result) {
            setFixedCosts(result);
        }
    };

    // 固定費を追加する関数
    const addFixedCost = async (fixedCostData: Omit<FixedCost, 'id' | 'created_by' | 'created_at'>): Promise<FixedCost | null> => {
        if (!user) return null;

        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('fixed_costs')
                .insert({
                    created_by: user.id,
                    ...fixedCostData
                })
                .select()
                .single();

            if (error) throw error;

            setFixedCosts(prev => [data, ...prev]);
            return data;
        });
    };

    // 固定費を更新する関数
    const updateFixedCost = async (id: string, fixedCostData: Partial<FixedCost>): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('fixed_costs')
                .update(fixedCostData)
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;
            return true;
        });

        if (result) {
            setFixedCosts(prev => prev.map(cost =>
                cost.id === id ? { ...cost, ...fixedCostData } : cost
            ));
            return true;
        }
        return false;
    };

    // 固定費を削除する関数
    const deleteFixedCost = async (id: string): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('fixed_costs')
                .delete()
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;
            return true;
        });

        if (result) {
            setFixedCosts(prev => prev.filter(cost => cost.id !== id));
            return true;
        }
        return false;
    };
    
    // 取引を取得する関数（月指定可能）
    const fetchTransactions = async (year?: number, month?: number) => {
        if (!user) return;

        const result = await retryWithBackoff(async () => {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('created_by', user.id);

            // 年月が指定されている場合、その月のデータのみ取得
            if (year && month) {
                const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
                const endDate = new Date(year, month, 0).toISOString().split('T')[0];
                
                try {
                    query = query
                        .gte('date', startDate)
                        .lte('date', endDate);
                } catch (error) {
                    // dateカラムが存在しない場合はcreated_atを使用
                    const startDateTime = new Date(year, month - 1, 1).toISOString();
                    const endDateTime = new Date(year, month, 0, 23, 59, 59).toISOString();
                    query = query
                        .gte('created_at', startDateTime)
                        .lte('created_at', endDateTime);
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        });

        if (result) {
            setTransactions(result);
        }
    };

    // 取引を追加する関数
    const addTransaction = async (transactionData: Omit<UserTransaction, 'id' | 'created_by' | 'created_at'>): Promise<UserTransaction | null> => {
        if (!user) return null;

        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    created_by: user.id,
                    ...transactionData
                })
                .select()
                .single();

            if (error) throw error;

            setTransactions(prev => [data, ...prev]);
            return data;
        });
    };

    // 取引を更新する関数
    const updateTransaction = async (id: string, transactionData: Partial<UserTransaction>): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('transactions')
                .update(transactionData)
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;
            return true;
        });

        if (result) {
            setTransactions(prev => prev.map(transaction =>
                transaction.id === id ? { ...transaction, ...transactionData } : transaction
            ));
            return true;
        }
        return false;
    };

    // 取引を削除する関数
    const deleteTransaction = async (id: string): Promise<boolean> => {
        if (!user) return false;

        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;
            return true;
        });

        if (result) {
            setTransactions(prev => prev.filter(transaction => transaction.id !== id));
            return true;
        }
        return false;
    };
    
    // 月次統計を取得する関数
    const getMonthlyStats = (year: number, month: number) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const monthlyTransactions = transactions.filter(transaction => {
            // dateカラムが存在しない場合はcreated_atを使用
            const dateToUse = transaction.date || transaction.created_at;
            const transactionDate = new Date(dateToUse);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        const income = monthlyTransactions
            .filter(t => t.is_income)
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthlyTransactions
            .filter(t => !t.is_income)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expense,
            balance: income - expense
        };
    };
    
    // 全データを再取得する関数
    const refreshAll = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            // 明示的にセッションを更新してからデータを再取得
            await supabase.auth.getSession();
            
            const currentDate = new Date();
            await Promise.all([
                refreshUserProfile(),
                refreshNotificationSettings(),
                refreshUserFinance(),
                fetchFixedCosts(),
                fetchTransactions(currentDate.getFullYear(), currentDate.getMonth() + 1),
                fetchUserGroup(),
                // グループが取得できた場合はメンバーも取得
                userGroup ? fetchGroupMembers() : Promise.resolve(),
            ]);
        } catch (error) {
            console.error('データ再取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // 認証状態の監視とユーザープロフィールの取得
    useEffect(() => {
        let isMounted = true;

        const getInitialSession = async () => {
            try {
                // セッションの有効性を確認
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.error('セッション取得エラー:', sessionError);
                    if (isMounted) setLoading(false);
                    return;
                }

                const currentUser = session?.user || null;
                if (!isMounted) return;
                
                // ユーザー状態だけを更新し、データ取得はしない
                setUser(currentUser);
            } catch (error) {
                console.error('初期セッション取得エラー:', error);
                if (isMounted) setLoading(false);
            }
        };

        getInitialSession();

        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state changed:', event, session?.user?.id);
                
                if (!isMounted) return;
                
                // ユーザー状態の更新のみを行う（データ取得は別のuseEffectで実施）
                setUser(session?.user ?? null);
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval);
                setSessionCheckInterval(null);
            }
        };
    }, []);

    // ユーザー状態の変更を監視して必要なデータを取得
    useEffect(() => {
        let isMounted = true;

        const fetchUserData = async () => {
            if (!user) {
                // ユーザーがnullの場合はデータをクリア
                setUserProfile(null);
                setNotificationSettings(null);
                setUserFinance(null);
                setFixedCosts([]);
                setTransactions([]);
                setUserGroup(null);
                setGroupMembers([]);
                
                // セッションチェックを停止
                if (sessionCheckInterval) {
                    clearInterval(sessionCheckInterval);
                    setSessionCheckInterval(null);
                }
                
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // 並列でデータを取得してパフォーマンスを向上
                const [profile, settings, finance] = await Promise.all([
                    fetchUserProfile(user.id),
                    fetchNotificationSettings(user.id),
                    fetchUserFinance(user.id)
                ]);

                if (!isMounted) return;

                setUserProfile(profile);
                setNotificationSettings(settings);
                setUserFinance(finance);
                
                // 固定費と現在月の取引とグループ情報を並列で取得
                const currentDate = new Date();
                await Promise.all([
                    fetchFixedCosts(),
                    fetchTransactions(currentDate.getFullYear(), currentDate.getMonth() + 1),
                    fetchUserGroup()
                ]);
                
                // ユーザーデータ取得後にセッションチェックを開始
                startSessionCheck();
            } catch (error) {
                console.error('ユーザーデータ取得エラー:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchUserData();
        
        return () => {
            isMounted = false;
        };
    }, [user]); // userが変更されたときにデータを再取得

    // セッションの定期チェック（5分ごと）
    const startSessionCheck = () => {
        // 既存のインターバルをクリア
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
        }
        
        const interval = setInterval(async () => {
            try {
                const isValid = await validateSession();
                if (!isValid && user) {
                    console.warn('セッションが期限切れです。再認証が必要です。');
                    // セッションが無効な場合はユーザーをクリアし、イベントを発行
                    setUser(null);
                    
                    // セッション期限切れイベントを発行（任意のイベント管理システムを使用）
                    // 例: EventEmitter、カスタムイベント、通知コンテキストなど
                    window.dispatchEvent(new CustomEvent('sessionExpired', {
                        detail: { message: 'セッションの期限が切れました。再ログインしてください。' }
                    }));
                }
            } catch (error) {
                console.error('セッションチェックエラー:', error);
            }
        }, 5 * 60 * 1000); // 5分
        
        setSessionCheckInterval(interval);
    };

    // retryWithBackoff関数を強化
    const retryWithBackoff = async <T,>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T | null> => {
        // 現在のユーザーが存在しない場合は早期リターン
        if (!user) {
            console.warn('ユーザーがログインしていません。操作をスキップします。');
            return null;
        }
        
        // 操作前にセッションを事前検証
        let isSessionValid = await validateSession();
        if (!isSessionValid) {
            console.warn('無効なセッションを検出。セッションの更新を試みます。');
            
            try {
                const { data } = await supabase.auth.refreshSession();
                if (data.session) {
                    console.log('セッションの更新に成功しました。操作を継続します。');
                    // セッションの更新に成功したら操作を続行
                    isSessionValid = true;
                } else {
                    console.warn('セッション更新失敗。操作をスキップします。');
                    return null;
                }
            } catch (error) {
                console.error('セッション更新エラー:', error);
                return null;
            }
        }
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                if (attempt === maxRetries) {
                    console.error(`最大リトライ回数(${maxRetries})に達しました:`, error);
                    return null;
                }
                
                // 認証エラーの場合は即座に再試行せずにセッションを更新
                if (error?.message?.includes('JWT') || error?.message?.includes('token') || error?.code === 'PGRST301') {
                    console.warn('認証トークンエラーを検出、セッションを更新します:', error);
                    try {
                        // セッションの更新を試みる
                        const { data } = await supabase.auth.refreshSession();
                        
                        // セッション更新に失敗した場合（リフレッシュトークンも期限切れの場合）
                        if (!data.session) {
                            console.error('セッションを更新できませんでした。再ログインが必要です。');
                            // ユーザー状態をリセット
                            setUser(null);
                            setUserProfile(null);
                            setNotificationSettings(null);
                            setUserFinance(null);
                            setFixedCosts([]);
                            setTransactions([]);
                            return null;
                        }
                        
                        // 短い待機時間でリトライ
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (sessionError) {
                        console.error('セッション更新エラー:', sessionError);
                    }
                } else {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.warn(`取得に失敗しました。${delay}ms後にリトライします (${attempt + 1}/${maxRetries}):`, error);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        return null;
    };

    // 新しいグループを作成する関数
    const createUserGroup = async (groupData: Omit<UserGroup, 'id' | 'created_at'>): Promise<UserGroup | null> => {
        if (!user) return null;

        try {
            // 既にグループに所属しているか確認
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('group_id')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;

            if (userData.group_id) {
                throw new Error('すでにグループに所属しています');
            }

            // グループを作成
            const { data: newGroup, error: createError } = await supabase
                .from('groups')
                .insert({
                    ...groupData,
                    author_user_id: user.id
                })
                .select()
                .single();

            if (createError) throw createError;

            // ユーザープロフィールのgroup_idを更新
            const { error: updateError } = await supabase
                .from('users')
                .update({ group_id: newGroup.id })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 状態を更新
            setUserGroup(newGroup);
            
            return newGroup;
        } catch (error) {
            console.error('グループ作成エラー:', error);
            throw error;
        }
    };

    // グループ情報を更新する関数
    const updateUserGroup = async (updates: Partial<UserGroup>): Promise<boolean> => {
        if (!user || !userGroup) return false;

        try {
            // 作成者のみがグループを更新できる
            if (userGroup.author_user_id !== user.id) {
                throw new Error('グループの管理者のみが更新できます');
            }

            const { data, error } = await supabase
                .from('groups')
                .update(updates)
                .eq('id', userGroup.id)
                .select()
                .single();

            if (error) throw error;

            // 状態を更新
            setUserGroup({...userGroup, ...data});
            return true;
        } catch (error) {
            console.error('グループ更新エラー:', error);
            return false;
        }
    };

    const leaveGroup = async (): Promise<boolean> => {
        if (!user || !userGroup) return false;

        try {
            // ユーザーがグループの作成者（admin）である場合の処理
            if (userGroup.author_user_id === user.id) {
                // 管理者がグループを離脱するとグループは削除される
                // グループに所属する全ユーザーのgroup_id をnullに設定
                const { error: updateMembersError } = await supabase
                    .from('users')
                    .update({ group_id: null })
                    .eq('group_id', userGroup.id);

                if (updateMembersError) throw updateMembersError;

                // グループ自体を削除
                const { error: deleteGroupError } = await supabase
                    .from('groups')
                    .delete()
                    .eq('id', userGroup.id);

                if (deleteGroupError) throw deleteGroupError;
            } else {
                // 一般メンバーの場合は自分だけグループから離脱
                const { error: updateUserError } = await supabase
                    .from('users')
                    .update({ group_id: null })
                    .eq('id', user.id)
                    .eq('group_id', userGroup.id);

                if (updateUserError) throw updateUserError;
            }

            // 状態を更新
            setUserGroup(null);
            setGroupMembers([]);
            return true;
        } catch (error) {
            console.error('グループ離脱エラー:', error);
            return false;
        }
    };
    
    // グループメンバー一覧を取得する関数
    const fetchGroupMembers = useCallback(async (): Promise<void> => {
        if (!user || !userGroup) {
            setGroupMembers([]);
            return;
        }

        try {
            // グループIDに所属するすべてのユーザーを取得
            // グループの Invited_user_id でよい。更新予定
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email, created_at')
                .eq('group_id', userGroup.id);

            if (error) throw error;

            // 管理者情報をマークする
            const membersWithRole = data.map(member => ({
                ...member,
                isAdmin: member.id === userGroup.author_user_id
            }));

            setGroupMembers(membersWithRole);
        } catch (error) {
            console.error('グループメンバー取得エラー:', error);
            setGroupMembers([]);
        }
    }, [user, userGroup]);

    // 招待コードを生成する関数
    const generateInviteCode = async (): Promise<string | null> => {
        if (!user || !userGroup) return null;

        try {
            // 管理者のみが招待コードを生成できる
            if (userGroup.author_user_id !== user.id) {
                throw new Error('グループの管理者のみが招待コードを生成できます');
            }

            // ランダムコードを生成
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            // コードを保存
            const { error } = await supabase
                .from('group_invites')
                .insert({
                    group_id: userGroup.id,
                    code: code,
                    created_by: user.id,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日間有効
                });

            if (error) throw error;
            
            return code;
        } catch (error) {
            console.error('招待コード生成エラー:', error);
            return null;
        }
    };

    // 招待コードでグループに参加する関数
    const joinGroupWithInviteCode = async (inviteCode: string): Promise<boolean> => {
        if (!user) return false;

        try {
            // 既にグループに所属しているかチェック
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('group_id')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;
            
            if (userData.group_id) {
                throw new Error('すでにグループに所属しています');
            }

            // 招待コードが有効か確認
            const { data: inviteData, error: inviteError } = await supabase
                .from('group_invites')
                .select('group_id, expires_at')
                .eq('code', inviteCode)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (inviteError || !inviteData) {
                throw new Error('無効または期限切れの招待コードです');
            }

            // ユーザーをグループに参加させる
            const { error: updateError } = await supabase
                .from('users')
                .update({ group_id: inviteData.group_id })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // グループ情報を再取得
            await fetchUserGroup();
            return true;
        } catch (error) {
            console.error('グループ参加エラー:', error);
            throw error;
        }
    };

    // グループメンバーを削除する関数
    const removeGroupMember = async (memberId: string): Promise<boolean> => {
        if (!user || !userGroup) return false;

        try {
            // 自分自身は削除できない（代わりに離脱を使用）
            if (memberId === user.id) {
                throw new Error('自分自身を削除することはできません');
            }

            // 管理者のみがメンバーを削除できる
            if (userGroup.author_user_id !== user.id) {
                throw new Error('グループの管理者のみがメンバーを削除できます');
            }

            // メンバーのグループIDをnullに更新
            const { error } = await supabase
                .from('users')
                .update({ group_id: null })
                .eq('id', memberId)
                .eq('group_id', userGroup.id);

            if (error) throw error;

            // メンバーリストを更新
            setGroupMembers(groupMembers.filter(member => member.id !== memberId));
            return true;
        } catch (error) {
            console.error('メンバー削除エラー:', error);
            return false;
        }
    };

    // グループデータ取得関数の拡張
    const fetchUserGroup = async () => {
        if (!user) return;

        try {
            // まずユーザープロフィールからgroup_idを取得
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('group_id')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('グループID取得エラー:', userError);
                setUserGroup(null);
                return;
            }

            // group_idがない場合は所属グループなし
            if (!userData.group_id) {
                setUserGroup(null);
                setGroupMembers([]);
                return;
            }

            // group_idがある場合、グループ情報を取得
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', userData.group_id)
                .single();

            if (groupError) {
                console.error('グループ情報取得エラー:', groupError);
                setUserGroup(null);
                setGroupMembers([]);
                return;
            }

            setUserGroup(groupData);

            // グループ情報が取得できた場合、メンバー情報も取得
            await fetchGroupMembers();
        } catch (error) {
            console.error('グループ情報取得中のエラー:', error);
            setUserGroup(null);
            setGroupMembers([]);
        }
    };
    
    // 認証状態の監視とユーザープロフィールの取得
    useEffect(() => {
        let isMounted = true;

        const getInitialSession = async () => {
            try {
                // セッションの有効性を確認
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.error('セッション取得エラー:', sessionError);
                    if (isMounted) setLoading(false);
                    return;
                }

                const currentUser = session?.user || null;
                if (!isMounted) return;
                
                // ユーザー状態だけを更新し、データ取得はしない
                setUser(currentUser);
            } catch (error) {
                console.error('初期セッション取得エラー:', error);
                if (isMounted) setLoading(false);
            }
        };

        getInitialSession();

        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state changed:', event, session?.user?.id);
                
                if (!isMounted) return;
                
                // ユーザー状態の更新のみを行う（データ取得は別のuseEffectで実施）
                setUser(session?.user ?? null);
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval);
                setSessionCheckInterval(null);
            }
        };
    }, []);

    // ユーザー状態の変更を監視して必要なデータを取得
    useEffect(() => {
        let isMounted = true;

        const fetchUserData = async () => {
            if (!user) {
                // ユーザーがnullの場合はデータをクリア
                setUserProfile(null);
                setNotificationSettings(null);
                setUserFinance(null);
                setFixedCosts([]);
                setTransactions([]);
                setUserGroup(null);
                setGroupMembers([]);
                
                // セッションチェックを停止
                if (sessionCheckInterval) {
                    clearInterval(sessionCheckInterval);
                    setSessionCheckInterval(null);
                }
                
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // 並列でデータを取得してパフォーマンスを向上
                const [profile, settings, finance] = await Promise.all([
                    fetchUserProfile(user.id),
                    fetchNotificationSettings(user.id),
                    fetchUserFinance(user.id)
                ]);

                if (!isMounted) return;

                setUserProfile(profile);
                setNotificationSettings(settings);
                setUserFinance(finance);
                
                // 固定費と現在月の取引とグループ情報を並列で取得
                const currentDate = new Date();
                await Promise.all([
                    fetchFixedCosts(),
                    fetchTransactions(currentDate.getFullYear(), currentDate.getMonth() + 1),
                    fetchUserGroup()
                ]);
                
                // ユーザーデータ取得後にセッションチェックを開始
                startSessionCheck();
            } catch (error) {
                console.error('ユーザーデータ取得エラー:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchUserData();
        
        return () => {
            isMounted = false;
        };
    }, [user]); // userが変更されたときにデータを再取得
    
    const value: UserContextType = {
        user,
        userProfile,
        notificationSettings,
        userFinance,
        fixedCosts,
        transactions,
        loading,
        userGroup,
        groupMembers,
        refreshAll,
        refreshUserProfile,
        updateUserProfile,
        refreshNotificationSettings,
        updateNotificationSettings,
        refreshUserFinance,
        updateUserFinance,
        fetchFixedCosts,
        addFixedCost,
        updateFixedCost,
        deleteFixedCost,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getMonthlyStats,
        fetchUserGroup,
        createUserGroup,
        updateUserGroup,
        fetchGroupMembers,
        generateInviteCode,
        joinGroupWithInviteCode,
        removeGroupMember,
        leaveGroup, // 追加
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
