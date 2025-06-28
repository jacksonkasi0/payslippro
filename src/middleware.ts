import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define paths that should be protected
  const isProtectedPath = path.startsWith('/dashboard')

  // Define paths that should redirect to dashboard if already authenticated
  const isAuthPath = path.startsWith('/auth')

  // Check if user has a session (this is a basic check, in production you might want to verify the JWT)
  const hasSession = request.cookies.has('sb-access-token') || request.cookies.has('sb-refresh-token')

  if (isProtectedPath && !hasSession) {
    // Redirect to login if trying to access protected route without session
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthPath && hasSession && path !== '/auth/reset-password') {
    // Redirect to dashboard if trying to access auth pages while logged in
    // except for reset-password which should be accessible
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 