import React, { Suspense } from "react"
import Image from "next/image"
import { GalleryVerticalEnd } from "lucide-react"
import Typography from "@/components/ui/typography"
import LoginClient from "./login-client"

type SearchParams = {
  error?: string
}

interface LoginPageProps {
  searchParams: Promise<SearchParams>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const APP_NAME = "PaySlip Pro"

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <Typography variant="T_SemiBold_H6">{APP_NAME}</Typography>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading login form...</p>
              </div>
            }>
              <LoginClient searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Login illustration"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  )
}