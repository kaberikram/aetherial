import { NextResponse } from "next/server"
import axios from "axios"
import FormData from "form-data"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.STABILITY_API_KEY) {
      return NextResponse.json(
        { 
          error: "Stability API key is not configured. Please add STABILITY_API_KEY to your environment variables.",
          debug: { missingApiKey: true }
        },
        { status: 500 }
      )
    }
    
    // Get the current user
    const cookieStore = cookies()
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Log user information for debugging
    console.log("User authentication check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError
    })
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: "Authentication required",
          debug: { userError }
        },
        { status: 401 }
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

    return NextResponse.json({
      image: `data:image/webp;base64,${base64Image}`,
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
      
      // Check for Stability AI credit limit errors
      if (statusCode === 402 || (errorData && typeof errorData === 'object' && errorData.message && errorData.message.includes('credits'))) {
        errorMessage = "The image generation service is currently unavailable due to credit limitations. Please try again later."
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