'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/manage_supabase';
import { IUserProfile, IUserNotificationSettings, IUserFinance, IFixedCost, IUserTransaction, IUserGroup, IGroupMember } from '@/types/user';
import { IDateStatus } from '@/types/transaction';
import { UserService } from '@/services/userService';
import { FinanceService } from '@/services/financeService';
import { GroupService } from '@/services/groupService';

interface IUserContextType {
    user: User | null;
    userProfile: IUserProfile | null;
    notificationSettings: IUserNotificationSettings | null;
    userFinance: IUserFinance | null;
    fixedCosts: IFixedCost[];
    transactions: IUserTransaction[];
    loading: boolean;
    userGroup: IUserGroup | null;
    groupMembers: IGroupMember[];
    refreshUserProfile: () => Promise<void>;
    refreshNotificationSettings: () => Promise<void>;
    refreshUserFinance: () => Promise<void>;
    refreshFixedCosts: () => Promise<void>;
    refreshTransactions: (year: number, month: number, userId: string | undefined) => Promise<void>;
    refreshUserGroup: () => Promise<void>;
    refreshAll: () => Promise<void>;
    convertFixedCostsToTransactions: (fixedCosts: IFixedCost[], dateStatus: IDateStatus, salary_day: number) => IUserTransaction[];
}

