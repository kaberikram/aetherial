import { NextResponse } from "next/server"
import axios from "axios"
import FormData from "form-data"

// In-memory store for tracking IP-based usage
// In a production app, this would be a database or Redis cache
const ipUsageStore: Record<string, { count: number, date: string }> = {}

// Daily generation limit
const DAILY_LIMIT = 2

// Helper function to get client IP
function getClientIP(request: Request): string {
  // Get IP from headers (when behind a proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  // Fallback to direct connection IP (may be unavailable in some environments)
  // In production, you'd want to use a more robust method
  return 'unknown-ip'
}

// Check if the IP has reached daily limit
function checkIPLimit(ip: string): boolean {
  const today = new Date().toDateString()
  
  // If no record exists or it's from a different day, create/reset it
  if (!ipUsageStore[ip] || ipUsageStore[ip].date !== today) {
    ipUsageStore[ip] = { count: 0, date: today }
  }
  
  // Check if limit reached
  return ipUsageStore[ip].count < DAILY_LIMIT
}

// Increment usage count for an IP
function incrementIPUsage(ip: string): void {
  const today = new Date().toDateString()
  
  if (!ipUsageStore[ip]) {
    ipUsageStore[ip] = { count: 0, date: today }
  }
  
  if (ipUsageStore[ip].date !== today) {
    ipUsageStore[ip] = { count: 0, date: today }
  }
  
  ipUsageStore[ip].count += 1
}

export async function POST(request: Request) {
  try {
    // Get client IP
    const clientIP = getClientIP(request)
    
    // Check if IP has reached daily limit
    if (!checkIPLimit(clientIP)) {
      return NextResponse.json(
        { error: "Daily generation limit reached. Try again tomorrow." },
        { status: 429 } // Too Many Requests
      )
    }
    
    const { prompt, width = 1024, height = 1024 } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Enhanced prompt for more natural, less AI-looking dream visualization
    const enhancedPrompt = `A subtle, atmospheric interpretation of: ${prompt}. Soft lighting, natural textures, painterly style with muted colors. Avoid artificial perfection, embrace natural imperfections.`

    // Create payload for Stable Image Core API
    const payload = {
      prompt: enhancedPrompt,
      output_format: "webp", // More efficient format
      style_preset: "photographic", // Use photographic style for more realism
      width: width, // Default is 1024
      height: height // Default is 1024
    }

    // Call Stability AI's Stable Image Core API (more cost-effective)
    const response = await axios.postForm(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: { 
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*"
        }
      }
    )

    if (response.status !== 200) {
      throw new Error(`API Error: ${response.status}: ${Buffer.from(response.data).toString()}`)
    }

    // Convert the binary image data to base64
    const base64Image = Buffer.from(response.data).toString('base64')
    
    // Increment usage count for this IP
    incrementIPUsage(clientIP)
    
    // Get remaining generations for this IP
    const remainingGenerations = DAILY_LIMIT - ipUsageStore[clientIP].count

    return NextResponse.json({
      image: `data:image/webp;base64,${base64Image}`,
      remainingGenerations,
      debug: {
        prompt: enhancedPrompt,
        model: "stable-image-core",
        dimensions: `${width}x${height}`,
        status: response.status,
        style: "photographic",
        cost: "Cost-effective Stable Image Core model"
      }
    })
  } catch (error: any) {
    console.error("Error generating image:", error)
    
    let errorMessage = "Failed to generate image"
    let statusCode = 500
    let debugInfo = {}

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.message || "API Error"
      statusCode = error.response.status
      
      // Try to parse the error response if it's a buffer
      let errorData = error.response.data
      if (error.response.data instanceof ArrayBuffer || Buffer.isBuffer(error.response.data)) {
        try {
          errorData = Buffer.from(error.response.data).toString()
          // Try to parse as JSON if possible
          try {
            errorData = JSON.parse(errorData)
          } catch (e) {
            // Keep as string if not JSON
          }
        } catch (e) {
          errorData = "Could not parse error response"
        }
      }
      
      debugInfo = {
        status: error.response.status,
        data: errorData
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response received from image generation service"
      debugInfo = {
        request: "Request was sent but no response was received"
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message
      debugInfo = {
        message: error.message
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        debug: debugInfo
      },
      { status: statusCode }
    )
  }
} 