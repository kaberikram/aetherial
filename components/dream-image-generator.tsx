"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Loader2, RefreshCw, Info, ZoomIn, ZoomOut, Download, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface DreamImageGeneratorProps {
  summary: string
}

// Simple rate limiting constants
const MAX_GENERATIONS_PER_DAY = 5
const RATE_LIMIT_STORAGE_KEY = "image_generation_usage"

// Helper function to check and update rate limits
function checkRateLimit(): { allowed: boolean, remaining: number } {
  if (typeof window === 'undefined') {
    return { allowed: false, remaining: 0 }
  }
  
  const today = new Date().toDateString()
  let usage = JSON.parse(localStorage.getItem(RATE_LIMIT_STORAGE_KEY) || '{"date":"","count":0}')
  
  // Reset if it's a new day
  if (usage.date !== today) {
    usage = { date: today, count: 0 }
  }
  
  const remaining = MAX_GENERATIONS_PER_DAY - usage.count
  return { 
    allowed: remaining > 0,
    remaining
  }
}

// Helper function to increment usage
function incrementUsage() {
  if (typeof window === 'undefined') return
  
  const today = new Date().toDateString()
  let usage = JSON.parse(localStorage.getItem(RATE_LIMIT_STORAGE_KEY) || '{"date":"","count":0}')
  
  // Reset if it's a new day
  if (usage.date !== today) {
    usage = { date: today, count: 0 }
  }
  
  usage.count += 1
  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(usage))
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

  // Check rate limits
  useEffect(() => {
    // Check rate limits
    const { remaining } = checkRateLimit()
    setRemainingGenerations(remaining)
  }, [])

  const generateImage = async () => {
    // Check rate limit
    const { allowed, remaining } = checkRateLimit()
    if (!allowed) {
      setError(`You've reached the daily limit of ${MAX_GENERATIONS_PER_DAY} image generations. Please try again tomorrow.`)
      toast.error("Generation limit reached", {
        description: `You've reached the daily limit of ${MAX_GENERATIONS_PER_DAY} image generations. Please try again tomorrow.`
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
        incrementUsage()
        setRemainingGenerations(remaining - 1)
        
        toast.success("Dream image generated successfully")
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
      
      const errorMessage = error.response?.data?.error || "Failed to generate image. Please try again."
      setError(errorMessage)
      setDebugInfo(error.response?.data || { error: error.message })
      
      // Check for specific error types
      if (error.response?.status === 401) {
        // Authentication error
        toast.error("Authentication required", {
          description: "Please sign in to generate dream images."
        })
      } else if (error.response?.data?.debug?.missingApiKey) {
        // Missing API key error
        toast.error("Configuration error", {
          description: "The image generation service is not properly configured. Please contact the administrator."
        })
      } else {
        toast.error("Image generation failed", {
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
      {!generatedImage && !isGenerating && (
        <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/30 p-6 text-center space-y-4">
          <h3 className="text-lg font-medium">Generate Dream Visualization</h3>
          <p className="text-zinc-400 text-sm">
            Create an AI-generated visualization based on your dream description.
          </p>
          
          <div className="text-sm text-zinc-400 mb-4">
            <div className="flex items-center justify-center gap-1">
              <span>Generations remaining today: </span>
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
                  Support this feature
                </button>
              </div>
            )}
          </div>
          
          {showDonateInfo && (
            <div className="bg-zinc-800/50 rounded-lg p-3 text-sm border border-amber-500/20 mb-2">
              <p className="text-zinc-300 mb-2">
                Dream visualizations are powered by AI that costs real money to run.
                Your donation helps keep this feature available for everyone!
              </p>
              <Button 
                onClick={handleDonateClick}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium"
              >
                💳 Support this feature
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
                Generating...
              </div>
            ) : (
              "Generate Visualization"
            )}
          </GradientButton>
          
          {remainingGenerations === 0 && (
            <div className="mt-2 bg-zinc-800/50 rounded-lg p-3 text-sm border border-amber-500/20">
              <p className="text-zinc-300 mb-2">
                You've reached your daily limit of {MAX_GENERATIONS_PER_DAY} image generations.
              </p>
              <p className="text-zinc-400 mb-3 text-xs">
                This limit helps us manage costs. Your support helps keep this feature available!
              </p>
              <Button 
                onClick={handleDonateClick}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium"
              >
                💳 Support this feature
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Only show this section when there's an image or we're generating one */}
      {(generatedImage || isGenerating) && (
        <div className="w-full bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
          {generatedImage ? (
            <div className="relative">
              {/* Image container with zoom functionality */}
              <div 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={toggleZoom}
              >
                <img 
                  src={generatedImage} 
                  alt="AI generated visualization of the dream" 
                  className={`w-full h-auto transition-all duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                />
              </div>
              
              {/* Controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleZoom}
                      className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    >
                      {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={downloadImage}
                      className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleDebugInfo}
                      className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={generateImage}
                      disabled={isGenerating || remainingGenerations <= 0}
                      className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Debug info panel */}
              {showDebug && debugInfo && (
                <div className="mt-4 p-4 bg-black/50 border border-zinc-800 rounded-md text-xs font-mono overflow-x-auto">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : isGenerating ? (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-t-2 border-purple-500 animate-spin-slow"></div>
                </div>
                <h3 className="text-lg font-medium mb-2">Generating Dream Image</h3>
                <p className="text-zinc-400 text-sm mb-1">This may take a moment...</p>
                <p className="text-zinc-500 text-xs">Creating a unique visualization based on your dream</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-red-400">Generation Failed</h3>
                <p className="text-zinc-400 mb-4">{error}</p>
                
                {remainingGenerations > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={generateImage}
                    disabled={isGenerating}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Add donate button to error state when API credits are depleted */}
      {error && error.includes("credit") && (
        <div className="mt-4 bg-zinc-800/50 rounded-lg p-4 text-sm border border-amber-500/20">
          <p className="text-zinc-300 mb-2">
            It looks like our image generation service has reached its capacity.
          </p>
          <p className="text-zinc-400 mb-3 text-xs">
            Your donation will help us increase capacity and keep this feature available!
          </p>
          <Button 
            onClick={handleDonateClick}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium"
          >
            💳 Support this feature
          </Button>
        </div>
      )}
    </div>
  )
} 