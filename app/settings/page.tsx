"use client"

import { useState } from "react"
import { ArrowLeft, Trash2, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { forceResetWithAllSampleDreams } from "@/utils/sampleDream"

export default function SettingsPage() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Header for mobile */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 md:hidden">
        <div className="flex items-center">
          <Link href="/" className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold ml-2">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
        {/* Back button for desktop */}
        <div className="hidden md:block mb-6">
          <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Dreams</span>
          </Link>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">Settings</h2>
          <p className="text-zinc-400">Manage your dream journal preferences</p>
        </div>

        <div className="space-y-8">
          {/* Data Management Section */}
          <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800/50">
            <h3 className="text-xl font-semibold mb-4">Data Management</h3>
            
            <div className="space-y-6">
              {/* Clear All Dreams */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">Clear Dream Journal</h4>
                    <p className="text-zinc-400 text-sm">Delete all your dream entries. This action cannot be undone.</p>
                  </div>
                  
                  {!showConfirmation && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowConfirmation(true)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                {showConfirmation && (
                  <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-red-200 font-medium">Are you sure you want to delete all dream entries?</p>
                        <p className="text-red-300/80 text-sm">This will permanently remove all your dream journal entries. This action cannot be undone.</p>
                        
                        <div className="flex gap-3 mt-3">
                          <Button 
                            variant="outline" 
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
                            {isClearing ? "Clearing..." : "Yes, Clear All Dreams"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reset with Sample Dreams */}
              <div className="border-t border-zinc-800 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">Reset with Sample Dreams</h4>
                    <p className="text-zinc-400 text-sm">Replace your current dreams with a set of 6 sample dreams. This is useful if you want to see all the sample dreams.</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetWithSampleDreams}
                    disabled={isResetting}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {isResetting ? "Resetting..." : "Reset Dreams"}
                  </Button>
                </div>
              </div>
              
              {/* Export Data */}
              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-lg font-medium mb-2">Export Data</h4>
                <p className="text-zinc-400 text-sm mb-3">Download all your dream journal entries as a JSON file.</p>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dreams, null, 2))
                    const downloadAnchorNode = document.createElement('a')
                    downloadAnchorNode.setAttribute("href", dataStr)
                    downloadAnchorNode.setAttribute("download", "dream-journal-export.json")
                    document.body.appendChild(downloadAnchorNode)
                    downloadAnchorNode.click()
                    downloadAnchorNode.remove()
                  }}
                >
                  Export Dreams
                </Button>
              </div>
            </div>
          </div>
          
          {/* App Information */}
          <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800/50">
            <h3 className="text-xl font-semibold mb-4">About</h3>
            <p className="text-zinc-300 mb-2">Aetherial - Dream Journal</p>
            <p className="text-zinc-400 text-sm">Version 1.0.0</p>
            
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <h4 className="text-lg font-medium mb-2">Creator</h4>
              <p className="text-zinc-300">Kaber Ikram</p>
              <div className="mt-2 space-y-1">
                <p className="text-zinc-400 text-sm flex items-center">
                  <span className="inline-block w-16">Email:</span> 
                  <a href="mailto:ikramandhakim@gmail.com" className="text-blue-400 hover:underline">ikramandhakim@gmail.com</a>
                </p>
                <p className="text-zinc-400 text-sm flex items-center">
                  <span className="inline-block w-16">Twitter:</span> 
                  <a href="https://x.com/Kaberikram" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@Kaberikram</a>
                </p>
              </div>
            </div>
            
            <p className="text-zinc-500 text-xs mt-4">Your dream data is stored locally on your device and is not sent to any server.</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 