import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                // セッションのリフレッシュを強化
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            },
            global: {
                headers: {
                    'x-application-name': 'kakeibo-app',
                },
            },
        }
    )
}
