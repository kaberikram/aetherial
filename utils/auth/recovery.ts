import type { EmailOtpType } from "@supabase/supabase-js"

export const RESET_PASSWORD_PATH = "/reset-password"
export const EXPIRED_RESET_PATH = "/reset-password?error=expired"
export const MIN_PASSWORD_LENGTH = 6

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]

// Password reset used to send people to /auth/callback?next=/settings.
// Those links are still in inboxes, so /settings remains a recovery signal.
const LEGACY_RECOVERY_PATH = "/settings"

export interface AuthLinkParams {
  code: string | null
  tokenHash: string | null
  type: string | null
  next: string | null
  error: string | null
  errorCode: string | null
}

export type AuthCallbackPlan =
  | { kind: "reject-recovery" }
  | { kind: "reject-login" }
  | {
      kind: "verify-otp"
      tokenHash: string
      otpType: EmailOtpType
      isRecovery: boolean
      nextPath: string
    }
  | {
      kind: "exchange-code"
      code: string
      isRecovery: boolean
      nextPath: string
    }

export function passwordRecoveryRedirectPath(): string {
  return "/auth/callback?next=/reset-password"
}

export function safeInternalPath(value: string | null, fallback = "/home"): string {
  if (!value) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback
  if (value.includes("\\") || value.includes("://")) return fallback
  return value
}

export function isEmailOtpType(value: string | null): value is EmailOtpType {
  return EMAIL_OTP_TYPES.some((type) => type === value)
}

export function isRecoveryNext(path: string): boolean {
  return path === RESET_PASSWORD_PATH || path === LEGACY_RECOVERY_PATH
}

export function planAuthCallback(params: AuthLinkParams): AuthCallbackPlan {
  const nextPath = safeInternalPath(params.next)
  const isRecovery = params.type === "recovery" || isRecoveryNext(nextPath)
  const destination = isRecovery ? RESET_PASSWORD_PATH : nextPath
  const hasAuthError = Boolean(params.error || params.errorCode)

  if (hasAuthError) return isRecovery ? { kind: "reject-recovery" } : { kind: "reject-login" }

  if (params.tokenHash && isEmailOtpType(params.type)) {
    return {
      kind: "verify-otp",
      tokenHash: params.tokenHash,
      otpType: params.type,
      isRecovery: isRecovery || params.type === "recovery",
      nextPath: params.type === "recovery" ? RESET_PASSWORD_PATH : destination,
    }
  }

  if (params.code) {
    return {
      kind: "exchange-code",
      code: params.code,
      isRecovery,
      nextPath: destination,
    }
  }

  return isRecovery ? { kind: "reject-recovery" } : { kind: "reject-login" }
}

export function isExpiredLinkSearch(params: {
  error?: string | null
  error_code?: string | null
}): boolean {
  if (params.error === "expired" || params.error === "access_denied") return true
  if (params.error_code) return true
  return false
}

export function firstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export type PasswordValidationError = "too-short" | "mismatch"

export function validateNewPassword(input: {
  password: string
  confirmPassword: string
}): PasswordValidationError | null {
  if (input.password.length < MIN_PASSWORD_LENGTH) return "too-short"
  if (input.password !== input.confirmPassword) return "mismatch"
  return null
}

export type PasswordUpdateFailure = "session" | "same" | "short" | "generic"

export function classifyPasswordUpdateError(message: string): PasswordUpdateFailure {
  const normalized = message.toLowerCase()
  if (normalized.includes("session") || normalized.includes("jwt") || normalized.includes("not authenticated")) {
    return "session"
  }
  if (normalized.includes("different")) return "same"
  if (normalized.includes("at least") || normalized.includes("weak") || normalized.includes("short")) {
    return "short"
  }
  return "generic"
}
