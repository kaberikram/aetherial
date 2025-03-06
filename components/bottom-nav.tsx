import { HomeIcon, PlusIcon, GlobeIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()
  
  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-black/95 backdrop-blur-sm border-t border-zinc-800">
      <div className="flex items-center justify-around py-3">
        <Link href="/" className="flex flex-col items-center">
          <HomeIcon className={`h-6 w-6 ${isActive("/") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/") ? "text-white" : "text-zinc-400"}`}>Home</span>
        </Link>

        <Link href="/capture" className="flex flex-col items-center">
          <PlusIcon className={`h-6 w-6 ${isActive("/capture") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/capture") ? "text-white" : "text-zinc-400"}`}>Capture</span>
        </Link>

        <Link href="/explore" className="flex flex-col items-center">
          <GlobeIcon className={`h-6 w-6 ${isActive("/explore") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/explore") ? "text-white" : "text-zinc-400"}`}>Explore</span>
        </Link>

        <Link href="/settings" className="flex flex-col items-center">
          <SettingsIcon className={`h-6 w-6 ${isActive("/settings") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/settings") ? "text-white" : "text-zinc-400"}`}>Settings</span>
        </Link>
      </div>
    </nav>
  )
}

