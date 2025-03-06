import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/moon-icon.svg" 
            alt="Aetherial" 
            width={24} 
            height={24} 
            className="h-6 w-6"
          />
          <span className="text-xl font-semibold">Aetherial</span>
        </Link>

        <div className="flex-1"></div>

        {/* Profile link removed as it's now in the sidebar for desktop */}
      </div>
    </header>
  )
}

