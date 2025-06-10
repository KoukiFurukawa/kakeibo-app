'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/manage_supabase';

interface UserProfile {
    id: string;
    email: string;
    username: string | null;
    target_month_savings?: number;
    notifications?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface UserNotificationSettings {
    id: string;
    todo: boolean;
    system: boolean;
    event: boolean;
    created_at?: string;
}

interface UserFinance {
    savings_goal: number;
    food: number;
    entertainment: number;
    clothing: number;
    daily_goods: number;
    other: number;
}

interface FixedCost {
    id: string;
    created_by?: string;
    title: string;
    cost: number;
    tag: string;
    debit_date: number;
    created_at?: string;
}

interface UserTransaction {
    id: string;
    created_by: string;
    title: string;
    description: string;
    amount: number;
    tag: string;
    is_income: boolean;
    created_at: string;
}

interface UserContextType {
    user: User | null;
    userProfile: UserProfile | null;
    notificationSettings: UserNotificationSettings | null;
    userFinance: UserFinance | null;
    fixedCosts: FixedCost[];
    transactions: UserTransaction[];
    loading: boolean;
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
    fetchTransactions: () => Promise<void>;
    addTransaction: (transaction: Omit<UserTransaction, 'id' | 'created_by' | 'created_at'>) => Promise<UserTransaction | null>;
    updateTransaction: (id: string, transaction: Partial<UserTransaction>) => Promise<boolean>;
    deleteTransaction: (id: string) => Promise<boolean>;
    getMonthlyStats: (year: number, month: number) => { income: number; expense: number; balance: number };
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

    // リトライ用のヘルパー関数
    const retryWithBackoff = async <T,>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T | null> => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error(`最大リトライ回数(${maxRetries})に達しました:`, error);
                    return null;
                }
                
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`取得に失敗しました。${delay}ms後にリトライします (${attempt + 1}/${maxRetries}):`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return null;
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

        try {
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

            setUserProfile(data);
            return true;
        } catch (error) {
            console.error('ユーザープロフィール更新エラー:', error);
            return false;
        }
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

        try {
            const { data, error } = await supabase
                .from('notification_settings')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setNotificationSettings(data);
            return true;
        } catch (error) {
            console.error('通知設定更新エラー:', error);
            return false;
        }
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

        try {
            const { data, error } = await supabase
                .from('finance')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setUserFinance(data);
            return true;
        } catch (error) {
            console.error('家計設定更新エラー:', error);
            return false;
        }
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

        try {
            const { data, error } = await supabase
                .from('fixed_costs')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFixedCosts(data || []);
        } catch (error) {
            console.error('固定費取得エラー:', error);
        }
    };

    // 固定費を追加する関数
    const addFixedCost = async (fixedCostData: Omit<FixedCost, 'id' | 'created_by' | 'created_at'>): Promise<FixedCost | null> => {
        if (!user) return null;

        try {
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
        } catch (error) {
            console.error('固定費追加エラー:', error);
            return null;
        }
    };

    // 固定費を更新する関数
    const updateFixedCost = async (id: string, fixedCostData: Partial<FixedCost>): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('fixed_costs')
                .update(fixedCostData)
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;

            setFixedCosts(prev => prev.map(cost =>
                cost.id === id ? { ...cost, ...fixedCostData } : cost
            ));
            return true;
        } catch (error) {
            console.error('固定費更新エラー:', error);
            return false;
        }
    };

    // 固定費を削除する関数
    const deleteFixedCost = async (id: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('fixed_costs')
                .delete()
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;

            setFixedCosts(prev => prev.filter(cost => cost.id !== id));
            return true;
        } catch (error) {
            console.error('固定費削除エラー:', error);
            return false;
        }
    };

    // 取引を取得する関数
    const fetchTransactions = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('取引取得エラー:', error);
        }
    };

    // 取引を追加する関数
    const addTransaction = async (transactionData: Omit<UserTransaction, 'id' | 'created_by' | 'created_at'>): Promise<UserTransaction | null> => {
        if (!user) return null;

        try {
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
        } catch (error) {
            console.error('取引追加エラー:', error);
            return null;
        }
    };

    // 取引を更新する関数
    const updateTransaction = async (id: string, transactionData: Partial<UserTransaction>): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('transactions')
                .update(transactionData)
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;

            setTransactions(prev => prev.map(transaction =>
                transaction.id === id ? { ...transaction, ...transactionData } : transaction
            ));
            return true;
        } catch (error) {
            console.error('取引更新エラー:', error);
            return false;
        }
    };

    // 取引を削除する関数
    const deleteTransaction = async (id: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('created_by', user.id);

            if (error) throw error;

            setTransactions(prev => prev.filter(transaction => transaction.id !== id));
            return true;
        } catch (error) {
            console.error('取引削除エラー:', error);
            return false;
        }
    };

    // 月次統計を取得する関数
    const getMonthlyStats = (year: number, month: number) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const monthlyTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.created_at);
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
            await Promise.all([
                refreshUserProfile(),
                refreshNotificationSettings(),
                refreshUserFinance(),
                fetchFixedCosts(),
                fetchTransactions()
            ]);
        } catch (error) {
            console.error('データ再取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    // 認証状態の監視とユーザープロフィールの取得
    useEffect(() => {
        const getInitialData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const profile = await fetchUserProfile(user.id);
                    setUserProfile(profile);
                    
                    const settings = await fetchNotificationSettings(user.id);
                    setNotificationSettings(settings);
                    
                    const finance = await fetchUserFinance(user.id);
                    setUserFinance(finance);

                    await fetchFixedCosts();
                    await fetchTransactions();
                }
            } catch (error) {
                console.error('初期データ取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };

        getInitialData();

        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profile = await fetchUserProfile(session.user.id);
                    setUserProfile(profile);
                    
                    const settings = await fetchNotificationSettings(session.user.id);
                    setNotificationSettings(settings);
                    
                    const finance = await fetchUserFinance(session.user.id);
                    setUserFinance(finance);

                    await fetchFixedCosts();
                    await fetchTransactions();
                } else {
                    setUserProfile(null);
                    setNotificationSettings(null);
                    setUserFinance(null);
                    setFixedCosts([]);
                    setTransactions([]);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const value: UserContextType = {
        user,
        userProfile,
        notificationSettings,
        userFinance,
        fixedCosts,
        transactions,
        loading,
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
