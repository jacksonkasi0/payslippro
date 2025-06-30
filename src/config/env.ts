// Environment Configuration
// Centralized environment variables configuration

export const env = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // App Configuration
  app: {
    name: 'PayslipPro',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  },
} as const

// Environment validation
const validateEnv = () => {
  const requiredEnvVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  ]

  const missingVars = requiredEnvVars.filter(
    (envVar) => !envVar.value || envVar.value.trim() === ''
  )

  if (missingVars.length > 0) {
    console.error('Environment Variables Status:')
    requiredEnvVars.forEach(envVar => {
      console.error(`${envVar.name}: ${envVar.value ? '✓ Set' : '✗ Missing'}`)
    })
    
    throw new Error(
      `Missing required environment variables: ${missingVars.map(v => v.name).join(', ')}`
    )
  }
}

// Always validate environment variables to catch missing values early
try {
  validateEnv()
} catch (error) {
  console.error('Environment validation failed:', error)
  // In development, provide helpful guidance
  if (process.env.NODE_ENV === 'development') {
    console.error('\n🔧 To fix this issue:')
    console.error('1. Create a .env.local file in your project root')
    console.error('2. Add your Supabase credentials:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"')
    console.error('3. Find these values at: https://supabase.com/dashboard/project/_/settings/api\n')
  }
  // Don't throw in development to allow hot reloading, but do throw in production
  if (process.env.NODE_ENV === 'production') {
    throw error
  }
}

// Export validation function for manual use
export { validateEnv }

export default env