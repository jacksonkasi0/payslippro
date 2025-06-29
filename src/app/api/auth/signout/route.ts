import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Sign out server-side
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Server-side signout error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to sign out' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Signed out successfully' 
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 