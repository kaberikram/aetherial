"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { SearchBar } from "@/components/search-bar"
import { FilterChips } from "@/components/filter-chips"
import { SearchResults } from "@/components/search-results"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { getDreams } from "@/utils/supabase/dreams"
import type { Dream } from "@/utils/supabase/dreams"

export default function Home() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load language from local storage
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    async function loadDreams() {
      try {
        setLoading(true)
        setError(null)
        const fetchedDreams = await getDreams()
        setDreams(fetchedDreams)
      } catch (err) {
        console.error('Failed to load dreams:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dreams')
      } finally {
        setLoading(false)
      }
    }

    loadDreams()
  }, [])

  // Apply home-page class to document body and html
  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add('home-page')
    document.documentElement.classList.add('home-page')
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('home-page')
      document.documentElement.classList.remove('home-page')
    }
  }, [])

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return language === 'en' ? "Good Morning" : "Selamat Pagi"
    if (hour < 18) return language === 'en' ? "Good Afternoon" : "Selamat Petang"
    return language === 'en' ? "Good Evening" : "Selamat Malam"
  }

  // Translations for the home page
  const translations = {
    en: {
      readyToCapture: "Ready to capture your dream?",
      newDreamEntry: "New Dream Entry",
      recentDreams: "Recent Dreams",
      searchPlaceholder: "Search dreams...",
      filterByEmotion: "Filter by Emotion",
      emotions: ["Happy", "Excited", "Scared", "Anxious", "Confused", "Peaceful"],
      loading: "Loading dreams...",
      error: "Failed to load dreams. Please try again.",
      noDreams: "No dreams yet. Start by capturing your first dream!"
    },
    ms: {
      readyToCapture: "Bersedia untuk merekod mimpi anda?",
      newDreamEntry: "Rekod Mimpi Baru",
      recentDreams: "Mimpi Terkini",
      searchPlaceholder: "Cari mimpi",
      filterByEmotion: "Tapis mengikut Emosi",
      emotions: ["Gembira", "Teruja", "Takut", "Cemas", "Keliru", "Tenang"],
      loading: "Memuat mimpi...",
      error: "Gagal memuat mimpi. Sila cuba lagi.",
      noDreams: "Belum ada mimpi. Mulakan dengan merekod mimpi pertama anda!"
    }
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 home-page">
      {/* Only show header on mobile */}
      <div className="md:hidden">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-6 md:py-12 md:max-w-7xl">
        {/* Mobile layout - search bar at top */}
        <div className="md:hidden">
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            placeholder={translations[language].searchPlaceholder} 
          />
          <FilterChips 
            activeFilters={activeFilters} 
            setActiveFilters={setActiveFilters} 
            selectedEmotion={selectedEmotion}
            setSelectedEmotion={setSelectedEmotion}
            filterLabel={translations[language].filterByEmotion}
            emotions={translations[language].emotions}
          />
        </div>

        {/* Desktop layout - headers in a row for perfect alignment */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 md:mb-4">
          <div className="md:col-span-4">
            <h1 className="text-2xl font-bold">{getGreeting()}</h1>
          </div>
          <div className="md:col-span-8">
            <h2 className="text-2xl font-bold">
              {searchTerm || activeFilters.length > 0 ? "Search Results" : translations[language].recentDreams}
            </h2>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-8">
          <section className="mb-8 md:col-span-4 md:mb-0">
            <div className="md:sticky md:top-24 md:pr-4">
              {/* Only show heading on mobile */}
              <h1 className="text-2xl font-bold mb-1 md:hidden">{getGreeting()}</h1>
              <p className="text-zinc-400 mb-6">{translations[language].readyToCapture}</p>
              
              {/* Desktop layout - search bar in left column */}
              <div className="hidden md:block">
                <SearchBar 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  placeholder={translations[language].searchPlaceholder} 
                />
                <FilterChips 
                  activeFilters={activeFilters} 
                  setActiveFilters={setActiveFilters} 
                  selectedEmotion={selectedEmotion}
                  setSelectedEmotion={setSelectedEmotion}
                  filterLabel={translations[language].filterByEmotion}
                  emotions={translations[language].emotions}
                />
              </div>

              <Link href="/capture" className="block w-full mt-6">
                <GradientButton className="w-full flex items-center justify-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  {translations[language].newDreamEntry}
                </GradientButton>
              </Link>
            </div>
          </section>

          <section className="md:col-span-8">
            {/* Only show heading on mobile */}
            <h2 className="text-2xl font-bold mb-4 md:hidden">
              {searchTerm || activeFilters.length > 0 ? "Search Results" : translations[language].recentDreams}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-8 text-zinc-400">
                  {translations[language].loading}
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-8 text-red-500">
                  {translations[language].error}
                </div>
              ) : dreams.length === 0 ? (
                <div className="col-span-full text-center py-8 text-zinc-400">
                  {translations[language].noDreams}
                </div>
              ) : (
                <SearchResults 
                  dreams={dreams} 
                  searchTerm={searchTerm} 
                  activeFilters={activeFilters}
                  selectedEmotion={selectedEmotion}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Only show bottom nav on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 