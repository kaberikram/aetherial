"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { DreamImageGenerator } from "@/components/dream-image-generator"
import { BottomNav } from "@/components/bottom-nav"
import { getDreamById, deleteDream } from "@/utils/supabase/dreams"
import type { Dream } from "@/utils/supabase/dreams"

const translations = {
  en: {
    loading: "Loading dream...",
    dreamDetails: "Dream Details",
    backToDreams: "Back to Dreams",
    dream: "Dream",
    emotion: "Emotion",
    dreamSummary: "Dream Summary",
    location: "Location",
    visualization: "Visualization",
    error: "Failed to load dream. Please try again.",
    edit: "Edit Dream",
    delete: "Delete Dream",
    deleteConfirm: "Are you sure you want to delete this dream?",
    deleteWarning: "This action cannot be undone.",
    cancel: "Cancel",
    confirmDelete: "Yes, Delete",
    emotions: {
      happy: "Happy",
      scared: "Scared",
      confused: "Confused",
      peaceful: "Peaceful",
      anxious: "Anxious",
      excited: "Excited"
    }
  },
  ms: {
    loading: "Memuat mimpi...",
    dreamDetails: "Butiran Mimpi",
    backToDreams: "Kembali ke Mimpi",
    dream: "Mimpi",
    emotion: "Perasaan",
    dreamSummary: "Ringkasan Mimpi",
    location: "Lokasi",
    visualization: "Visualisasi",
    error: "Gagal memuat mimpi. Sila cuba lagi.",
    edit: "Edit Mimpi",
    delete: "Padam Mimpi",
    deleteConfirm: "Adakah anda pasti mahu memadam mimpi ini?",
    deleteWarning: "Tindakan ini tidak boleh dibatalkan.",
    cancel: "Batal",
    confirmDelete: "Ya, Padam",
    emotions: {
      happy: "Gembira",
      scared: "Takut",
      confused: "Keliru",
      peaceful: "Tenang",
      anxious: "Cemas",
      excited: "Teruja"
    }
  }
} as const;

export default function DreamDetail() {
  const params = useParams()
  const id = params.id as string
  const [dream, setDream] = useState<Dream | null>(null)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

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

  useEffect(() => {
    async function loadDream() {
      try {
        setLoading(true)
        setError(null)
        const fetchedDream = await getDreamById(id)
        if (fetchedDream) {
          setDream(fetchedDream)
        } else {
          router.push("/home")
        }
      } catch (err) {
        console.error('Failed to load dream:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dream')
      } finally {
        setLoading(false)
      }
    }

    loadDream()
  }, [id, router])

  const handleEdit = () => {
    router.push(`/dream/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteDream(id)
      router.push('/home')
    } catch (err) {
      console.error('Failed to delete dream:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete dream')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">{translations[language].loading}</div>
      </div>
    )
  }

  if (error || !dream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{translations[language].error}</div>
      </div>
    )
  }

  // Format date nicely
  const dreamDate = new Date(dream.date)
  const formattedDate = dreamDate.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const formattedTime = dreamDate.toLocaleTimeString(language === 'ms' ? 'ms-MY' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/home" className="p-2">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-semibold ml-2">{dream?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Desktop header */}
        <div className="hidden md:flex md:justify-between md:items-center mb-6">
          <Link href="/home" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>{translations[language].backToDreams}</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {translations[language].edit}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-red-900/50 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {translations[language].delete}
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">{dream.title}</h2>
          <p className="text-zinc-400">{formattedDate}, {formattedTime}</p>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
          <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800/50 mb-8 md:mb-0 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{translations[language].emotion}:</span>
              <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm capitalize">
                {translations[language].emotions[dream.emotion.toLowerCase() as keyof typeof translations['en']['emotions']]}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">{translations[language].dreamSummary}</h3>
              <p className="text-lg leading-relaxed text-zinc-100">{dream.summary}</p>
            </div>
            
            {dream.location && (
              <div>
                <h3 className="text-xl font-semibold mb-2">{translations[language].location}</h3>
                <p className="text-lg text-zinc-300">{dream.location}</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/30 rounded-lg border border-zinc-800/50 p-6 relative overflow-hidden">
            {/* Subtle background effects with animations */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse-slower"></div>
              
              {/* Animated ripple effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full border border-white/5 animate-ripple"></div>
                <div className="w-96 h-96 rounded-full border border-white/5 animate-ripple-delay-1"></div>
                <div className="w-96 h-96 rounded-full border border-white/5 animate-ripple-delay-2"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 relative z-10">{translations[language].visualization}</h3>
            <div className="relative z-10">
              <DreamImageGenerator summary={dream.summary} />
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 space-y-4 border border-zinc-800">
            <h3 className="text-xl font-semibold">{translations[language].deleteConfirm}</h3>
            <p className="text-zinc-400">{translations[language].deleteWarning}</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white transition-colors"
                disabled={isDeleting}
              >
                {translations[language].cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : translations[language].confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}