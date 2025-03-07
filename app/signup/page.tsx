"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GradientButton } from "@/components/ui/gradient-button"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmEmailSent, setIsConfirmEmailSent] = useState(false)
  const supabase = createClient()

  // Apply signup-page class to document body and html
  useEffect(() => {
    document.body.classList.add('signup-page');
    document.documentElement.classList.add('signup-page');
    
    return () => {
      document.body.classList.remove('signup-page');
      document.documentElement.classList.remove('signup-page');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (data?.user) {
        setIsConfirmEmailSent(true)
      }
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isConfirmEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-8 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-zinc-400">
              We've sent a confirmation link to <span className="text-white">{email}</span>.
              Please check your email to complete your registration.
            </p>
            <p className="text-sm text-zinc-500">
              Don't see the email? Check your spam folder.
            </p>
            <Link 
              href="/login" 
              className="block mt-6 text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-3">
        <div className="flex items-center">
          <Link href="/" className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold ml-2">Create Account</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Start Your Dream Journey
            </h2>
            <p className="text-zinc-400 text-lg">
              Create an account to begin recording and exploring your dreams.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Create a password"
                minLength={8}
              />
              <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                {error}
              </div>
            )}

            <GradientButton
              type="submit"
              className="w-full py-3 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </GradientButton>
          </form>

          <div className="text-center">
            <p className="text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 