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

// Daily limit constant
const DAILY_LIMIT = 2

export function DreamImageGenerator({ summary }: DreamImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [dailyGenerationsLeft, setDailyGenerationsLeft] = useState(DAILY_LIMIT)

  // Default image size is 1024x1024
  const imageWidth = 1024
  const imageHeight = 1024

  const generateImage = async () => {
    // No need to check limit here as the server will handle it
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
        
        // Update remaining generations from server response
        if (response.data.remainingGenerations !== undefined) {
          setDailyGenerationsLeft(response.data.remainingGenerations)
        }
      } else {
        setError("Failed to generate image")
        setDebugInfo(response.data.debug || null)
      }
    } catch (err: any) {
      console.error("Image generation error:", err)
      
      // Handle rate limit error specifically
      if (err.response?.status === 429) {
        setError("Daily generation limit reached. Try again tomorrow.")
        setDailyGenerationsLeft(0)
      } else {
        setError(`Failed to generate image: ${err.message || "Unknown error"}`)
      }
      
      if (err.response?.data) {
        setDebugInfo(err.response.data)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleDebugInfo = () => {
    setShowDebug(!showDebug)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const downloadImage = () => {
    if (!generatedImage) return
    
    // Create a temporary link element
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `dream-visualization-${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Image downloaded successfully")
  }

  return (
    <div>
      <div className="w-full bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
        {generatedImage ? (
          <div className="relative">
            <div className={`flex justify-center ${isZoomed ? 'overflow-auto max-h-[80vh]' : ''}`}>
              <img 
                src={generatedImage} 
                alt="Generated dream visualization" 
                className={`${isZoomed ? 'w-auto h-auto max-w-none transform scale-150' : 'w-full h-auto max-w-full mx-auto'}`}
              />
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadImage}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
              >
                <Download className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleZoom}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
              >
                {isZoomed ? (
                  <ZoomOut className="h-4 w-4" />
                ) : (
                  <ZoomIn className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateImage}
                disabled={isGenerating || dailyGenerationsLeft <= 0}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate {dailyGenerationsLeft < DAILY_LIMIT && `(${dailyGenerationsLeft} left)`}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] relative overflow-hidden">
            {/* Background decorative elements with animations */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-blue-500/20 blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-500/20 blur-xl animate-pulse-slower"></div>
              <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-pink-500/20 blur-xl animate-float"></div>
              
              {/* Animated ripple effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border border-white/5 animate-ripple"></div>
                <div className="w-40 h-40 rounded-full border border-white/5 animate-ripple-delay-1"></div>
                <div className="w-40 h-40 rounded-full border border-white/5 animate-ripple-delay-2"></div>
              </div>
              
              {/* Subtle grid pattern */}
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                backgroundSize: '30px 30px' 
              }}></div>
            </div>
            
            {error ? (
              <div className="text-center relative z-10">
                <p className="text-red-400 mb-4">{error}</p>
                <GradientButton 
                  onClick={generateImage}
                  disabled={isGenerating || dailyGenerationsLeft <= 0}
                  className="px-6 py-3 text-sm"
                >
                  Try Again
                </GradientButton>
              </div>
            ) : (
              <div className="text-center relative z-10 flex flex-col items-center justify-center">
                {/* Simple CSS Ripple Animation - positioned higher */}
                <div className="relative h-24 w-full flex justify-center mb-2">
                  <div className="simple-ripple"></div>
                  <div className="simple-ripple" style={{ animationDelay: '1s' }}></div>
                  <div className="simple-ripple" style={{ animationDelay: '2s' }}></div>
                  <style jsx>{`
                    .simple-ripple {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      width: 50px;
                      height: 50px;
                      border: 1px solid rgba(255, 255, 255, 0.3);
                      border-radius: 50%;
                      animation: ripple 3s linear infinite;
                    }
                    
                    @keyframes ripple {
                      0% {
                        width: 0px;
                        height: 0px;
                        opacity: 0.8;
                      }
                      100% {
                        width: 100px;
                        height: 100px;
                        opacity: 0;
                      }
                    }
                  `}</style>
                </div>
                
                <div className="flex flex-col items-center mt-0">
                  <p className="text-zinc-400 mb-4 text-sm">Transform your written dream into imagery</p>
                  
                  {dailyGenerationsLeft <= 0 ? (
                    <div className="text-amber-400 text-sm flex items-center mb-3">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Daily limit reached. Try again tomorrow.
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 mb-3">
                      {DAILY_LIMIT - dailyGenerationsLeft > 0 ? 
                        `${dailyGenerationsLeft} of ${DAILY_LIMIT} generations left today` : 
                        `${DAILY_LIMIT} generations available today`}
                    </p>
                  )}
                  
                  <GradientButton 
                    onClick={generateImage}
                    disabled={isGenerating || dailyGenerationsLeft <= 0}
                    className="px-6 py-3"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Visualize Dream"
                    )}
                  </GradientButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {(error || debugInfo) && (
        <div className="mt-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleDebugInfo}
            className="text-zinc-500"
          >
            <Info className="h-4 w-4 mr-1" />
            {showDebug ? "Hide" : "Show"} Debug Info
          </Button>
        </div>
      )}
      
      {showDebug && debugInfo && (
        <div className="mt-2 p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-mono overflow-x-auto">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 