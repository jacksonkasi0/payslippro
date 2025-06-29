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

// Only validate environment on server-side and in production builds
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
  try {
    validateEnv()
  } catch (error) {
    console.error('Environment validation failed:', error)
    // Don't throw in development to allow hot reloading
  }
}

// Export validation function for manual use
export { validateEnv }

export default env