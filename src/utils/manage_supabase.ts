import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

export const supabase = createClient();

export const useHandleLogout = () => {
    const router = useRouter();
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };
    
    return handleLogout;
};

// 認証状態を管理するカスタムフック（クライアント側のみ）
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 初期セッションを取得
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session?.user);
            setLoading(false);
        };

        getInitialSession();

        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
                setIsAuthenticated(!!session?.user);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return {
        user,
        loading,
        isAuthenticated,
    };
};

// セッションが有効かチェックする関数（クライアント側）
export const checkAuthSession = async (): Promise<boolean> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session?.user;
    } catch (error) {
        console.error('Error checking auth session:', error);
        return false;
    }
};

// ユーザー情報を取得する関数（クライアント側）
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};