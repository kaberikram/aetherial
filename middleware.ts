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

    // Redirect /profile to /settings
    if (request.nextUrl.pathname.startsWith('/profile')) {
      const url = request.nextUrl.clone()
      url.pathname = '/settings'
      return NextResponse.redirect(url)
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/home', '/settings', '/capture', '/explore']
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