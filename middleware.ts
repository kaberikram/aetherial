import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect root path to /home if user has visited before
  if (request.nextUrl.pathname === '/') {
    // Check if user has visited before using cookies
    const hasVisitedBefore = request.cookies.has('visited_before')
    
    if (hasVisitedBefore) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    } else {
      // Set a cookie to remember that the user has visited
      const response = NextResponse.next()
      response.cookies.set('visited_before', 'true', { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/' 
      })
      return response
    }
  }

  // Redirect /profile to /settings
  if (request.nextUrl.pathname.startsWith('/profile')) {
    const url = request.nextUrl.clone()
    url.pathname = '/settings'
    return NextResponse.redirect(url)
  }

  // No authentication checks - just pass through all requests
  return NextResponse.next()
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