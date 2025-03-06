import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="relative w-24 h-24 mb-8">
        {/* Animated boat */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full animate-pulse"></div>
        </div>
        
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0 h-4">
          <div className="w-full h-1 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          <div className="w-full h-1 mt-1 bg-white/20 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2">Initializing Dream Explorer</h2>
      <p className="text-zinc-400 text-sm mb-4">Preparing your dream voyage...</p>
      
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading dream space</span>
      </div>
    </div>
  )
} 