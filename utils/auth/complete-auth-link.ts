import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  EXPIRED_RESET_PATH,
  planAuthCallback,
  type AuthCallbackPlan,
} from "@/utils/auth/recovery"

// Signup confirmation and password recovery both return to /auth/callback.
// Recovery must never continue into the app, and it must never be treated as
// the signup "verify your email" step. /auth/confirm-email does not exist;
// the only screen with that copy is the post-signup state on /signup.
export async function completeAuthLink(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const plan = planAuthCallback({
    code: requestUrl.searchParams.get("code"),
    tokenHash: requestUrl.searchParams.get("token_hash"),
    type: requestUrl.searchParams.get("type"),
    next: requestUrl.searchParams.get("next"),
    error: requestUrl.searchParams.get("error"),
    errorCode: requestUrl.searchParams.get("error_code"),
  })

  switch (plan.kind) {
    case "reject-recovery":
      return redirectTo(request, EXPIRED_RESET_PATH)
    case "reject-login":
      return redirectTo(request, "/login")
    case "verify-otp":
      return verifyAndRedirect(request, plan)
    case "exchange-code":
      return exchangeAndRedirect(request, plan)
    default: {
      const unreachable: never = plan
      throw new Error(`Unhandled auth link plan: ${String(unreachable)}`)
    }
  }
}

async function verifyAndRedirect(
  request: NextRequest,
  plan: Extract<AuthCallbackPlan, { kind: "verify-otp" }>
): Promise<NextResponse> {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type: plan.otpType,
    token_hash: plan.tokenHash,
  })

  if (error) return redirectTo(request, plan.isRecovery ? EXPIRED_RESET_PATH : "/login")
  if (plan.isRecovery) return redirectTo(request, "/reset-password")
  return redirectTo(request, plan.nextPath)
}

async function exchangeAndRedirect(
  request: NextRequest,
  plan: Extract<AuthCallbackPlan, { kind: "exchange-code" }>
): Promise<NextResponse> {
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(plan.code)

  // The PKCE code verifier cookie exists only in the browser that requested
  // the reset. Opening the email on another device fails here.
  if (error) return redirectTo(request, plan.isRecovery ? EXPIRED_RESET_PATH : "/login")
  if (plan.isRecovery) return redirectTo(request, "/reset-password")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const emailConfirmationRequired = process.env.NEXT_PUBLIC_SUPABASE_EMAIL_CONFIRMATION === "true"
  if (user?.email_confirmed_at || !emailConfirmationRequired) {
    return redirectTo(request, plan.nextPath)
  }

  return redirectTo(request, "/login")
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url))
}
