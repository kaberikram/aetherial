import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form"
import { firstSearchParam, isExpiredLinkSearch } from "@/utils/auth/recovery"

export const metadata: Metadata = {
  title: "Set a new password - Aetherial",
}

export const dynamic = "force-dynamic"

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const code = firstSearchParam(params.code)
  const tokenHash = firstSearchParam(params.token_hash)
  const type = firstSearchParam(params.type)

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/reset-password`)
  }

  if (tokenHash) {
    const otpType = type || "recovery"
    redirect(
      `/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(otpType)}&next=/reset-password`
    )
  }

  const linkExpired = isExpiredLinkSearch({
    error: firstSearchParam(params.error),
    error_code: firstSearchParam(params.error_code),
  })

  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm linkExpired={linkExpired} />
    </Suspense>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  )
}

interface ResetPasswordPageProps {
  searchParams: Promise<ResetPasswordSearchParams>
}

interface ResetPasswordSearchParams {
  error?: string | string[]
  error_code?: string | string[]
  code?: string | string[]
  token_hash?: string | string[]
  type?: string | string[]
}
