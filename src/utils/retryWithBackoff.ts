import { supabase } from "@/utils/manage_supabase";
import { PostgrestError } from "@supabase/supabase-js";

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T | null> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (attempt === maxRetries) {
        console.error(`最大リトライ回数(${maxRetries})に達しました:`, error);
        return null;
      }

      if (error instanceof PostgrestError) {
        if (
          error?.message?.includes("JWT") ||
          error?.message?.includes("token") ||
          error?.code === "PGRST301"
        ) {
          console.warn(
            "認証トークンエラーを検出、セッションを更新します:",
            error,
          );
          try {
            const { data } = await supabase.auth.refreshSession();
  
            if (!data.session) {
              console.error(
                "セッションを更新できませんでした。再ログインが必要です。",
              );
              return null;
            }
  
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (sessionError) {
            console.error("セッション更新エラー:", sessionError);
          }
        } else {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `取得に失敗しました。${delay}ms後にリトライします (${attempt + 1}/${maxRetries}):`,
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  return null;
};
