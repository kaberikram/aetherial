import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Handle root path (/)
    if (request.nextUrl.pathname === '/') {
      if (user) {
        // If authenticated, redirect to /home
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        return NextResponse.redirect(url)
      }
      // If not authenticated, show landing page
      return supabaseResponse
    }

    // The old callback sent some sessions to a page that was never built.
    // Keep that URL from 404ing, and keep it off the signup verification screen.
    if (request.nextUrl.pathname === '/auth/confirm-email') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Recovery links must reach the set-password page even if a redirect
    // lands on login or signup, including when a recovery session exists.
    const recoveryType = request.nextUrl.searchParams.get('type')
    const onAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
    if (onAuthPage && recoveryType === 'recovery') {
      const url = request.nextUrl.clone()
      url.pathname = '/reset-password'
      return NextResponse.redirect(url)
    }

    // A recovery session is authenticated. Allow the set-password page for
    // that session, and also allow it without a session so an expired link
    // can explain itself. Do not treat it as /login or /signup.
    if (request.nextUrl.pathname === '/reset-password') {
      return supabaseResponse
    }

    // Redirect /profile to /settings
    if (request.nextUrl.pathname.startsWith('/profile')) {
      const url = request.nextUrl.clone()
      url.pathname = '/settings'
      return NextResponse.redirect(url)
    }

    // Redirect /explore to /home (feature removed)
    if (request.nextUrl.pathname.startsWith('/explore')) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/home', '/settings', '/capture']
    if (!user && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    const authRoutes = ['/login', '/signup']
    if (user && authRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next({
      request,
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 