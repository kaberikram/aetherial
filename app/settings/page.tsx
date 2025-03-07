"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, AlertTriangle, RefreshCw, LogOut, User, Mail, Calendar, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { forceResetWithAllSampleDreams } from "@/utils/sampleDream"
import { createClient } from "@/lib/supabase/client"

// Daily generation limit - must match the API
const DAILY_LIMIT = 2

export default function SettingsPage() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Apply settings-page class to document body
  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add('settings-page');
    document.documentElement.classList.add('settings-page');
    
    // Fetch user data
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }
    
    fetchUser()
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('settings-page');
      document.documentElement.classList.remove('settings-page');
    };
  }, []);

  const clearAllDreams = () => {
    setIsClearing(true)
    
    // Small delay to show loading state
    setTimeout(() => {
      localStorage.removeItem("dreams")
      setIsClearing(false)
      setShowConfirmation(false)
      router.refresh()
    }, 1000)
  }

  const resetWithSampleDreams = () => {
    setIsResetting(true)
    
    // Small delay to show loading state
    setTimeout(() => {
      forceResetWithAllSampleDreams()
      setIsResetting(false)
    }, 1000)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-3">
        <div className="flex items-center">
          <Link href="/home" className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold ml-2">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* User Profile Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            
            {isLoadingUser ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.email}</h3>
                    <p className="text-sm text-zinc-400">Free Account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                    <User className="h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">User ID</p>
                      <p className="text-xs font-mono truncate w-full max-w-[200px]">{user.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                    <Mail className="h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Email</p>
                      <p className="truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                    <Calendar className="h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Joined</p>
                      <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                    <Shield className="h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Account Type</p>
                      <p>Free</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-zinc-400">Not signed in</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              </div>
            )}
          </section>
          
          {/* Data Management Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            
            <div className="space-y-6">
              {/* Clear All Dreams */}
              <div className="space-y-3">
                <h3 className="font-medium">Clear All Dreams</h3>
                <p className="text-sm text-zinc-400">
                  This will permanently delete all your dream records from this device.
                </p>
                
                {showConfirmation ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-400">Are you sure?</h4>
                        <p className="text-sm text-zinc-400">This action cannot be undone.</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowConfirmation(false)}
                      >
                        Cancel
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={clearAllDreams}
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Yes, Clear All
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    onClick={() => setShowConfirmation(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Dreams
                  </Button>
                )}
              </div>
              
              {/* Reset with Sample Dreams */}
              <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                <h3 className="font-medium">Reset with Sample Dreams</h3>
                <p className="text-sm text-zinc-400">
                  Replace your current dreams with a set of sample dreams to explore the app's features.
                </p>
                
                <Button 
                  variant="outline"
                  onClick={resetWithSampleDreams}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset with Samples
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
          
          {/* Sign Out Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            
            <Button 
              variant="outline" 
              className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
              onClick={handleLogout}
              disabled={isLoggingOut || !user}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </section>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 