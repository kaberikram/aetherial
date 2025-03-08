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

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

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
      router.push('/login')
      
    } catch (error) {
      console.error("Unexpected error during signup:", error)
      toast.error(translations[language].signupFailed)
    } finally {
      setIsLoading(false)
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
        </div>
      </main>
    </div>
  )
} 