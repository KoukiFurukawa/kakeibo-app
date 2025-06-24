'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/manage_supabase';
import { UserProfile, UserNotificationSettings, UserFinance, FixedCost, UserTransaction, UserGroup, GroupMember } from '@/types/user';
import { UserService } from '@/services/userService';
import { FinanceService } from '@/services/financeService';
import { GroupService } from '@/services/groupService';

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
    refreshUserProfile: () => Promise<void>;
    refreshNotificationSettings: () => Promise<void>;
    refreshUserFinance: () => Promise<void>;
    refreshFixedCosts: () => Promise<void>;
    refreshTransactions: (year: number, month: number) => Promise<void>;
    refreshUserGroup: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(null);
    const [userFinance, setUserFinance] = useState<UserFinance | null>(null);
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [userGroup, setUserGroup] = useState<UserGroup | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

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
    const refreshTransactions = async (year: number, month: number) => {
        if (!user) return;
        const transactions = await FinanceService.fetchTransactions(user.id, year, month);
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
                const [profile, settings, finance, costs, userTransactions, userGroup] = await Promise.all([
                    UserService.fetchUserProfile(user.id),
                    UserService.fetchNotificationSettings(user.id),
                    FinanceService.fetchUserFinance(user.id),
                    FinanceService.fetchFixedCosts(user.id),
                    FinanceService.fetchTransactions(user.id, currentDate.getFullYear(), currentDate.getMonth() + 1),
                    GroupService.fetchUserGroup(user.id)
                ]);
                
                let members: GroupMember[] = [];
                // グループが取得できた場合はメンバーも取得
                if (userGroup) {
                    members = await GroupService.fetchGroupMembers(userGroup.id, user.id);
                }

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
        refreshUserProfile,
        refreshNotificationSettings,
        refreshUserFinance,
        refreshFixedCosts,
        refreshTransactions,
        refreshUserGroup,
        refreshAll,
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
