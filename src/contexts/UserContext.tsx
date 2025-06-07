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

interface UserContextType {
    authUser: User | null;
    userProfile: UserProfile | null;
    notificationSettings: UserNotificationSettings | null;
    loading: boolean;
    refreshUserProfile: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
    refreshNotificationSettings: () => Promise<void>;
    updateNotificationSettings: (updates: Partial<UserNotificationSettings>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(null);
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
        if (!authUser) return false;

        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', authUser.id)
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
        if (!authUser) return;
        const profile = await fetchUserProfile(authUser.id);
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
        if (!authUser) return false;

        try {
            const { data, error } = await supabase
                .from('notification_settings')
                .update(updates)
                .eq('id', authUser.id)
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
        if (!authUser) return;
        const settings = await fetchNotificationSettings(authUser.id);
        setNotificationSettings(settings);
    };

    // 認証状態の監視とユーザープロフィールの取得
    useEffect(() => {
        const getInitialData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setAuthUser(user);

                if (user) {
                    const profile = await fetchUserProfile(user.id);
                    setUserProfile(profile);
                    
                    const settings = await fetchNotificationSettings(user.id);
                    setNotificationSettings(settings);
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
                setAuthUser(session?.user ?? null);

                if (session?.user) {
                    const profile = await fetchUserProfile(session.user.id);
                    setUserProfile(profile);
                    
                    const settings = await fetchNotificationSettings(session.user.id);
                    setNotificationSettings(settings);
                } else {
                    setUserProfile(null);
                    setNotificationSettings(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{
            authUser,
            userProfile,
            notificationSettings,
            loading,
            refreshUserProfile,
            updateUserProfile,
            refreshNotificationSettings,
            updateNotificationSettings
        }}>
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
