import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/config/env'

export async function updateSession(request: NextRequest) {
  // Skip Supabase processing for password reset CLIENT pages to prevent token consumption
  // But allow it for /auth/confirm which needs to verify tokens server-side
  const isPasswordResetClientRoute = 
    request.nextUrl.pathname.startsWith('/auth/confirm-reset') ||
    request.nextUrl.pathname.startsWith('/auth/reset-password')

  // For password reset client routes, return early without any Supabase processing
  if (isPasswordResetClientRoute) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.supabase.url,
    env.supabase.anonKey,
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // no user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (except callback)
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
     request.nextUrl.pathname.startsWith('/auth/signup')) &&
    !request.nextUrl.pathname.startsWith('/auth/callback')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
} 