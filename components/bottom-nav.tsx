"use client"

import { HomeIcon, PlusIcon, GlobeIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function BottomNav() {
  const pathname = usePathname()
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  
  useEffect(() => {
    // Initial load
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

  const translations = {
    en: {
      home: "Home",
      capture: "Capture",
      explore: "Explore"
    },
    ms: {
      home: "Utama",
      capture: "Rakam",
      explore: "Layar"
    }
  }
  
  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/home") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }
  
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 h-16 bg-black/95 backdrop-blur-sm border-t border-zinc-800">
      <div className="grid h-full grid-cols-3 mx-auto">
        <Link href="/home" className="inline-flex flex-col items-center justify-center px-5">
          <HomeIcon className={`h-6 w-6 ${isActive("/home") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/home") ? "text-white" : "text-zinc-400"}`}>
            {translations[language].home}
          </span>
        </Link>

        <Link href="/capture" className="inline-flex flex-col items-center justify-center px-5">
          <PlusIcon className={`h-6 w-6 ${isActive("/capture") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/capture") ? "text-white" : "text-zinc-400"}`}>
            {translations[language].capture}
          </span>
        </Link>

        <Link href="/explore" className="inline-flex flex-col items-center justify-center px-5">
          <GlobeIcon className={`h-6 w-6 ${isActive("/explore") ? "text-white" : "text-zinc-400"}`} />
          <span className={`text-xs mt-1 ${isActive("/explore") ? "text-white" : "text-zinc-400"}`}>
            {translations[language].explore}
          </span>
        </Link>
      </div>
    </nav>
  )
}

