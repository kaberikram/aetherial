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
import { toast } from "sonner"

// Daily generation limit - must match the API
const DAILY_LIMIT = 2

interface Dream {
  id: string
  date: string
  content: string
  title: string
  summary?: string
  interpretation?: string
  tags?: string[]
  mood?: string
  lucidity?: number
  vividness?: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  const translations = {
    en: {
      settings: "Settings",
      profile: "Profile",
      email: "Email",
      signOut: "Sign Out",
      dataPrivacy: "Data Privacy",
      dataPrivacyDesc: "All your dream data is stored locally on your device. Nothing is sent to any server. Your privacy is important to us.",
      dataManagement: "Data Management",
      clearJournal: "Clear Dream Journal",
      clearJournalDesc: "Delete all your dream entries. This action cannot be undone.",
      clearAll: "Clear All",
      confirmClear: "Are you sure you want to delete all dream entries? This action cannot be undone.",
      clearing: "Clearing...",
      yesClearAll: "Yes, Clear All",
      cancel: "Cancel",
      resetSample: "Reset Dreams",
      resetSampleDesc: "Clear all your dreams and start fresh.",
      resetting: "Resetting...",
      resetDreams: "Reset Dreams",
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
      dataPrivacyDesc: "Semua data mimpi anda disimpan secara lokal di peranti anda. Tiada data dihantar ke mana-mana pelayan. Privasi anda penting bagi kami.",
      dataManagement: "Pengurusan Data",
      clearJournal: "Kosongkan Jurnal Mimpi",
      clearJournalDesc: "Padamkan semua entri mimpi anda. Tindakan ini tidak boleh dibatalkan.",
      clearAll: "Kosongkan Semua",
      confirmClear: "Adakah anda pasti mahu memadamkan semua entri mimpi? Tindakan ini tidak boleh dibatalkan.",
      clearing: "Mengosongkan...",
      yesClearAll: "Ya, Kosongkan Semua",
      cancel: "Batal",
      resetSample: "Muat Semula dengan Mimpi Contoh",
      resetSampleDesc: "Gantikan mimpi semasa anda dengan set 6 mimpi contoh.",
      resetting: "Memuat semula...",
      resetDreams: "Muat Semula Mimpi",
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

  const clearAllDreams = () => {
    setIsClearing(true)
    setTimeout(() => {
      localStorage.setItem("dreams", "[]")
      setShowConfirmation(false)
      setIsClearing(false)
      toast.success(language === 'en' ? "Dream journal cleared" : "Jurnal mimpi dikosongkan", {
        description: language === 'en' ? "All dream entries have been deleted" : "Semua entri mimpi telah dipadamkan"
      })
    }, 1000)
  }

  const resetWithSampleDreams = () => {
    setIsResetting(true)
    setTimeout(() => {
      forceResetWithAllSampleDreams()
      setIsResetting(false)
      toast.success(language === 'en' ? "Sample dreams added" : "Mimpi contoh ditambah", {
        description: language === 'en' ? "Your dream journal has been reset with sample dreams" : "Jurnal mimpi anda telah dimuat semula dengan mimpi contoh"
      })
    }, 1000)
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

  const handlePdfExport = () => {
    const dreams: Dream[] = JSON.parse(localStorage.getItem("dreams") || "[]")
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
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 2cm auto;
              padding: 0 20px;
              color: black;
              background: white;
            }
            .dream-entry {
              margin-bottom: 3rem;
              padding-bottom: 2rem;
              border-bottom: 1px solid #eee;
              page-break-inside: avoid;
            }
            .dream-entry:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .date {
              color: #666;
              margin-bottom: 1.5rem;
            }
            .section-title {
              font-weight: 600;
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }
            .content {
              margin-bottom: 1rem;
              white-space: pre-wrap;
            }
            .metadata {
              margin: 1rem 0;
              color: #666;
            }
            .metadata > div {
              margin-bottom: 0.25rem;
            }
            .tags {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            .tag {
              background: #f3f4f6;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.875rem;
            }
            @media print {
              body {
                margin: 0;
                padding: 2cm;
              }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 2rem;">${translations[language].dreamJournal}</h1>
          <p style="text-align: center; color: #666; margin-bottom: 3rem;">
            ${translations[language].exportedOn} ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          ${sortedDreams.map(dream => `
            <div class="dream-entry">
              <div class="title">${dream.title || ''}</div>
              <div class="date">${new Date(dream.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
              ${dream.summary ? `
                <div class="section-title">${translations[language].summary}</div>
                <div class="content">${dream.summary}</div>
              ` : ''}
              ${dream.content ? `
                <div class="content">${dream.content}</div>
              ` : ''}
              ${dream.interpretation ? `
                <div class="section-title">${translations[language].interpretation}</div>
                <div class="content">${dream.interpretation}</div>
              ` : ''}
              ${(dream.mood || dream.lucidity !== undefined || dream.vividness !== undefined) ? `
                <div class="metadata">
                  ${dream.mood ? `
                    <div>
                      <strong>${translations[language].mood}:</strong> ${dream.mood}
                    </div>
                  ` : ''}
                  ${dream.lucidity !== undefined ? `
                    <div>
                      <strong>${translations[language].lucidity}:</strong> ${dream.lucidity}/5
                    </div>
                  ` : ''}
                  ${dream.vividness !== undefined ? `
                    <div>
                      <strong>${translations[language].vividness}:</strong> ${dream.vividness}/5
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              ${dream.tags && dream.tags.length > 0 ? `
                <div class="section-title">${translations[language].tags}</div>
                <div class="tags">
                  ${dream.tags.map(tag => `
                    <span class="tag">${tag}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
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
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="h-9 px-3 text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {translations[language].signOut}
                  </Button>
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
                  <Button
                    variant={language === 'en' ? "default" : "outline"}
                    onClick={() => handleLanguageChange('en')}
                    className="h-8 px-3 text-sm"
                  >
                    {translations[language].english}
                  </Button>
                  <Button
                    variant={language === 'ms' ? "default" : "outline"}
                    onClick={() => handleLanguageChange('ms')}
                    className="h-8 px-3 text-sm"
                  >
                    {translations[language].malay}
                  </Button>
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
                  <Button 
                    variant="destructive"
                    onClick={() => setShowConfirmation(true)}
                    className="shrink-0 w-full md:w-auto h-9 px-3 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {translations[language].clearAll}
                  </Button>
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
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={clearAllDreams}
                            disabled={isClearing}
                          >
                            {isClearing ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                                {translations[language].clearing}
                              </>
                            ) : (
                              translations[language].yesClearAll
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowConfirmation(false)}
                            disabled={isClearing}
                          >
                            {translations[language].cancel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col gap-3 mb-2">
                  <div>
                    <h3 className="font-medium">{translations[language].resetSample}</h3>
                    <p className="text-sm text-zinc-400">{translations[language].resetSampleDesc}</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={resetWithSampleDreams}
                    disabled={isResetting}
                    className="shrink-0 w-full md:w-auto h-9 px-3 text-sm font-medium"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {translations[language].resetting}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {translations[language].resetDreams}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col gap-3 mb-2">
                  <div>
                    <h3 className="font-medium">{translations[language].exportData}</h3>
                    <p className="text-sm text-zinc-400">{translations[language].exportDataDesc}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
                        const dataStr = JSON.stringify(dreams, null, 2)
                        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
                        const exportFileDefaultName = 'dreams.json'
                        const linkElement = document.createElement('a')
                        linkElement.setAttribute('href', dataUri)
                        linkElement.setAttribute('download', exportFileDefaultName)
                        linkElement.click()
                      }}
                      className="h-9 px-4"
                    >
                      {translations[language].exportDreamsJson}
                    </Button>
                    <Button
                      onClick={handlePdfExport}
                      className="h-9 px-4"
                    >
                      {translations[language].exportDreamsPdf}
                    </Button>
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