import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            PaySlip Pro
          </h1>
          <p className="text-muted-foreground">
            Professional payslip management system
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}