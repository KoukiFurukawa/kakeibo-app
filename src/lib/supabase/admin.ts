import { createClient } from "@supabase/supabase-js";

/**
 * 管理者権限用のSupabaseクライアント
 * サーバーサイドでのみ使用し、RLSをバイパスできる
 *
 * 注意: このクライアントはサーバーサイドでのみ使用してください
 * クライアントサイドで使用すると重大なセキュリティリスクになります
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing required environment variables for Supabase admin client. " +
        "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * サーバーサイドでのみ使用可能かチェック
 */
function ensureServerSide() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Admin client can only be used on the server side. " +
        "Use the regular client for browser-side operations.",
    );
  }
}

/**
 * 安全な管理者クライアント取得
 */
export function getAdminClient() {
  ensureServerSide();
  return createAdminClient();
}
