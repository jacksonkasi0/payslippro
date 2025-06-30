import React, { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { GalleryVerticalEnd, ArrowLeft, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Typography from "@/components/ui/typography"
import ConfirmResetClient from "./confirm-reset-client"

type SearchParams = {
  token?: string
  token_hash?: string
  code?: string
  type?: string
}

interface ConfirmResetPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ConfirmResetPage({ searchParams }: ConfirmResetPageProps) {
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
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Typography variant="T_Bold_H3">Confirm Password Reset</Typography>
                <Typography 
                  variant="T_Regular_H6" 
                  className="text-muted-foreground text-balance"
                >
                  Click the button below to confirm that you want to reset your password. This helps protect your account from unauthorized access.
                </Typography>
              </div>
              
              <Suspense fallback={
                <div className="flex flex-col gap-3">
                  <Button disabled className="w-full">
                    <Typography variant="T_SemiBold_H6">Loading...</Typography>
                  </Button>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <Typography variant="T_SemiBold_H6">Back to login</Typography>
                    </Button>
                  </Link>
                </div>
              }>
                <ConfirmResetClient searchParams={params} />
              </Suspense>

              <div className="text-center text-sm">
                <Typography variant="T_Regular_H6" className="text-muted-foreground">
                  If you didn&apos;t request a password reset, you can safely ignore this and your password will remain unchanged.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Confirm password reset illustration"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  )
}