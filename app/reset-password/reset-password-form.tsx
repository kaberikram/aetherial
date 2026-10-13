"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Check, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { createClient } from "@/utils/supabase/client"
import {
  classifyPasswordUpdateError,
  passwordRecoveryRedirectPath,
  validateNewPassword,
} from "@/utils/auth/recovery"

export function ResetPasswordForm({ linkExpired }: ResetPasswordFormProps) {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const [phase, setPhase] = useState<ResetPhase>(linkExpired ? "expired" : "checking")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const copy = translations[language]

  useMountEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage === "en" || savedLanguage === "ms") setLanguage(savedLanguage)
  })

  useMountEffect(() => {
    if (linkExpired) return

    let cancelled = false
    let foundSession = false
    let unsubscribe = () => {}
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const hashError = hashParams.get("error") || hashParams.get("error_code")
    if (hashError) {
      setPhase("expired")
      return
    }

    async function resolveRecoverySession() {
      try {
        const supabase = createClient()
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled || !session || event !== "PASSWORD_RECOVERY") return
          foundSession = true
          setPhase("ready")
        })
        unsubscribe = () => subscription.unsubscribe()

        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        if (accessToken && refreshToken && hashParams.get("type") === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (cancelled) return
          if (error) {
            setPhase("expired")
            return
          }
          window.history.replaceState(null, "", "/reset-password")
          foundSession = true
          setPhase("ready")
          return
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (cancelled || foundSession) return
        setPhase(user ? "ready" : "expired")
      } catch (error) {
        console.error("Could not read the password recovery session:", error)
        if (!cancelled) setPhase("expired")
      }
    }

    void resolveRecoverySession()

    return () => {
      cancelled = true
      unsubscribe()
    }
  })

  async function handleSetPassword(event: FormEvent) {
    event.preventDefault()
    setFormError("")

    const validationError = validateNewPassword({ password, confirmPassword })
    if (validationError === "too-short") {
      setFormError(copy.passwordLength)
      return
    }
    if (validationError === "mismatch") {
      setFormError(copy.passwordMismatch)
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.error("Password update failed:", error.message)
        const failure = classifyPasswordUpdateError(error.message)
        if (failure === "session") {
          setPhase("expired")
          return
        }
        if (failure === "same") {
          setFormError(copy.passwordSame)
          return
        }
        if (failure === "short") {
          setFormError(copy.passwordLength)
          return
        }
        setFormError(copy.updateFailed)
        return
      }

      setPhase("success")
      window.setTimeout(() => {
        router.replace("/home")
        router.refresh()
      }, 1400)
    } catch (error) {
      console.error("Unexpected password update error:", error)
      setFormError(copy.updateFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRequestNewLink() {
    if (!resetEmail || !resetEmail.includes("@")) {
      toast.error(copy.resetFailed)
      return
    }

    setIsSendingReset(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}${passwordRecoveryRedirectPath()}`,
      })
      if (error) {
        console.error("Password reset email failed:", error.message)
        toast.error(copy.resetFailed)
        return
      }
      toast.success(copy.resetSent)
    } catch (error) {
      console.error("Unexpected password reset email error:", error)
      toast.error(copy.resetFailed)
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="p-4">
        <Link href="/login" className="flex items-center text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>{copy.backToLogin}</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50">
          {phase === "checking" ? <CheckingState label={copy.checking} /> : null}
          {phase === "expired" ? (
            <ExpiredState
              copy={copy}
              email={resetEmail}
              isSending={isSendingReset}
              onEmailChange={setResetEmail}
              onRequestNewLink={() => {
                void handleRequestNewLink()
              }}
            />
          ) : null}
          {phase === "ready" ? (
            <PasswordForm
              copy={copy}
              password={password}
              confirmPassword={confirmPassword}
              formError={formError}
              isSubmitting={isSubmitting}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={(event) => {
                void handleSetPassword(event)
              }}
            />
          ) : null}
          {phase === "success" ? <SuccessState copy={copy} /> : null}
        </div>
      </main>
    </div>
  )
}

function CheckingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-zinc-400">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p>{label}</p>
    </div>
  )
}

function PasswordForm({
  copy,
  password,
  confirmPassword,
  formError,
  isSubmitting,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: PasswordFormProps) {
  return (
    <>
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
          {copy.title}
        </h1>
        <p className="text-zinc-400">{copy.description}</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-zinc-200">
            {copy.newPassword}
          </Label>
          <Input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
            className="bg-zinc-800/50 border-zinc-700/50 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-zinc-200">
            {copy.confirmPassword}
          </Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            required
            className="bg-zinc-800/50 border-zinc-700/50 text-white"
          />
        </div>

        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <GradientButton type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              {copy.updating}
            </span>
          ) : (
            copy.submit
          )}
        </GradientButton>
      </form>
    </>
  )
}

function ExpiredState({ copy, email, isSending, onEmailChange, onRequestNewLink }: ExpiredStateProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
      </div>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">{copy.expiredTitle}</h1>
        <p className="text-zinc-400">{copy.expiredDescription}</p>
      </div>

      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-zinc-200">
            {copy.emailAddress}
          </Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="dreamjournal@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button
          type="button"
          onClick={onRequestNewLink}
          disabled={isSending || !email}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
        >
          {isSending ? copy.sending : copy.sendResetLink}
        </Button>
      </div>
    </div>
  )
}

function SuccessState({ copy }: { copy: ResetCopy }) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
      </div>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">{copy.successTitle}</h1>
        <p className="text-zinc-400">{copy.successDescription}</p>
      </div>
      <GradientButton asChild className="w-full">
        <Link href="/home">{copy.goHome}</Link>
      </GradientButton>
    </div>
  )
}

const translations = {
  en: {
    backToLogin: "Back to login",
    checking: "Checking your reset link...",
    title: "Set a new password",
    description: "Choose a new password for your account.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    submit: "Update password",
    updating: "Updating...",
    passwordMismatch: "Passwords must match",
    passwordLength: "Password must be at least 6 characters",
    passwordSame: "Choose a different password from your current one.",
    updateFailed: "Could not update your password. Please try again.",
    successTitle: "Password updated",
    successDescription: "Your password has been changed. Taking you home.",
    goHome: "Go to home",
    expiredTitle: "This link has expired",
    expiredDescription: "This reset link is invalid or has expired. Request a new one.",
    emailAddress: "Email address",
    sendResetLink: "Send reset link",
    sending: "Sending...",
    resetSent: "Password reset email sent. Please check your inbox.",
    resetFailed: "Failed to send password reset email. Please try again.",
  },
  ms: {
    backToLogin: "Kembali ke log masuk",
    checking: "Menyemak pautan tetapan semula anda...",
    title: "Tetapkan kata laluan baharu",
    description: "Pilih kata laluan baharu untuk akaun anda.",
    newPassword: "Kata laluan baharu",
    confirmPassword: "Sahkan kata laluan",
    submit: "Kemas kini kata laluan",
    updating: "Mengemas kini...",
    passwordMismatch: "Kata laluan mesti sepadan",
    passwordLength: "Kata laluan mesti sekurang-kurangnya 6 aksara",
    passwordSame: "Pilih kata laluan yang berbeza daripada kata laluan semasa.",
    updateFailed: "Tidak dapat mengemas kini kata laluan. Sila cuba lagi.",
    successTitle: "Kata laluan dikemas kini",
    successDescription: "Kata laluan anda telah ditukar. Membawa anda ke laman utama.",
    goHome: "Pergi ke laman utama",
    expiredTitle: "Pautan ini telah tamat tempoh",
    expiredDescription: "Pautan tetapan semula ini tidak sah atau telah tamat tempoh. Minta pautan baharu.",
    emailAddress: "Alamat e-mel",
    sendResetLink: "Hantar pautan tetapan semula",
    sending: "Menghantar...",
    resetSent: "E-mel tetapan semula kata laluan dihantar. Sila periksa peti masuk anda.",
    resetFailed: "Gagal menghantar e-mel tetapan semula kata laluan. Sila cuba lagi.",
  },
}

interface ResetPasswordFormProps {
  linkExpired: boolean
}

interface PasswordFormProps {
  copy: ResetCopy
  password: string
  confirmPassword: string
  formError: string
  isSubmitting: boolean
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

interface ExpiredStateProps {
  copy: ResetCopy
  email: string
  isSending: boolean
  onEmailChange: (value: string) => void
  onRequestNewLink: () => void
}

type Language = keyof typeof translations
type ResetCopy = (typeof translations)["en"]
type ResetPhase = "checking" | "ready" | "expired" | "success"
