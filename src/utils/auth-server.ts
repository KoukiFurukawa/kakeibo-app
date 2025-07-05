import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// サーバーサイドでセッションをチェックする関数
export const checkAuthSessionServer = async (): Promise<boolean> => {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error("Error checking auth session on server:", error);
    return false;
  }
};

// サーバーサイドでユーザー情報を取得する関数
export const getCurrentUserServer = async (): Promise<User | null> => {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user on server:", error);
    return null;
  }
};

// サーバーサイドでセッション情報を取得する関数
export const getSessionServer = async () => {
  try {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session on server:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting session on server:", error);
    return null;
  }
};
