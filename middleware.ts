import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // デバッグ用ログ（本番環境では削除してください）
  console.log("Middleware - Path:", request.nextUrl.pathname);
  console.log("Middleware - User:", user ? "logged in" : "not logged in");

  // Auth pages should redirect to dashboard if logged in
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    console.log("Redirecting authenticated user to dashboard");
    return NextResponse.redirect(url);
  }

  // Protected pages should redirect to login if not logged in
  const protectedPaths = [
    "/",
    "/todo",
    "/calendar",
    "/settings",
    "/input",
    "/fixed-costs",
  ];
  const isProtectedPath =
    protectedPaths.some((path) => {
      // 完全一致または指定パスで始まる場合
      return (
        request.nextUrl.pathname === path ||
        (path !== "/" && request.nextUrl.pathname.startsWith(path))
      );
    }) || request.nextUrl.pathname.startsWith("/(main)");

  console.log("Middleware - Is protected path:", isProtectedPath);

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    console.log("Redirecting unauthenticated user to login");
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse;
}

export const config = {
  matcher: [
    // (main)グループ内の全てのルートを保護
    "/(main)/:path*",
    // 個別の保護されたパス
    "/",
    "/todo/:path*",
    "/calendar/:path*",
    "/settings/:path*",
    "/input/:path*",
    "/fixed-costs/:path*",
    // 認証関連のページ
    "/login",
    "/signup",
  ],
};
