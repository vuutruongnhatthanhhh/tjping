import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const referer = request.headers.get("referer");
  const refererPathname = referer
    ? (() => {
        try {
          return new URL(referer).pathname;
        } catch {
          return "";
        }
      })()
    : "";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isResetPasswordPage = pathname.startsWith("/reset-password");
  const isLoginFromRecovery =
    pathname.startsWith("/login") &&
    request.nextUrl.searchParams.get("fromRecovery") === "1";
  const isLoginFromResetPassword =
    pathname.startsWith("/login") &&
    refererPathname.startsWith("/reset-password");
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    isResetPasswordPage ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/api/auth/");
  const isCronRoute = pathname.startsWith("/api/cron/");
  const isProtectedRoute = !isAuthPage && !isCronRoute;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    isAuthPage &&
    !isResetPasswordPage &&
    !isLoginFromRecovery &&
    !isLoginFromResetPassword
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
