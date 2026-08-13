import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_EMAILS = ['admin@inflationos.app', 'admin@inflationos.com'];

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh / validate the Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Protect dashboard
  if (pathname.startsWith('/dashboard') && !user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';

    const response = NextResponse.redirect(redirectUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  }

  // Protect admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';

      const response = NextResponse.redirect(redirectUrl);

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });

      return response;
    }

    const email = user.email ?? '';

    if (!ADMIN_EMAILS.includes(email)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';

      const response = NextResponse.redirect(redirectUrl);

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });

      return response;
    }
  }

  // Authenticated user shouldn't stay on login/signup
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';

    const response = NextResponse.redirect(redirectUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/onboarding',
  ],
};