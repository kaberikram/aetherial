"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Loader2, RefreshCw, Info, ZoomIn, ZoomOut, Download, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

interface DreamImageGeneratorProps {
  summary: string
}

const translations = {
  en: {
    generateDreamVisualization: "Generate Dream Visualization",
    createAiVisualization: "Create an AI-generated visualization based on your dream description.",
    generationsRemaining: "Generations remaining today:",
    supportFeature: "Support this feature",
    dreamVisualizationsPowered: "Dream visualizations are powered by AI that costs real money to run. Your donation helps keep this feature available for everyone!",
    supportThisFeature: "Support this feature",
    generating: "Generating...",
    generateVisualization: "Generate Visualization",
    limitReached: "You've reached the daily limit of {limit} image generations. Please try again tomorrow.",
    generationLimitReached: "Generation limit reached",
    dreamImageGenerated: "Dream image generated successfully",
    imageFailed: "Image generation failed",
    downloadImage: "Download Image",
    regenerateImage: "Regenerate Image",
    showDebugInfo: "Show Debug Info",
    hideDebugInfo: "Hide Debug Info",
    toggleZoom: "Toggle Zoom",
    debugInformation: "Debug Information",
    pleaseSignIn: "Please sign in to generate dream images.",
    authRequired: "Authentication required"
  },
  ms: {
    generateDreamVisualization: "Jana Visualisasi Mimpi",
    createAiVisualization: "Cipta visualisasi yang dijana AI berdasarkan penerangan mimpi anda.",
    generationsRemaining: "Penjanaan yang tinggal hari ini:",
    supportFeature: "Sokong ciri ini",
    dreamVisualizationsPowered: "Visualisasi mimpi dikuasakan oleh AI yang memerlukan kos sebenar untuk dijalankan. Sumbangan anda membantu mengekalkan ciri ini untuk semua orang!",
    supportThisFeature: "Sokong ciri ini",
    generating: "Menjana...",
    generateVisualization: "Jana Visualisasi",
    limitReached: "Anda telah mencapai had harian {limit} penjanaan imej. Sila cuba lagi esok.",
    generationLimitReached: "Had penjanaan dicapai",
    dreamImageGenerated: "Imej mimpi berjaya dijana",
    imageFailed: "Penjanaan imej gagal",
    downloadImage: "Muat Turun Imej",
    regenerateImage: "Jana Semula Imej",
    showDebugInfo: "Tunjuk Maklumat Debug",
    hideDebugInfo: "Sembunyi Maklumat Debug",
    toggleZoom: "Togol Zum",
    debugInformation: "Maklumat Debug",
    pleaseSignIn: "Sila masuk untuk menjana gambar mimpi.",
    authRequired: "Diperlukan otentikasi"
  }
};

// Simple rate limiting constants
const MAX_GENERATIONS_PER_DAY = 5
const RATE_LIMIT_STORAGE_KEY = "image_generation_usage"

// Helper function to check and update rate limits
async function checkRateLimit(): Promise<{ allowed: boolean, remaining: number }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { allowed: false, remaining: 0 }
  }

  const today = new Date().toISOString().split('T')[0]
  
  // Try to get today's usage
  const { data: usage, error } = await supabase
    .from('image_generation_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error checking rate limit:', error)
    return { allowed: false, remaining: 0 }
  }

  const currentCount = usage?.count || 0
  const remaining = MAX_GENERATIONS_PER_DAY - currentCount
  
  return { 
    allowed: remaining > 0,
    remaining
  }
}

// Helper function to increment usage
async function incrementUsage(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const today = new Date().toISOString().split('T')[0]

  // Try to update existing record
  const { error: updateError } = await supabase
    .from('image_generation_usage')
    .upsert({
      user_id: user.id,
      date: today,
      count: 1
    }, {
      onConflict: 'user_id,date',
      ignoreDuplicates: false
    })

  if (updateError) {
    console.error('Error incrementing usage:', updateError)
  }
}

// Add this component before the DreamImageGenerator component
function LoadingOverlay({ language }: { language: 'en' | 'ms' }) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <div className="bg-zinc-900/90 p-6 rounded-lg border border-zinc-700/50 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-zinc-300 text-sm">{translations[language].generating}</p>
      </div>
    </div>
  )
}

