"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Moon, Brain, Sparkles, CloudLightning } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"

export default function LandingPage() {
  // Apply landing-page class to document body and html
  useEffect(() => {
    document.body.classList.add('landing-page');
    document.documentElement.classList.add('landing-page');
    
    return () => {
      document.body.classList.remove('landing-page');
      document.documentElement.classList.remove('landing-page');
    };
  }, []);

  return (
    <div className="min-h-screen landing-page">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Capture Your Dreams, Unlock Your Mind
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
              A beautiful and intuitive dream journal that helps you record, explore, and understand your dreams.
            </p>
            <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <GradientButton className="w-full px-8 py-3 text-lg flex items-center justify-center gap-2">
                  Start Journaling <ArrowRight className="h-5 w-5" />
                </GradientButton>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <GradientButton className="w-full px-8 py-3 text-lg gradient-button-variant flex items-center justify-center gap-2">
                  Sign In <Sparkles className="h-5 w-5" />
                </GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="mb-4 text-blue-400">
                <Moon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dream Journal</h3>
              <p className="text-zinc-400">
                Easily record and organize your dreams with our intuitive journaling interface.
              </p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="mb-4 text-purple-400">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pattern Recognition</h3>
              <p className="text-zinc-400">
                Discover recurring themes and symbols in your dreams over time.
              </p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="mb-4 text-amber-400">
                <CloudLightning className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dream Visualization</h3>
              <p className="text-zinc-400">
                Experience your dreams in a new way with our unique 3D visualization tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Record Your Dreams</h3>
                <p className="text-zinc-400">
                  As soon as you wake up, quickly capture your dream memories using our streamlined journaling interface.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Explore and Analyze</h3>
                <p className="text-zinc-400">
                  Use our powerful search and filtering tools to discover patterns and connections in your dream journal.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Visualize and Share</h3>
                <p className="text-zinc-400">
                  Transform your dreams into stunning 3D visualizations and optionally share them with the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-zinc-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Dream Journey?</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of dreamers who are already discovering new insights about themselves through dream journaling.
          </p>
          <Link href="/signup">
            <GradientButton className="px-8 py-3 text-lg">
              Create Your Account
            </GradientButton>
          </Link>
        </div>
      </section>
    </div>
  )
}

