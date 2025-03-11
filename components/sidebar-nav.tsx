"use client"

import { HomeIcon, PlusIcon, GlobeIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function SidebarNav() {
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
      explore: "Explore",
      settings: "Settings"
    },
    ms: {
      home: "Utama",
      capture: "Rakam",
      explore: "Layar",
      settings: "Tetapan"
    }
  }
  
  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/home") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-zinc-900/50 border-r border-zinc-800/50">
      <div className="flex flex-col h-full px-4 py-8">
        {/* App Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <Image
            priority
            width={32}
            height={32}
            className="h-8 w-8"
            src="/newlogo.svg"
            alt="Aetherial"
          />
          <span className="text-2xl font-semibold">Aetherial</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <Link 
            href="/home" 
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive("/home") 
                ? "bg-zinc-800/80 text-white" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="font-medium">{translations[language].home}</span>
          </Link>
          
          <Link 
            href="/capture" 
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive("/capture") 
                ? "bg-zinc-800/80 text-white" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-medium">{translations[language].capture}</span>
          </Link>
          
          <Link 
            href="/explore" 
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive("/explore") 
                ? "bg-zinc-800/80 text-white" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
            onMouseEnter={() => {
              // Preload the explore page when hovering over the link
              const link = document.createElement('link');
              link.rel = 'preload';
              link.as = 'document';
              link.href = '/explore';
              document.head.appendChild(link);
            }}
          >
            <GlobeIcon className="h-5 w-5" />
            <span className="font-medium">{translations[language].explore}</span>
          </Link>
          
          <Link 
            href="/settings" 
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive("/settings") 
                ? "bg-zinc-800/80 text-white" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="font-medium">{translations[language].settings}</span>
          </Link>
        </nav>
        
        {/* Version info at bottom */}
        <div className="pt-4 mt-auto border-t border-zinc-800/50">
          <p className="text-xs text-zinc-500 px-3">Aetherial v1.0.0</p>
        </div>
      </div>
    </aside>
  )
} 