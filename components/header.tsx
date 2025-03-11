import Link from "next/link"
import Image from "next/image"
import { SettingsIcon } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <Image 
            priority
            width={32}
            height={32}
            className="h-8 w-8"
            src="/newlogo.svg"
            alt="Aetherial"
          />
          <span className="text-xl font-semibold">Aetherial</span>
        </Link>

        <div className="flex items-center">
          <Link href="/settings" className="p-2">
            <SettingsIcon className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  )
}