export function DreamImageGenerator({ summary }: DreamImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [remainingGenerations, setRemainingGenerations] = useState<number>(MAX_GENERATIONS_PER_DAY)
  const [showDonateInfo, setShowDonateInfo] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check rate limits and set language
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      
      if (user) {
        const { remaining } = await checkRateLimit()
        setRemainingGenerations(remaining)
      } else {
        setRemainingGenerations(0)
      }
    }
    
    checkAuth()

    // Set language from localStorage
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    // Set up storage event listener for changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        setLanguage(e.newValue as 'en' | 'ms')
      }
    }

    // Set up event listener for changes in the same window
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        setLanguage(e.newValue as 'en' | 'ms')
      }
    }

    // Add event listeners
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('storage-local', handleLanguageChange as any)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storage-local', handleLanguageChange as any)
    }
  }, [])

  const generateImage = async () => {
    if (!isLoggedIn) {
      toast.error(translations[language].authRequired, {
        description: translations[language].pleaseSignIn
      })
      return
    }

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit()
    if (!allowed) {
      const errorMessage = translations[language].limitReached.replace('{limit}', MAX_GENERATIONS_PER_DAY.toString())
      setError(errorMessage)
      toast.error(translations[language].generationLimitReached, {
        description: errorMessage
      })
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setDebugInfo(null)

    try {
      const response = await axios.post("/api/generate-image", {
        prompt: summary,
        width: imageWidth,
        height: imageHeight
      })

      if (response.data.image) {
        setGeneratedImage(response.data.image)
        setDebugInfo(response.data.debug || null)
        
        // Increment usage count
        await incrementUsage()
        setRemainingGenerations(remaining - 1)
        
        toast.success(translations[language].dreamImageGenerated)
      }
    } catch (error: any) {
      console.error("Error generating image:", error)
      
      // Log detailed error information
      console.log("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      })
      
      // Extract error message safely - avoid passing objects to React
      let errorMessage = "Failed to generate image. Please try again."
      
      // Handle different error response structures
      if (error.response?.data) {
        // Use message field if available, otherwise use error field if it's a string
        if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message
        } else if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error
        }
        
        // Store debug info if available
        setDebugInfo(error.response.data.debug || error.response.data)
      }
      
      // Set error as a string, never as an object
      setError(errorMessage)
      
      // Check for specific error types
      if (error.response?.status === 401) {
        // Authentication error
        toast.error(translations[language].authRequired, {
          description: translations[language].pleaseSignIn
        })
      } else if (error.response?.data?.debug?.missingApiKey) {
        // Missing API key error
        toast.error("Configuration error", {
          description: "The image generation service is not properly configured. Please contact the administrator."
        })
      } else if (error.response?.status === 504) {
        // Gateway timeout error
        toast.error("Request timeout", {
          description: "The image generation request timed out. Please try again later."
        })
      } else {
        toast.error(translations[language].imageFailed, {
          description: errorMessage
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Default image size is 1024x1024
  const imageWidth = 1024
  const imageHeight = 1024

  const toggleDebugInfo = () => {
    setShowDebug(!showDebug)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const downloadImage = () => {
    if (!generatedImage) return
    
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `dream-image-${new Date().getTime()}.webp`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDonateClick = () => {
    // Open donation link in a new tab
    window.open('https://buy.stripe.com/7sI01AesQg3M4Gk001', '_blank');
  }

  return (
    <div className="space-y-4">
      <div className="relative min-h-[200px]">
        {/* Initial state */}
        {!generatedImage && (
          <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/30 p-6 text-center space-y-4">
            <h3 className="text-lg font-medium">{translations[language].generateDreamVisualization}</h3>
            <p className="text-zinc-400 text-sm">
              {translations[language].createAiVisualization}
            </p>
            
            {!isLoggedIn ? (
              <div className="bg-zinc-800/50 rounded-lg p-3 text-sm border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-zinc-300 text-left">
                    {translations[language].pleaseSignIn}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-zinc-400 mb-4">
                  <div className="flex items-center justify-center gap-1">
                    <span>{translations[language].generationsRemaining} </span>
                    <span className={`font-bold ${remainingGenerations > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {remainingGenerations}
                    </span>
                    <span>/{MAX_GENERATIONS_PER_DAY}</span>
                  </div>
                  
                  {remainingGenerations <= 2 && (
                    <div className="mt-2 text-xs text-amber-300">
                      <button 
                        className="underline hover:text-amber-200 transition-colors"
                        onClick={() => setShowDonateInfo(!showDonateInfo)}
                      >
                        {translations[language].supportFeature}
                      </button>
                    </div>
                  )}
                </div>
                
                {showDonateInfo && (
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-sm border border-amber-500/20 mb-2">
                    <p className="text-zinc-300 mb-2">
                      {translations[language].dreamVisualizationsPowered}
                    </p>
                    <Button 
                      onClick={handleDonateClick}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium"
                    >
                      💳 {translations[language].supportThisFeature}
                    </Button>
                  </div>
                )}
                
                <GradientButton
                  onClick={generateImage}
                  disabled={isGenerating || remainingGenerations <= 0}
                  className="w-full"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {translations[language].generating}
                    </div>
                  ) : (
                    translations[language].generateVisualization
                  )}
                </GradientButton>
                
                {remainingGenerations === 0 && (
                  <div className="mt-2 bg-zinc-800/50 rounded-lg p-3 text-sm border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-zinc-300 text-left">
                        {translations[language].limitReached.replace('{limit}', MAX_GENERATIONS_PER_DAY.toString())}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {isGenerating && !generatedImage && (
          <LoadingOverlay language={language} />
        )}
      </div>

      {/* Generated image section */}
      {generatedImage && (
        <div className="space-y-4">
          <div className="relative">
            <div className={`relative overflow-hidden rounded-lg border border-zinc-700/50 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
              {isGenerating && <LoadingOverlay language={language} />}
              <div 
                className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                onClick={toggleZoom}
              >
                <img 
                  src={generatedImage} 
                  alt="Generated dream visualization" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadImage}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                {translations[language].downloadImage}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateImage}
                disabled={isGenerating || remainingGenerations <= 0}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? translations[language].generating : translations[language].regenerateImage}
              </Button>
              
              {debugInfo && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleDebugInfo}
                  className="flex items-center gap-1"
                >
                  <Info className="h-4 w-4" />
                  {showDebug ? translations[language].hideDebugInfo : translations[language].showDebugInfo}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleZoom}
                className="flex items-center gap-1"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                {translations[language].toggleZoom}
              </Button>
            </div>
            
            {showDebug && debugInfo && (
              <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800 overflow-x-auto">
                <h4 className="text-sm font-medium mb-2">{translations[language].debugInformation}</h4>
                <pre className="text-xs text-zinc-400">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/20 rounded-lg border border-red-800/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 