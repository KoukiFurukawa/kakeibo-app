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

interface UserContextType {
    authUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    refreshUserProfile: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // ユーザープロフィールを取得する関数
    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // if (error.code === 'PGRST116') {
                //     // ユーザーレコードが存在しない場合は新規作成
                //     const { data: authData } = await supabase.auth.getUser();
                //     if (authData.user) {
                //         const newProfile: Partial<UserProfile> = {
                //             id: authData.user.id,
                //             email: authData.user.email!,
                //             username: null,
                //             target_month_savings: 0,
                //             notifications: true
                //         };

                //         const { data: createdData, error: createError } = await supabase
                //             .from('users')
                //             .insert(newProfile)
                //             .select()
                //             .single();

                //         if (createError) throw createError;
                //         return createdData;
                //     }
                // }
                throw error;
            }

            return data;
        } catch (error) {
            console.error('ユーザープロフィール取得エラー:', error);
            return null;
        }
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

    // 認証状態の監視とユーザープロフィールの取得
    useEffect(() => {
        const getInitialData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setAuthUser(user);

                if (user) {
                    const profile = await fetchUserProfile(user.id);
                    setUserProfile(profile);
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
                } else {
                    setUserProfile(null);
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
            loading,
            refreshUserProfile,
            updateUserProfile
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