const UserContext = createContext<IUserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
    const [notificationSettings, setNotificationSettings] = useState<IUserNotificationSettings | null>(null);
    const [userFinance, setUserFinance] = useState<IUserFinance | null>(null);
    const [fixedCosts, setFixedCosts] = useState<IFixedCost[]>([]);
    const [transactions, setTransactions] = useState<IUserTransaction[]>([]);
    const [userGroup, setUserGroup] = useState<IUserGroup | null>(null);
    const [groupMembers, setGroupMembers] = useState<IGroupMember[]>([]);

    const [loading, setLoading] = useState(true);
    const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);

    // セッションの有効性を検証する関数
    const validateSession = async (): Promise<boolean> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.warn('セッションが無効です。再認証が必要です。');
                return false;
            }

            console.log('セッションが有効です:', session.user.id);
            
            const tokenExpirationTime = new Date((session.access_token.split('.')[1] || '') as any).getTime();
            const currentTime = Date.now();
            const timeToExpire = tokenExpirationTime - currentTime;
            
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

    // ユーザープロフィールを再取得する関数
    const refreshUserProfile = async () => {
        if (!user) return;
        const profile = await UserService.fetchUserProfile(user.id);
        setUserProfile(profile);
    };


    // 通知設定を再取得する関数
    const refreshNotificationSettings = async () => {
        if (!user) return;
        const settings = await UserService.fetchNotificationSettings(user.id);
        setNotificationSettings(settings);
    };

    // 家計設定を再取得する関数
    const refreshUserFinance = async () => {
        if (!user) return;
        const finance = await FinanceService.fetchUserFinance(user.id);
        setUserFinance(finance);
    };

    // 固定費を再取得する関数
    const refreshFixedCosts = async () => {
        if (!user) return;
        const costs = await FinanceService.fetchFixedCosts(user.id);
        setFixedCosts(costs);
    };

    // 現在月の取引を取得する関数
    const refreshTransactions = async (year: number, month: number, userId: string | undefined = user?.id) => {
        if (!user || !userProfile || !userId) return;
        const transactions = await FinanceService.fetchTransactions(userId, year, month, userProfile.salary_day);
        if (fixedCosts.length > 0) {
            // 固定費をトランザクションに変換して追加
            const convertedFixedCosts = convertFixedCostsToTransactions(
                fixedCosts, 
                { year: year, month: month, isThisMonth: month === new Date().getMonth() + 1 && year === new Date().getFullYear() }, 
                userProfile.salary_day ? userProfile.salary_day : 1
            );
            transactions.push(...convertedFixedCosts);
        }
        setTransactions(transactions);
    };

    const refreshUserGroup = async () => {
        if (!user) return;
        const group = await GroupService.fetchUserGroup(user.id);
        setUserGroup(group);
        
        // グループが取得できた場合はメンバーも取得
        if (group) {
            const members = await GroupService.fetchGroupMembers(group.id, user.id);
            setGroupMembers(members);
        } else {
            setGroupMembers([]);
        }
    }
    
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
                refreshFixedCosts(),
                refreshTransactions(currentDate.getFullYear(), currentDate.getMonth() + 1),
                refreshUserGroup(),
            ]);
        } catch (error) {
            console.error('データ再取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // 固定費をトランザクションに変換する関数
    const convertFixedCostsToTransactions = useCallback((
        fixedCosts: IFixedCost[],
        dateStatus: IDateStatus,
        salary_day: number
    ): IUserTransaction[] => {
        const today = new Date();
        const todayDate: string = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const startDate = `${dateStatus.year}-${salary_day !== 1 ? dateStatus.month : dateStatus.month}-${salary_day}`;

        // 条件に基づいて固定費をフィルタリング
        const applicableFixedCosts = fixedCosts.filter(cost => {
            const costDay = `${dateStatus.year}-${salary_day <= cost.debit_date ? dateStatus.month : dateStatus.month + 1}-${cost.debit_date}`;
            if (!dateStatus.isThisMonth) {
                return true; // 今月の場合はすべての固定費を含める
            } else {
                // 給料日から今日までの間の固定費のみを含める
                return startDate <= costDay && costDay <= todayDate;
            }
        });
        
        // 固定費をトランザクションに変換
        return applicableFixedCosts.map(cost => {
            // 固定費の日付を生成
            const formattedDate = `${dateStatus.year}-${salary_day <= cost.debit_date ? dateStatus.month : dateStatus.month + 1}-${cost.debit_date}`;
            const result: IUserTransaction = {
                id: `fixed-${cost.id}`,
                created_by: cost.created_by || user?.id || '',
                amount: cost.cost,
                title: cost.title || '固定費',
                tag: cost.tag || '固定費',
                description: cost.title || '固定費',
                is_income: false, // 固定費は支出として扱う
                date: formattedDate, // Date オブジェクトではなく直接文字列で指定
                created_at: new Date().toISOString(),
            };
            
            return result
        });
    }, []);
    
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
                // すべての状態を一度にクリア（再レンダリング回数を減らすため）
                const clearState = () => {
                    setUserProfile(null);
                    setNotificationSettings(null);
                    setUserFinance(null);
                    setFixedCosts([]);
                    setTransactions([]);
                    setUserGroup(null);
                    setGroupMembers([]);
                };
                
                // React 18ではバッチ処理されるが、明示的にバッチ処理することも可能
                clearState();
                
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
                const currentDate = new Date();

                // 並列でデータを取得してパフォーマンスを向上
                const [profile, settings, finance, costs, userGroup] = await Promise.all([
                    UserService.fetchUserProfile(user.id),
                    UserService.fetchNotificationSettings(user.id),
                    FinanceService.fetchUserFinance(user.id),
                    FinanceService.fetchFixedCosts(user.id),
                    GroupService.fetchUserGroup(user.id)
                ]);
                
                let salaryDay = profile?.salary_day || 1; // デフォルトの給料日を25日に設定
                let year = currentDate.getFullYear();
                let month = currentDate.getMonth() + 1; // 月は0から始
                const userTransactions = await FinanceService.fetchTransactions(user.id, year, month, salaryDay);
                
                let members: IGroupMember[] = [];
                // グループが取得できた場合はメンバーも取得
                if (userGroup) {
                    members = await GroupService.fetchGroupMembers(userGroup.id, user.id);
                }

                // 固定費を含める
                const convertedFixedCosts = convertFixedCostsToTransactions(
                    costs, 
                    { year: year, month: month, isThisMonth: true }, 
                    salaryDay
                );
                userTransactions.push(...convertedFixedCosts);

                if (!isMounted) return;

                // 一度にすべての状態を更新（再レンダリング回数を最小化）
                const updateAllStates = () => {
                    setUserProfile(profile);
                    setNotificationSettings(settings);
                    setUserFinance(finance);
                    setFixedCosts(costs);
                    setTransactions(userTransactions);
                    setUserGroup(userGroup);
                    setGroupMembers(members);
                };
                
                // React 18ではバッチ処理されるが、明示的にバッチ処理も可能
                updateAllStates();
                
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
    }, [user]); // 依存配列を明示的に指定

    const value: IUserContextType = {
        user,
        userProfile,
        notificationSettings,
        userFinance,
        fixedCosts,
        transactions,
        loading,
        userGroup,
        groupMembers,
        refreshUserProfile,
        refreshNotificationSettings,
        refreshUserFinance,
        refreshFixedCosts,
        refreshTransactions,
        refreshUserGroup,
        refreshAll,
        convertFixedCostsToTransactions,
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
