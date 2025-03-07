"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { SearchBar } from "@/components/search-bar"
import { FilterChips } from "@/components/filter-chips"
import { SearchResults } from "@/components/search-results"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { addSampleDreamIfEmpty } from "@/utils/sampleDream"
import { GradientButton } from "@/components/ui/gradient-button"

interface DreamEntry {
  id: string
  title: string
  date: string
  location: string
  emotion: string
  summary: string
  people?: string
}

export default function Home() {
  const [dreams, setDreams] = useState<DreamEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)

  useEffect(() => {
    addSampleDreamIfEmpty()
    const savedDreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    setDreams(savedDreams.reverse())
  }, [])

  // Apply home-page class to document body and html
  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add('home-page');
    document.documentElement.classList.add('home-page');
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('home-page');
      document.documentElement.classList.remove('home-page');
    };
  }, []);

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
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
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <FilterChips 
            activeFilters={activeFilters} 
            setActiveFilters={setActiveFilters} 
            selectedEmotion={selectedEmotion}
            setSelectedEmotion={setSelectedEmotion}
          />
        </div>

        {/* Desktop layout - headers in a row for perfect alignment */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 md:mb-4">
          <div className="md:col-span-4">
            <h1 className="text-2xl font-bold">{getGreeting()}</h1>
          </div>
          <div className="md:col-span-8">
            <h2 className="text-2xl font-bold">
              {searchTerm || activeFilters.length > 0 ? "Search Results" : "Recent Dreams"}
            </h2>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-8">
          <section className="mb-8 md:col-span-4 md:mb-0">
            <div className="md:sticky md:top-24 md:pr-4">
              {/* Only show heading on mobile */}
              <h1 className="text-2xl font-bold mb-1 md:hidden">{getGreeting()}</h1>
              <p className="text-zinc-400 mb-6">Ready to capture your dream?</p>
              
              {/* Desktop layout - search bar in left column */}
              <div className="hidden md:block">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <FilterChips 
                  activeFilters={activeFilters} 
                  setActiveFilters={setActiveFilters} 
                  selectedEmotion={selectedEmotion}
                  setSelectedEmotion={setSelectedEmotion}
                />
              </div>

              <Link href="/capture" className="block w-full mt-6">
                <GradientButton className="w-full flex items-center justify-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  New Dream Entry
                </GradientButton>
              </Link>
            </div>
          </section>

          <section className="md:col-span-8">
            {/* Only show heading on mobile */}
            <h2 className="text-2xl font-bold mb-4 md:hidden">
              {searchTerm || activeFilters.length > 0 ? "Search Results" : "Recent Dreams"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchResults 
                dreams={dreams} 
                searchTerm={searchTerm} 
                activeFilters={activeFilters}
                selectedEmotion={selectedEmotion}
              />
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