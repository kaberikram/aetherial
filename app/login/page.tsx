"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [resetPasswordEmail, setResetPasswordEmail] = useState("")
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [cooldownTime, setCooldownTime] = useState(0)
  const [resetCooldownTime, setResetCooldownTime] = useState(0)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Countdown effect for resend cooldown
  useEffect(() => {
    if (cooldownTime <= 0) return

    const interval = setInterval(() => {
      setCooldownTime(time => {
        if (time <= 1) return 0
        return time - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldownTime])

  // Countdown effect for password reset cooldown
  useEffect(() => {
    if (resetCooldownTime <= 0) return

    const interval = setInterval(() => {
      setResetCooldownTime(time => {
        if (time <= 1) return 0
        return time - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [resetCooldownTime])

  const translations = {
    en: {
      login: "Login",
      backHome: "Back to home",
      emailAddress: "Email address",
      password: "Password",
      loginButton: "Login",
      signUp: "Don't have an account? Sign up",
      loginFailed: "Login failed",
      loginSuccess: "Logged in successfully",
      emailNotVerified: "Email not verified. Please check your inbox or resend verification email.",
      resendVerification: "Resend Verification Email",
      verificationSent: "Verification email sent. Please check your inbox.",
      verificationFailed: "Failed to send verification email. Please try again.",
      cooldownMessage: "You can request another email in {seconds} seconds",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset Password",
      resetPasswordDescription: "Enter your email address below. We'll send you a link to reset your password.",
      resetPasswordButton: "Send Reset Link",
      resetPasswordSuccess: "Password reset email sent. Please check your inbox.",
      resetPasswordFailed: "Failed to send password reset email. Please try again.",
      cancel: "Cancel"
    },
    ms: {
      login: "Log Masuk",
      backHome: "Kembali ke laman utama",
      emailAddress: "Alamat e-mel",
      password: "Kata laluan",
      loginButton: "Log Masuk",
      signUp: "Tiada akaun? Daftar",
      loginFailed: "Log masuk gagal",
      loginSuccess: "Berjaya log masuk",
      emailNotVerified: "E-mel belum disahkan. Sila periksa inbox anda atau hantar semula e-mel pengesahan.",
      resendVerification: "Hantar Semula E-mel Pengesahan",
      verificationSent: "E-mel pengesahan dihantar. Sila periksa inbox anda.",
      verificationFailed: "Gagal menghantar e-mel pengesahan. Sila cuba lagi.",
      cooldownMessage: "Anda boleh meminta e-mel lain dalam {seconds} saat",
      forgotPassword: "Lupa kata laluan?",
      resetPassword: "Tetapkan Semula Kata Laluan",
      resetPasswordDescription: "Masukkan alamat e-mel anda di bawah. Kami akan menghantar pautan untuk menetapkan semula kata laluan anda.",
      resetPasswordButton: "Hantar Pautan Tetapan Semula",
      resetPasswordSuccess: "E-mel tetapan semula kata laluan dihantar. Sila periksa inbox anda.",
      resetPasswordFailed: "Gagal menghantar e-mel tetapan semula kata laluan. Sila cuba lagi.",
      cancel: "Batal"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowVerificationMessage(false)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if the error is due to email not being verified
        if (error.message.includes("Email not confirmed") || 
            error.message.includes("Email not verified") ||
            error.message.toLowerCase().includes("email confirmation")) {
          setShowVerificationMessage(true)
          toast.error(translations[language].emailNotVerified)
        } else {
          toast.error(translations[language].loginFailed)
        }
        console.error("Login error:", error.message)
        return
      }

      toast.success(translations[language].loginSuccess)
      router.push('/home')
      router.refresh()
      
    } catch (error) {
      console.error("Unexpected error during login:", error)
      toast.error(translations[language].loginFailed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (cooldownTime > 0) return
    
    setIsSendingVerification(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Check if it's a cooldown error
        if (error.message.includes("security purposes") || error.message.includes("45 seconds")) {
          setCooldownTime(45)
          toast.error(translations[language].cooldownMessage.replace('{seconds}', '45'))
        } else {
          toast.error(translations[language].verificationFailed)
        }
        console.error("Verification resend error:", error.message)
        return
      }

      toast.success(translations[language].verificationSent)
      // Set cooldown after successful send
      setCooldownTime(45)
    } catch (error) {
      console.error("Unexpected error during verification resend:", error)
      toast.error(translations[language].verificationFailed)
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleResetPassword = async () => {
    if (resetCooldownTime > 0) return
    if (!resetPasswordEmail || !resetPasswordEmail.includes('@')) {
      toast.error(translations[language].resetPasswordFailed)
      return
    }
    
    setIsSendingPasswordReset(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      })

      if (error) {
        // Check if it's a cooldown error
        if (error.message.includes("security purposes") || error.message.includes("45 seconds")) {
          setResetCooldownTime(45)
          toast.error(translations[language].cooldownMessage.replace('{seconds}', '45'))
        } else {
          toast.error(translations[language].resetPasswordFailed)
        }
        console.error("Password reset error:", error.message)
        return
      }

      toast.success(translations[language].resetPasswordSuccess)
      setShowResetPasswordModal(false)
      // Set cooldown after successful send
      setResetCooldownTime(45)
    } catch (error) {
      console.error("Unexpected error during password reset:", error)
      toast.error(translations[language].resetPasswordFailed)
    } finally {
      setIsSendingPasswordReset(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="p-4">
        <Link href="/" className="flex items-center text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>{translations[language].backHome}</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              {translations[language].login}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-200">
                {translations[language].emailAddress}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="dreamjournal@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-200">
                  {translations[language].password}
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordEmail(email)
                    setShowResetPasswordModal(true)
                  }}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {translations[language].forgotPassword}
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800/50 border-zinc-700/50 text-white"
              />
            </div>

            {showVerificationMessage && (
              <div className="space-y-2">
                <p className="text-amber-400 text-sm">
                  {translations[language].emailNotVerified}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isSendingVerification || !email || cooldownTime > 0}
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/50 h-11"
                >
                  {isSendingVerification ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin mr-2"></div>
                      <span>Sending...</span>
                    </div>
                  ) : cooldownTime > 0 ? (
                    translations[language].cooldownMessage.replace('{seconds}', cooldownTime.toString())
                  ) : (
                    translations[language].resendVerification
                  )}
                </Button>
              </div>
            )}

            <GradientButton
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                translations[language].loginButton
              )}
            </GradientButton>
          </form>

          <div className="text-center">
            <Link href="/signup" className="text-zinc-400 hover:text-white transition-colors">
              {translations[language].signUp}
            </Link>
          </div>
        </div>
      </main>

      {/* Password Reset Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {translations[language].resetPassword}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {translations[language].resetPasswordDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-zinc-200">
                {translations[language].emailAddress}
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="dreamjournal@example.com"
                value={resetPasswordEmail}
                onChange={(e) => setResetPasswordEmail(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResetPasswordModal(false)}
              className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/50"
            >
              {translations[language].cancel}
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isSendingPasswordReset || !resetPasswordEmail || resetCooldownTime > 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSendingPasswordReset ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-white rounded-full animate-spin mr-2"></div>
                  <span>Sending...</span>
                </div>
              ) : resetCooldownTime > 0 ? (
                translations[language].cooldownMessage.replace('{seconds}', resetCooldownTime.toString())
              ) : (
                translations[language].resetPasswordButton
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 