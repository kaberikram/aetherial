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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      login: "Login",
      backHome: "Back to home",
      emailAddress: "Email address",
      password: "Password",
      loginButton: "Login",
      signUp: "Don't have an account? Sign up",
      loginFailed: "Login failed",
      loginSuccess: "Logged in successfully"
    },
    ms: {
      login: "Log Masuk",
      backHome: "Kembali ke laman utama",
      emailAddress: "Alamat e-mel",
      password: "Kata laluan",
      loginButton: "Log Masuk",
      signUp: "Tiada akaun? Daftar",
      loginFailed: "Log masuk gagal",
      loginSuccess: "Berjaya log masuk"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(translations[language].loginFailed)
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
    </div>
  )
} 