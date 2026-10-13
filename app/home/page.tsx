"use client"

import { useRef, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { SearchBar } from "@/components/search-bar"
import { FilterChips } from "@/components/filter-chips"
import type { JournalFilterState } from "@/components/filter-chips"
import { SearchResults } from "@/components/search-results"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { getDreams, toDreamEmotion } from "@/utils/supabase/dreams"
import type { DreamListItem } from "@/utils/supabase/dreams"
import { DreamLevelProfile } from "@/components/dream-level-profile"
import { useMountEffect } from "@/hooks/use-mount-effect"

export default function Home() {
  const [dreams, setDreams] = useState<DreamListItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<JournalFilterState>(emptyFilters)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLevelTitle, setCurrentLevelTitle] = useState<string>("")
  const loadRequestId = useRef(0)

  useMountEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) setLanguage(savedLanguage)
  })

  async function loadDreams(nextFilters: JournalFilterState) {
    const requestId = loadRequestId.current + 1
    loadRequestId.current = requestId

    try {
      setLoading(true)
      setError(null)
      const fetchedDreams = await getDreams({
        emotion: toDreamEmotion(nextFilters.emotion),
        kategoriMimpi: nextFilters.kategoriMimpi,
        keadaanMimpi: nextFilters.keadaanMimpi,
        jenisMimpi: nextFilters.jenisMimpi,
      })
      if (requestId !== loadRequestId.current) return
      setDreams(fetchedDreams)
    } catch (err) {
      if (requestId !== loadRequestId.current) return
      console.error('Failed to load dreams:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dreams')
    } finally {
      if (requestId === loadRequestId.current) setLoading(false)
    }
  }

  function handleFiltersChange(nextFilters: JournalFilterState) {
    setFilters(nextFilters)
    void loadDreams(nextFilters)
  }

  useMountEffect(() => {
    void loadDreams(emptyFilters)
  })

  useMountEffect(() => {
    document.body.classList.add('home-page')
    document.documentElement.classList.add('home-page')

    return () => {
      document.body.classList.remove('home-page')
      document.documentElement.classList.remove('home-page')
    }
  })

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return language === 'en' ? "Good Morning" : "Selamat Pagi"
    if (hour < 18) return language === 'en' ? "Good Afternoon" : "Selamat Petang"
    return language === 'en' ? "Good Evening" : "Selamat Malam"
  }

  // Function to get personalized greeting (without level title)
  const getPersonalizedGreeting = () => {
    return getGreeting()
  }

  // Handle level change from the DreamLevelProfile component
  const handleLevelChange = (levelTitle: string) => {
    setCurrentLevelTitle(levelTitle)
    // We still track the level title for other potential uses, but don't display it in the greeting
  }

  // Translations for the home page
  const translations = {
    en: {
      readyToCapture: "Ready to capture your dream?",
      newDreamEntry: "New Dream Entry",
      recentDreams: "Recent Dreams",
      searchPlaceholder: "Search dreams...",
      searchResults: "Search Results",
      filterByEmotion: "Filter by Emotion",
      emotions: ["Happy", "Excited", "Scared", "Anxious", "Confused", "Peaceful"],
      loading: "Loading dreams...",
      error: "Failed to load dreams. Please try again.",
      noDreams: "No dreams yet. Start by capturing your first dream!",
      dreamPop: "Dream Pop"
    },
    ms: {
      readyToCapture: "Bersedia untuk merekod mimpi anda?",
      newDreamEntry: "Rekod Mimpi Baru",
      recentDreams: "Mimpi Terkini",
      searchPlaceholder: "Cari mimpi",
      searchResults: "Hasil Carian",
      filterByEmotion: "Tapis mengikut Emosi",
      emotions: ["Gembira", "Teruja", "Takut", "Cemas", "Keliru", "Tenang"],
      loading: "Memuat mimpi...",
      error: "Gagal memuat mimpi. Sila cuba lagi.",
      noDreams: "Belum ada mimpi. Mulakan dengan merekod mimpi pertama anda!",
      dreamPop: "Dream Pop"
    }
  }

  const hasActiveQuery = Boolean(
    searchTerm ||
    filters.emotion ||
    filters.kategoriMimpi ||
    filters.keadaanMimpi ||
    filters.jenisMimpi
  )
  const resultsHeading = hasActiveQuery
    ? translations[language].searchResults
    : translations[language].recentDreams

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
            filters={filters}
            onFiltersChange={handleFiltersChange}
            filterLabel={translations[language].filterByEmotion}
            emotions={translations[language].emotions}
            language={language}
          />
        </div>

        {/* Desktop layout - headers in a row for perfect alignment */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 md:mb-6">
          <div className="md:col-span-4">
            <h1 className="text-2xl font-bold">{getPersonalizedGreeting()}</h1>
          </div>
          <div className="md:col-span-8">
            <h2 className="text-2xl font-bold">
              {resultsHeading}
            </h2>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-8">
          <section className="mb-8 md:col-span-4 md:mb-0">
            <div className="md:sticky md:top-24 md:pr-4">
              {/* Only show heading on mobile */}
              <h1 className="text-2xl font-bold mb-4 md:hidden">{getPersonalizedGreeting()}</h1>
              
              {/* Dream Level Profile */}
              <div className="mb-8">
                <DreamLevelProfile 
                  language={language} 
                  onLevelChange={handleLevelChange}
                />
              </div>
              
              <p className="text-zinc-400 mb-6">{translations[language].readyToCapture}</p>
              
              {/* Desktop layout - search bar in left column */}
              <div className="hidden md:block">
                <SearchBar 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  placeholder={translations[language].searchPlaceholder} 
                />
                <FilterChips 
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  filterLabel={translations[language].filterByEmotion}
                  emotions={translations[language].emotions}
                  language={language}
                />
              </div>

              <Link href="/capture" className="block w-full mt-6">
                <GradientButton className="w-full flex items-center justify-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  {translations[language].newDreamEntry}
                </GradientButton>
              </Link>

              <Link href="/dreampop" className="block w-full mt-3">
                <GradientButton className="w-full flex items-center justify-center gap-2 gradient-button-variant">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 5v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 5v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 17v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 17v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 9h2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 9h2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15h2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 15h2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {translations[language].dreamPop}
                </GradientButton>
              </Link>
            </div>
          </section>

          <section className="md:col-span-8">
            {/* Only show heading on mobile */}
            <h2 className="text-2xl font-bold mb-4 md:hidden">
              {resultsHeading}
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
              ) : dreams.length === 0 && !hasActiveQuery ? (
                <div className="col-span-full text-center py-8 text-zinc-400">
                  {translations[language].noDreams}
                </div>
              ) : (
                <SearchResults 
                  dreams={dreams} 
                  searchTerm={searchTerm} 
                  selectedEmotion={filters.emotion}
                  kategoriMimpi={filters.kategoriMimpi}
                  keadaanMimpi={filters.keadaanMimpi}
                  jenisMimpi={filters.jenisMimpi}
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

const emptyFilters: JournalFilterState = {
  emotion: null,
  kategoriMimpi: null,
  keadaanMimpi: null,
  jenisMimpi: null,
} 