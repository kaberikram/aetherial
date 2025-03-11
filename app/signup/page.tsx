"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [showVerificationUI, setShowVerificationUI] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [cooldownTime, setCooldownTime] = useState(0)

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

  const translations = {
    en: {
      signup: "Sign Up",
      backHome: "Back to home",
      emailAddress: "Email address",
      password: "Password",
      confirmPassword: "Confirm Password",
      createAccount: "Create Account",
      login: "Already have an account? Login",
      signupFailed: "Signup failed",
      signupSuccess: "Account created successfully",
      passwordMatch: "Passwords must match",
      passwordLength: "Password must be at least 6 characters",
      emailVerification: "Verify Your Email",
      emailVerificationDescription: "We've sent a verification link to your email. Please check your inbox and click the link to verify your account.",
      emailVerificationNote: "If you don't see the email, check your spam folder or request a new verification email.",
      resendVerification: "Resend Verification Email",
      verificationSent: "Verification email sent. Please check your inbox.",
      verificationFailed: "Failed to send verification email. Please try again.",
      goToLogin: "Go to Login",
      cooldownMessage: "You can request another email in {seconds} seconds"
    },
    ms: {
      signup: "Daftar",
      backHome: "Kembali ke laman utama",
      emailAddress: "Alamat e-mel",
      password: "Kata laluan",
      confirmPassword: "Sahkan Kata Laluan",
      createAccount: "Cipta Akaun",
      login: "Sudah mempunyai akaun? Log masuk",
      signupFailed: "Pendaftaran gagal",
      signupSuccess: "Akaun berjaya dicipta",
      passwordMatch: "Kata laluan mesti sepadan",
      passwordLength: "Kata laluan mesti sekurang-kurangnya 6 aksara",
      emailVerification: "Sahkan E-mel Anda",
      emailVerificationDescription: "Kami telah menghantar pautan pengesahan ke e-mel anda. Sila periksa peti masuk anda dan klik pautan untuk mengesahkan akaun anda.",
      emailVerificationNote: "Jika anda tidak melihat e-mel, periksa folder spam anda atau minta e-mel pengesahan baru.",
      resendVerification: "Hantar Semula E-mel Pengesahan",
      verificationSent: "E-mel pengesahan dihantar. Sila periksa inbox anda.",
      verificationFailed: "Gagal menghantar e-mel pengesahan. Sila cuba lagi.",
      goToLogin: "Pergi ke Log Masuk",
      cooldownMessage: "Anda boleh meminta e-mel lain dalam {seconds} saat"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast.error(translations[language].passwordMatch)
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error(translations[language].passwordLength)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(translations[language].signupFailed)
        console.error("Signup error:", error.message)
        return
      }

      toast.success(translations[language].signupSuccess)
      setShowVerificationUI(true)
      // Start the cooldown timer immediately since an email was already sent during signup
      setCooldownTime(45)
      
    } catch (error) {
      console.error("Unexpected error during signup:", error)
      toast.error(translations[language].signupFailed)
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
          {!showVerificationUI ? (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                  {translations[language].signup}
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
                  <Label htmlFor="password" className="text-zinc-200">
                    {translations[language].password}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-zinc-800/50 border-zinc-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-200">
                    {translations[language].confirmPassword}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-zinc-800/50 border-zinc-700/50 text-white"
                  />
                </div>

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
                    translations[language].createAccount
                  )}
                </GradientButton>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
                  {translations[language].login}
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  {translations[language].emailVerification}
                </h2>
                <p className="text-zinc-400">
                  {translations[language].emailVerificationDescription}
                </p>
                <p className="text-zinc-500 text-sm">
                  {translations[language].emailVerificationNote}
                </p>
              </div>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Button
                    onClick={handleResendVerification}
                    disabled={isSendingVerification || cooldownTime > 0}
                    variant="outline"
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
                
                <Link href="/login" className="block w-full">
                  <GradientButton className="w-full h-11">
                    {translations[language].goToLogin}
                  </GradientButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 