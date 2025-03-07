import { NextResponse } from "next/server"
import axios from "axios"
import FormData from "form-data"

export const config = {
  maxDuration: 300, // 5 minutes for Vercel
}

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.STABILITY_API_KEY) {
      return NextResponse.json(
        { 
          error: "Stability API key is not configured. Please add STABILITY_API_KEY to your environment variables.",
          message: "Image generation service is not properly configured.",
          debug: { missingApiKey: true }
        },
        { status: 500 }
      )
    }
    
    const { prompt, width = 1024, height = 1024 } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { 
          error: "Missing required parameter",
          message: "Prompt is required" 
        },
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

    console.log("Calling Stability API with payload:", JSON.stringify(payload))

    // Call Stability AI's Stable Image Core API with increased timeout
    const response = await axios.postForm(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        timeout: 120000, // 2 minute timeout
        headers: { 
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*"
        }
      }
    )

    if (response.status !== 200) {
      // Convert buffer to string for error message
      const errorText = Buffer.from(response.data).toString()
      console.error(`Stability API Error (${response.status}):`, errorText)
      
      // Return a structured error response
      return NextResponse.json(
        { 
          error: "Image generation failed",
          message: `API Error: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
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
      errorMessage = "Image generation service error"
      statusCode = error.response.status || 500
      
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
        errorMessage = "The image generation service is currently unavailable due to credit limitations."
      } else if (statusCode === 504) {
        errorMessage = "The image generation request timed out. Please try again."
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response received from image generation service"
      debugInfo = {
        request: "Request was sent but no response was received"
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || "Unknown error occurred"
      debugInfo = {
        message: error.message
      }
    }

    // Always return a structured error with a message string
    return NextResponse.json(
      { 
        error: true,
        message: errorMessage, // This is what will be displayed to the user
        debug: debugInfo
      },
      { status: statusCode }
    )
  }
} 