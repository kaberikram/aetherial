"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, AlertTriangle, RefreshCw, InfoIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { forceResetWithAllSampleDreams } from "@/utils/sampleDream"
import { toast } from "sonner"

// Daily generation limit - must match the API
const DAILY_LIMIT = 2

export default function SettingsPage() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Apply settings-page class to document body
  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add('settings-page');
    document.documentElement.classList.add('settings-page');
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('settings-page');
      document.documentElement.classList.remove('settings-page');
    };
  }, []);

  const clearAllDreams = () => {
    setIsClearing(true)
    
    // Simulate a delay for better UX
    setTimeout(() => {
      localStorage.setItem("dreams", "[]")
      setShowConfirmation(false)
      setIsClearing(false)
      
      // Show toast notification
      toast.success("Dream journal cleared", {
        description: "All dream entries have been deleted"
      })
    }, 1000)
  }

  const resetWithSampleDreams = () => {
    setIsResetting(true)
    
    // Simulate a delay for better UX
    setTimeout(() => {
      forceResetWithAllSampleDreams()
      setIsResetting(false)
      
      // Show toast notification
      toast.success("Sample dreams added", {
        description: "Your dream journal has been reset with sample dreams"
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 settings-page">
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
          {/* Data Privacy Notice */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-blue-400">
                <InfoIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Data Privacy</h2>
                <p className="text-zinc-400">
                  All your dream data is stored locally on your device. Nothing is sent to any server.
                  Your privacy is important to us.
                </p>
              </div>
            </div>
          </section>
          
          {/* Data Management Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">Clear Dream Journal</h3>
                    <p className="text-sm text-zinc-400">Delete all your dream entries. This action cannot be undone.</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowConfirmation(true)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                
                {showConfirmation && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-200 mb-3">
                          Are you sure you want to delete all dream entries? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={clearAllDreams}
                            disabled={isClearing}
                          >
                            {isClearing ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Clearing...
                              </>
                            ) : (
                              "Yes, Clear All"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowConfirmation(false)}
                            disabled={isClearing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">Reset with Sample Dreams</h3>
                    <p className="text-sm text-zinc-400">Replace your current dreams with a set of 6 sample dreams.</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={resetWithSampleDreams}
                    disabled={isResetting}
                    className="shrink-0"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Dreams
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-zinc-400">Download all your dream journal entries as a JSON file.</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
                      const dataStr = JSON.stringify(dreams, null, 2)
                      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
                      
                      const exportFileDefaultName = `dream-journal-export-${new Date().toISOString().split('T')[0]}.json`
                      
                      const linkElement = document.createElement('a')
                      linkElement.setAttribute('href', dataUri)
                      linkElement.setAttribute('download', exportFileDefaultName)
                      linkElement.click()
                    }}
                    className="shrink-0"
                  >
                    Export Dreams
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* About Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Aetherial - Dream Journal</h3>
                <p className="text-sm text-zinc-400">Version 1.0.0</p>
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <h3 className="font-medium">Creator</h3>
                <p className="text-zinc-400 mt-1">Ikram Hakim</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Email:</span>
                    <a href="mailto:ikramandhakim@gmail.com" className="text-blue-400 hover:underline">
                      ikramandhakim@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">X:</span>
                    <a href="https://x.com/Kaberikram" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      @Kaberikram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Only show bottom nav on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 