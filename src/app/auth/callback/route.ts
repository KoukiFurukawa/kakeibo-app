import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    async getAll() {
                        return (await cookieStore).getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(async ({ name, value, options }) =>
                            (await cookieStore).set(name, value, options)
                        )
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // 本番環境でのベースURLを環境変数から取得
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || process.env.NEXTAUTH_URL
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            let redirectUrl: string
            
            if (isLocalEnv) {
                // 開発環境ではoriginを使用
                redirectUrl = `${origin}${next}`
            } else if (baseUrl) {
                // 環境変数で設定されたベースURLを優先使用
                const formattedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
                redirectUrl = `${formattedBaseUrl}${next}`
            } else if (forwardedHost) {
                // X-Forwarded-Hostヘッダーがある場合
                redirectUrl = `https://${forwardedHost}${next}`
            } else {
                // フォールバック：originを使用
                redirectUrl = `${origin}${next}`
            }
            
            return NextResponse.redirect(redirectUrl)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
