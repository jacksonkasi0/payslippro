import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Handle different parameter formats from Supabase
  const token_hash = searchParams.get('token_hash')
  const token = searchParams.get('token')
  const code = searchParams.get('code')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // For password recovery - check if type is recovery OR if we have a code (password reset flow)
  // This handles cases where Supabase doesn't pass the type parameter
  if ((type === 'recovery' && (token_hash || token || code)) || 
      (!type && code)) {
    let tokenParam = ''
    if (token_hash) tokenParam = `token_hash=${token_hash}`
    else if (token) tokenParam = `token=${token}`
    else if (code) tokenParam = `token_hash=${code}` // Pass code as token_hash
    
    redirect(`/auth/confirm-reset?${tokenParam}&type=recovery`)
  }

  // For other types with explicit type parameter, verify the token
  if ((token_hash || token || code) && type && type !== 'recovery') {
    const supabase = await createClient()

    let verifyResult
    if (token_hash) {
      // PKCE flow
      verifyResult = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
    } else if (token) {
      try {
        verifyResult = await supabase.auth.exchangeCodeForSession(token)
      } catch (error) {
        verifyResult = { error }
      }
    } else if (code) {
      try {
        verifyResult = await supabase.auth.exchangeCodeForSession(code)
      } catch (error) {
        verifyResult = { error }
      }
    }
    
    if (verifyResult && !verifyResult.error) {
      // For email confirmation, redirect to specified redirect URL or dashboard
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  const errorType = type === 'recovery' ? 'reset_failed' : 'confirmation_failed'
  redirect(`/auth/login?error=${errorType}`)
}