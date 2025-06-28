/**
 * 環境変数の検証とタイプセーフティ
 */

interface IRequiredEnvVars {
  // 公開される環境変数（ブラウザでアクセス可能）
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
}

interface IOptionalEnvVars {
  // サーバーサイドのみの環境変数（秘匿情報）
  SUPABASE_SERVICE_ROLE_KEY?: string
  SUPABASE_DB_PASSWORD?: string
  GOOGLE_APP_PASSWORD?: string
  GOOGLE_MAIL?: string
  G_PASS?: string
  NODE_ENV?: string
}

type EnvVars = IRequiredEnvVars & IOptionalEnvVars

/**
 * 必須の環境変数をチェック
 */
export function validateEnvVars(): IRequiredEnvVars {
  const env = process.env as Partial<EnvVars>
  
  const missing: string[] = []
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}

/**
 * サーバーサイド専用の環境変数を取得
 */
export function getServerEnvVars() {
  // サーバーサイドでのみ実行可能
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables cannot be accessed on the client side')
  }
  
  return {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
    GOOGLE_APP_PASSWORD: process.env.GOOGLE_APP_PASSWORD,
    GOOGLE_MAIL: process.env.GOOGLE_MAIL,
    G_PASS: process.env.G_PASS,
    NODE_ENV: process.env.NODE_ENV,
  }
}

/**
 * 開発環境での環境変数状態表示
 */
export function logEnvStatus() {
  if (process.env.NODE_ENV !== 'development') return
  
  const env = validateEnvVars()
  const serverEnv = getServerEnvVars()
  
  console.group('🔧 Environment Variables Status')
  
  console.group('📢 Public Variables (accessible in browser)')
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '❌ Missing')
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '❌ Missing')
  console.groupEnd()
  
  console.group('🔒 Private Variables (server-only)')
  Object.entries(serverEnv).forEach(([key, value]) => {
    console.log(`${value ? '✅' : '⚠️'} ${key}:`, value ? '✓ Set' : '❌ Missing')
  })
  console.groupEnd()
  
  console.groupEnd()
}

/**
 * 本番環境での設定チェック
 */
export function validateProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return
  
  const requiredForProduction = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missing = requiredForProduction.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(
      `Production deployment missing required environment variables: ${missing.join(', ')}`
    )
  }
  
  console.log('✅ Production environment variables validated')
}
