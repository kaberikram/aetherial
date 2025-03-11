"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, AlertTriangle, RefreshCw, InfoIcon, Globe2, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { forceResetWithAllSampleDreams } from "@/utils/sampleDream"
import { createClient } from "@/utils/supabase/client"
import { getDreams, deleteAllDreams } from "@/utils/supabase/dreams"
import type { Dream } from "@/utils/supabase/dreams"
import { toast } from "sonner"

// Daily generation limit - must match the API
const DAILY_LIMIT = 2

export default function SettingsPage() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [isLoadingDreams, setIsLoadingDreams] = useState(false)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Load user data and dreams
  useEffect(() => {
    const loadUserAndDreams = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)

        // Load dreams
        setIsLoadingDreams(true)
        const fetchedDreams = await getDreams()
        setDreams(fetchedDreams)
      } catch (error) {
        console.error('Error loading user or dreams:', error)
      } finally {
        setIsLoading(false)
        setIsLoadingDreams(false)
      }
    }
    loadUserAndDreams()
  }, [])

  const translations = {
    en: {
      settings: "Settings",
      profile: "Profile",
      email: "Email",
      signOut: "Sign Out",
      dataPrivacy: "Data Privacy",
      dataPrivacyDesc: "Your dream data is securely stored in our database using Supabase. All data is encrypted in transit and at rest. Only you can access your dreams through your authenticated account.",
      dataManagement: "Data Management",
      clearJournal: "Clear Dream Journal",
      clearJournalDesc: "Delete all your dream entries. This action cannot be undone.",
      clearAll: "Clear All",
      confirmClear: "Are you sure you want to delete all dream entries? This action cannot be undone.",
      clearing: "Clearing...",
      yesClearAll: "Yes, Clear All",
      cancel: "Cancel",
      exportData: "Export Data",
      exportDataDesc: "Download all your dream journal entries as a JSON file or PDF.",
      exportDreamsJson: "Export as JSON",
      exportDreamsPdf: "Export as PDF",
      about: "About",
      version: "Version",
      creator: "Creator",
      language: "Language",
      languageDesc: "Choose your preferred language",
      english: "English",
      malay: "Bahasa Melayu",
      dreamJournal: "Dream Journal",
      exportedOn: "Exported on",
      summary: "Summary",
      interpretation: "Interpretation",
      tags: "Tags",
      mood: "Mood",
      lucidity: "Lucidity",
      vividness: "Vividness"
    },
    ms: {
      settings: "Tetapan",
      profile: "Profil",
      email: "Emel",
      signOut: "Log Keluar",
      dataPrivacy: "Privasi Data",
      dataPrivacyDesc: "Data mimpi anda disimpan dengan selamat dalam pangkalan data kami menggunakan Supabase. Semua data dienkripsi semasa penghantaran dan penyimpanan. Hanya anda yang boleh mengakses mimpi anda melalui akaun yang disahkan.",
      dataManagement: "Pengurusan Data",
      clearJournal: "Kosongkan Jurnal Mimpi",
      clearJournalDesc: "Padamkan semua entri mimpi anda. Tindakan ini tidak boleh dibatalkan.",
      clearAll: "Kosongkan Semua",
      confirmClear: "Adakah anda pasti mahu memadamkan semua entri mimpi? Tindakan ini tidak boleh dibatalkan.",
      clearing: "Mengosongkan...",
      yesClearAll: "Ya, Kosongkan Semua",
      cancel: "Batal",
      exportData: "Eksport Data",
      exportDataDesc: "Muat turun semua entri jurnal mimpi anda sebagai fail JSON atau PDF.",
      exportDreamsJson: "Eksport sebagai JSON",
      exportDreamsPdf: "Eksport sebagai PDF",
      about: "Tentang",
      version: "Versi",
      creator: "Pencipta",
      language: "Bahasa",
      languageDesc: "Pilih bahasa pilihan anda",
      english: "English",
      malay: "Bahasa Melayu",
      dreamJournal: "Jurnal Mimpi",
      exportedOn: "Dieksport pada",
      summary: "Ringkasan",
      interpretation: "Tafsiran",
      tags: "Tag",
      mood: "Perasaan",
      lucidity: "Kejelasan",
      vividness: "Ketajaman"
    }
  }

  // Apply settings-page class to document body
  useEffect(() => {
    document.body.classList.add('settings-page');
    document.documentElement.classList.add('settings-page');
    
    return () => {
      document.body.classList.remove('settings-page');
      document.documentElement.classList.remove('settings-page');
    };
  }, []);

  const clearAllDreams = async () => {
    try {
      setIsClearing(true)
      await deleteAllDreams()
      setShowConfirmation(false)
      setDreams([]) // Update local state
      toast.success(language === 'en' ? "Dream journal cleared" : "Jurnal mimpi dikosongkan", {
        description: language === 'en' ? "All dream entries have been deleted" : "Semua entri mimpi telah dipadamkan"
      })
    } catch (error) {
      console.error('Error clearing dreams:', error)
      toast.error(language === 'en' ? "Failed to clear dreams" : "Gagal mengosongkan mimpi")
    } finally {
      setIsClearing(false)
    }
  }

  const handleLanguageChange = (newLanguage: 'en' | 'ms') => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    
    // Dispatch storage event for other windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'language',
      newValue: newLanguage,
      storageArea: localStorage
    }))
    
    // Dispatch custom event for same window
    window.dispatchEvent(new StorageEvent('storage-local', {
      key: 'language',
      newValue: newLanguage,
      storageArea: localStorage
    }))
    
    toast.success(newLanguage === 'en' ? "Language changed to English" : "Bahasa ditukar ke Bahasa Melayu")
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error(language === 'en' ? 'Error signing out' : 'Ralat semasa log keluar')
    }
  }

  const handlePdfExport = async () => {
    if (dreams.length === 0) return

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const sortedDreams = dreams.sort((a: Dream, b: Dream) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // Create the print content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dream Journal</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 2cm auto;
              padding: 0 20px;
              color: #1a1a1a;
              background: white;
              line-height: 1.6;
            }

            .header {
              text-align: center;
              margin-bottom: 4rem;
              padding-bottom: 2rem;
              border-bottom: 2px solid #e5e7eb;
            }

            .header h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin: 0 0 1rem 0;
              color: #111827;
            }

            .header p {
              color: #6b7280;
              font-size: 0.875rem;
            }

            .dream-entry {
              margin-bottom: 3rem;
              padding: 2rem;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #ffffff;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              page-break-inside: avoid;
            }

            .dream-entry:last-child {
              margin-bottom: 0;
            }

            .title {
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #111827;
            }

            .date {
              color: #6b7280;
              font-size: 0.875rem;
              margin-bottom: 1.5rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #f3f4f6;
            }

            .section {
              margin-bottom: 1.5rem;
            }

            .section-title {
              font-weight: 600;
              font-size: 1rem;
              margin-bottom: 0.5rem;
              color: #374151;
            }

            .content {
              margin-bottom: 1rem;
              white-space: pre-wrap;
              color: #1f2937;
            }

            .metadata {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 1rem;
              padding: 1rem;
              background: #f9fafb;
              border-radius: 8px;
              margin-top: 1.5rem;
            }

            .metadata-item {
              display: flex;
              flex-direction: column;
            }

            .metadata-label {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #6b7280;
              margin-bottom: 0.25rem;
            }

            .metadata-value {
              color: #111827;
              font-weight: 500;
            }

            .page-number {
              position: running(pageNumber);
              text-align: center;
              font-size: 0.75rem;
              color: #9ca3af;
            }

            @page {
              size: A4;
              margin: 2cm;
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
              }
            }

            @media print {
              body {
                margin: 0;
                padding: 2cm;
              }

              .dream-entry {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dream Journal</h1>
            <p>${translations[language].exportedOn} ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>

          ${sortedDreams.map(dream => `
            <div class="dream-entry">
              <div class="title">${dream.title || ''}</div>
              <div class="date">${new Date(dream.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>

              ${dream.summary ? `
                <div class="section">
                  <div class="section-title">${translations[language].summary}</div>
                  <div class="content">${dream.summary}</div>
                </div>
              ` : ''}

              ${dream.unusual_events?.occurred ? `
                <div class="section">
                  <div class="section-title">Unusual Events</div>
                  <div class="content">${dream.unusual_events.description}</div>
                </div>
              ` : ''}

              ${dream.final_moments ? `
                <div class="section">
                  <div class="section-title">Final Moments</div>
                  <div class="content">${dream.final_moments}</div>
                </div>
              ` : ''}

              <div class="metadata">
                ${dream.location ? `
                  <div class="metadata-item">
                    <span class="metadata-label">Location</span>
                    <span class="metadata-value">${dream.location}</span>
                  </div>
                ` : ''}
                
                ${dream.emotion ? `
                  <div class="metadata-item">
                    <span class="metadata-label">${translations[language].mood}</span>
                    <span class="metadata-value">${dream.emotion}</span>
                  </div>
                ` : ''}
                
                ${dream.time_of_day ? `
                  <div class="metadata-item">
                    <span class="metadata-label">Time of Day</span>
                    <span class="metadata-value">${dream.time_of_day}</span>
                  </div>
                ` : ''}
                
                ${dream.people ? `
                  <div class="metadata-item">
                    <span class="metadata-label">People</span>
                    <span class="metadata-value">${dream.people}</span>
                  </div>
                ` : ''}

                ${dream.activity ? `
                  <div class="metadata-item">
                    <span class="metadata-label">Activity</span>
                    <span class="metadata-value">${dream.activity}</span>
                  </div>
                ` : ''}

                ${dream.symbols ? `
                  <div class="metadata-item">
                    <span class="metadata-label">Symbols</span>
                    <span class="metadata-value">${dream.symbols}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}

          <div class="page-number"></div>
        </body>
      </html>
    `)

    // Wait for content to load then print
    printWindow.document.close()
    printWindow.focus()
    
    // Print after a short delay to ensure styles are loaded
    setTimeout(() => {
      printWindow.print()
      // Close the window after printing (or if user cancels)
      printWindow.onafterprint = () => printWindow.close()
    }, 1000)
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 settings-page">
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-3">
        <div className="flex items-center">
          <Link href="/home" className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold ml-2">{translations[language].settings}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* User Profile Section */}
          {!isLoading && user && (
            <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{translations[language].profile}</h2>
                  <div className="text-zinc-400 mb-4">
                    <div className="text-sm">{translations[language].email}</div>
                    <div className="text-white">{user.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 border border-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {translations[language].signOut}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Language Selection */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-blue-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{translations[language].language}</h2>
                <p className="text-zinc-400 mb-4">{translations[language].languageDesc}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      language === 'en'
                        ? "bg-black/40 border border-zinc-500/20 text-white"
                        : "bg-black/40 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-black/60"
                    }`}
                  >
                    {translations[language].english}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ms')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      language === 'ms'
                        ? "bg-black/40 border border-zinc-500/20 text-white"
                        : "bg-black/40 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-black/60"
                    }`}
                  >
                    {translations[language].malay}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Data Privacy Notice */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-blue-400">
                <InfoIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{translations[language].dataPrivacy}</h2>
                <p className="text-zinc-400">
                  {translations[language].dataPrivacyDesc}
                </p>
              </div>
            </div>
          </section>
          
          {/* Data Management Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">{translations[language].dataManagement}</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex flex-col gap-3 mb-2">
                  <div>
                    <h3 className="font-medium">{translations[language].clearJournal}</h3>
                    <p className="text-sm text-zinc-400">{translations[language].clearJournalDesc}</p>
                  </div>
                  <button 
                    onClick={() => setShowConfirmation(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 border border-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {translations[language].clearAll}
                  </button>
                </div>
                
                {showConfirmation && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-200 mb-3">
                          {translations[language].confirmClear}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={clearAllDreams}
                            disabled={isClearing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 border border-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isClearing ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                {translations[language].clearing}
                              </>
                            ) : (
                              translations[language].yesClearAll
                            )}
                          </button>
                          <button 
                            onClick={() => setShowConfirmation(false)}
                            disabled={isClearing}
                            className="px-4 py-2 bg-black/40 hover:bg-black/60 border border-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {translations[language].cancel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col gap-3 mb-2">
                  <div>
                    <h3 className="font-medium">{translations[language].exportData}</h3>
                    <p className="text-sm text-zinc-400">{translations[language].exportDataDesc}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(dreams, null, 2)
                        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
                        const exportFileDefaultName = 'dreams.json'
                        const linkElement = document.createElement('a')
                        linkElement.setAttribute('href', dataUri)
                        linkElement.setAttribute('download', exportFileDefaultName)
                        linkElement.click()
                      }}
                      disabled={isLoadingDreams || dreams.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 border border-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {translations[language].exportDreamsJson}
                    </button>
                    <button
                      onClick={handlePdfExport}
                      disabled={isLoadingDreams || dreams.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 border border-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {translations[language].exportDreamsPdf}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* About Section */}
          <section className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold mb-4">{translations[language].about}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Aetherial - Dream Journal</h3>
                <p className="text-sm text-zinc-400">{translations[language].version} 1.0.0</p>
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <h3 className="font-medium">{translations[language].creator}</h3>
                <p className="text-zinc-400 mt-1">Ikram Hakim</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Email:</span>
                    <a href="mailto:ikramandhakim@gmail.com" className="text-blue-400 hover:underline">
                      ikramandhakim@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">X:</span>
                    <a href="https://x.com/Kaberikram" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      @Kaberikram
                    </a>
                  </div>
                </div>
              </div>
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