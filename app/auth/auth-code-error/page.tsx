"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center">
          <Link href="/" className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold ml-2">Authentication Error</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Authentication Failed</h2>
            <p className="text-zinc-400">
              We were unable to verify your authentication. This could be because:
            </p>
            <ul className="text-zinc-400 list-disc list-inside space-y-2 mt-4 text-left">
              <li>The authentication link has expired</li>
              <li>The link has already been used</li>
              <li>The link was modified or is invalid</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link href="/signup">
              <GradientButton className="w-full py-3">
                Try Signing Up Again
              </GradientButton>
            </Link>
            <p className="text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 