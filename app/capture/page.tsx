"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2Icon, Sparkles, Save } from "lucide-react"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { BottomNav } from "@/components/bottom-nav"
import { createDream } from "@/utils/supabase/dreams"
import type { Dream } from "@/utils/supabase/dreams"

interface DreamEntry extends Omit<Dream, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

interface Translations {
  en: {
    newDreamEntry: string
    dreamTitle: string
    enterTitle: string
    whereWereYou: string
    locationPlaceholder: string
    whoWasThere: string
    peoplePlaceholder: string
    timeOfDay: string
    whatWereYouDoing: string
    activityPlaceholder: string
    anythingUnusual: string
    yes: string
    no: string
    describeWhat: string
    seeSymbols: string
    symbolsPlaceholder: string
    howDidYouFeel: string
    dreamCategory: string
    dreamState: string
    dreamType: string
    morning: string
    afternoon: string
    night: string
    unknown: string
    happy: string
    scared: string
    confused: string
    peaceful: string
    anxious: string
    excited: string
    howDidDreamEnd: string
    selectOption: string
    abruptly: string
    slowly: string
    wokeUpSuddenly: string
    fadedAway: string
    lastThingBeforeWaking: string
    lastThingPlaceholder: string
    dreamSummary: string
    saveDream: string
    saveAndVisualize: string
    dreamCategories: {
      daytimeCarryover: string
      random: string
      carried: string
      learning: string
      receiving: string
      message: string
      disturbance: string
      blank: string
    }
    dreamStates: {
      watching: string
      character: string
      both: string
    }
    dreamTypes: {
      normal: string
      awareButCantControl: string
      mimpiSedar: string
      mimpiAmbang: string
      mimpiJelas: string
    }
    summaryTemplates: {
      wasAt: string
      with: string
      noOne: string
      itWas: string
      and: string
      somethingUnusual: string
      sawSymbols: string
      iFelt: string
      theDream: string
      lastThing: string
      dreamCategory: string
      dreamState: string
      dreamType: string
    }
  }
  ms: {
    newDreamEntry: string
    dreamTitle: string
    enterTitle: string
    whereWereYou: string
    locationPlaceholder: string
    whoWasThere: string
    peoplePlaceholder: string
    timeOfDay: string
    whatWereYouDoing: string
    activityPlaceholder: string
    anythingUnusual: string
    yes: string
    no: string
    describeWhat: string
    seeSymbols: string
    symbolsPlaceholder: string
    howDidYouFeel: string
    dreamCategory: string
    dreamState: string
    dreamType: string
    morning: string
    afternoon: string
    night: string
    unknown: string
    happy: string
    scared: string
    confused: string
    peaceful: string
    anxious: string
    excited: string
    howDidDreamEnd: string
    selectOption: string
    abruptly: string
    slowly: string
    wokeUpSuddenly: string
    fadedAway: string
    lastThingBeforeWaking: string
    lastThingPlaceholder: string
    dreamSummary: string
    saveDream: string
    saveAndVisualize: string
    dreamCategories: {
      daytimeCarryover: string
      random: string
      carried: string
      learning: string
      receiving: string
      message: string
      disturbance: string
      blank: string
    }
    dreamStates: {
      watching: string
      character: string
      both: string
    }
    dreamTypes: {
      normal: string
      awareButCantControl: string
      mimpiSedar: string
      mimpiAmbang: string
      mimpiJelas: string
    }
    summaryTemplates: {
      wasAt: string
      with: string
      noOne: string
      itWas: string
      and: string
      somethingUnusual: string
      sawSymbols: string
      iFelt: string
      theDream: string
      lastThing: string
      dreamCategory: string
      dreamState: string
      dreamType: string
    }
  }
}

export default function DreamCapture() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [error, setError] = useState<string | null>(null)
  const [dream, setDream] = useState<Omit<Dream, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    title: `Dream ${new Date().toLocaleDateString()}`,
    date: new Date().toISOString(),
    location: "",
    people: "",
    time_of_day: "Unknown",
    activity: "",
    unusual_events: {
      occurred: false,
      description: "",
    },
    symbols: "",
    emotion: "Happy",
    kategori_mimpi: "Random Dream",
    keadaan_mimpi: "Character in Dream",
    jenis_mimpi: "Normal Dream",
    ending: "",
    final_moments: "",
    summary: "",
  })

  const [isEditing, setIsEditing] = useState(false)

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

  // Apply capture-page class to document body and html
  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add('capture-page');
    document.documentElement.classList.add('capture-page');
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('capture-page');
      document.documentElement.classList.remove('capture-page');
    };
  }, []);

  const handleSave = async () => {
    try {
      setError(null)
      console.log('Attempting to save dream:', dream)
      
      const dreamToSave = {
        ...dream,
        summary: dream.summary || generateSummary(),
      }
      
      console.log('Processed dream to save:', dreamToSave)
      const savedDream = await createDream(dreamToSave)
      console.log('Dream saved successfully:', savedDream)
      
      router.push("/home")
    } catch (error) {
      console.error('Failed to save dream. Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
    }
  }

  const handleSaveAndVisualize = async () => {
    try {
      setError(null)
      console.log('Attempting to save dream:', dream)
      
      const dreamToSave = {
        ...dream,
        summary: dream.summary || generateSummary(),
      }
      
      console.log('Processed dream to save:', dreamToSave)
      const savedDream = await createDream(dreamToSave)
      console.log('Dream saved successfully:', savedDream)
      
      router.push(`/dream/${savedDream.id}`)
    } catch (error) {
      console.error('Failed to save dream. Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
    }
  }

  const translations = {
    en: {
      newDreamEntry: "New Dream Entry",
      dreamTitle: "Dream Title",
      enterTitle: "Enter a title for your dream...",
      whereWereYou: "Where were you?",
      locationPlaceholder: "Beach, childhood home, strange building...",
      whoWasThere: "Who was there?",
      peoplePlaceholder: "Friends, family, strangers, no one...",
      timeOfDay: "Time of day",
      whatWereYouDoing: "What were you doing?",
      activityPlaceholder: "I was running, flying, talking to...",
      anythingUnusual: "Did anything unusual happen?",
      yes: "Yes",
      no: "No",
      describeWhat: "Describe what happened...",
      seeSymbols: "Did you see any symbols?",
      symbolsPlaceholder: "A key, a door, an animal...",
      howDidYouFeel: "How did you feel?",
      dreamCategory: "Dream Category",
      dreamState: "Dream State",
      dreamType: "Dream Type",
      morning: "Morning",
      afternoon: "Afternoon",
      night: "Night",
      unknown: "Unknown",
      happy: "Happy",
      scared: "Scared",
      confused: "Confused",
      peaceful: "Peaceful",
      anxious: "Anxious",
      excited: "Excited",
      howDidDreamEnd: "How did the dream end?",
      selectOption: "Select an option",
      abruptly: "Abruptly",
      slowly: "Slowly",
      wokeUpSuddenly: "Woke Up Suddenly",
      fadedAway: "Faded Away",
      lastThingBeforeWaking: "Last thing before waking up?",
      lastThingPlaceholder: "A sound, a thought, a feeling...",
      dreamSummary: "Dream Summary",
      saveDream: "Save Dream",
      saveAndVisualize: "Save & Visualize Dream",
      dreamCategories: {
        daytimeCarryover: "Daytime Carryover Dream",
        random: "Random Dream",
        carried: "Carried Dream",
        learning: "Learning Dream",
        receiving: "Receiving Dream",
        message: "Message Dream",
        disturbance: "Disturbance Dream",
        blank: "Blank Dream"
      },
      dreamStates: {
        watching: "Watching a Screen",
        character: "Character in Dream",
        both: "Both Watching and Being a Character"
      },
      dreamTypes: {
        normal: "Normal Dream",
        awareButCantControl: "Aware but Can't Control",
        mimpiSedar: "Mimpi Sedar",
        mimpiAmbang: "Mimpi Ambang",
        mimpiJelas: "Mimpi Jelas"
      },
      summaryTemplates: {
        wasAt: "I was at",
        with: "with",
        noOne: "no one",
        itWas: "It was",
        and: "and",
        somethingUnusual: "Something unusual happened:",
        sawSymbols: "I saw symbols like",
        iFelt: "I felt",
        theDream: "The dream ended",
        lastThing: "The last thing I remember was",
        dreamCategory: "This was a",
        dreamState: "In this dream, I was",
        dreamType: "It was a"
      }
    },
    ms: {
      newDreamEntry: "Entri Mimpi Baru",
      dreamTitle: "Tajuk Mimpi",
      enterTitle: "Masukkan tajuk untuk mimpi anda...",
      whereWereYou: "Di mana anda berada?",
      locationPlaceholder: "Pantai, rumah zaman kanak-kanak, bangunan pelik...",
      whoWasThere: "Siapa yang ada di sana?",
      peoplePlaceholder: "Kawan, keluarga, orang asing, tiada siapa...",
      timeOfDay: "Masa hari",
      whatWereYouDoing: "Apa yang anda lakukan?",
      activityPlaceholder: "Saya berlari, terbang, bercakap dengan...",
      anythingUnusual: "Adakah sesuatu yang luar biasa berlaku?",
      yes: "Ya",
      no: "Tidak",
      describeWhat: "Terangkan apa yang berlaku...",
      seeSymbols: "Adakah anda melihat sebarang simbol?",
      symbolsPlaceholder: "Kunci, pintu, haiwan...",
      howDidYouFeel: "Bagaimana perasaan anda?",
      dreamCategory: "Kategori Mimpi",
      dreamState: "Keadaan Mimpi",
      dreamType: "Jenis Mimpi",
      morning: "Pagi",
      afternoon: "Tengah Hari",
      night: "Malam",
      unknown: "Tidak Pasti",
      happy: "Gembira",
      scared: "Takut",
      confused: "Keliru",
      peaceful: "Tenang",
      anxious: "Cemas",
      excited: "Teruja",
      howDidDreamEnd: "Bagaimana mimpi ini berakhir?",
      selectOption: "Pilih satu pilihan",
      abruptly: "Secara Tiba-tiba",
      slowly: "Secara Perlahan",
      wokeUpSuddenly: "Terjaga Mengejut",
      fadedAway: "Pudar Perlahan",
      lastThingBeforeWaking: "Perkara terakhir sebelum terjaga?",
      lastThingPlaceholder: "Bunyi, fikiran, perasaan...",
      dreamSummary: "Ringkasan Mimpi",
      saveDream: "Simpan Mimpi",
      saveAndVisualize: "Simpan & Visualkan Mimpi",
      dreamCategories: {
        daytimeCarryover: "Mimpi Bawaan Sianghari",
        random: "Mimpi Merapu",
        carried: "Mimpi Di Bawa",
        learning: "Mimpi Belajar",
        receiving: "Mimpi Dapat Benda",
        message: "Mimpi Pesanan",
        disturbance: "Mimpi Gangguan",
        blank: "Mimpi Blank (Kosong)"
      },
      dreamStates: {
        watching: "Tengok Skrin",
        character: "Watak Dalam Mimpi",
        both: "Tengok Skrin Dan Watak Sekali"
      },
      dreamTypes: {
        normal: "Mimpi Biasa",
        awareButCantControl: "Sedar tapi Tidak Boleh Mengawal",
        mimpiSedar: "Mimpi Sedar",
        mimpiAmbang: "Mimpi Ambang",
        mimpiJelas: "Mimpi Jelas"
      },
      summaryTemplates: {
        wasAt: "Saya berada di",
        with: "bersama",
        noOne: "seorang diri",
        itWas: "Ia adalah waktu",
        and: "dan",
        somethingUnusual: "Sesuatu yang luar biasa berlaku:",
        sawSymbols: "Saya nampak simbol seperti",
        iFelt: "Saya berasa",
        theDream: "Mimpi itu berakhir",
        lastThing: "Perkara terakhir yang saya ingat ialah",
        dreamCategory: "Ini adalah",
        dreamState: "Dalam mimpi ini, saya",
        dreamType: "Ia adalah"
      }
    }
  } satisfies Record<'en' | 'ms', Record<string, string | Record<string, string>>>

  const generateSummary = (): string => {
    const t = translations[language].summaryTemplates
    const timeOfDayKey = dream.time_of_day.toLowerCase() as keyof typeof translations.en
    const emotionKey = dream.emotion.toLowerCase() as keyof typeof translations.en
    
    const timeOfDay = translations[language][timeOfDayKey]
    const emotion = translations[language][emotionKey]

    // Create reverse mappings for translations
    const dreamCategoryMap = {
      "Daytime Carryover Dream": translations[language].dreamCategories.daytimeCarryover,
      "Random Dream": translations[language].dreamCategories.random,
      "Carried Dream": translations[language].dreamCategories.carried,
      "Learning Dream": translations[language].dreamCategories.learning,
      "Receiving Dream": translations[language].dreamCategories.receiving,
      "Message Dream": translations[language].dreamCategories.message,
      "Disturbance Dream": translations[language].dreamCategories.disturbance,
      "Blank Dream": translations[language].dreamCategories.blank
    }

    const dreamStateMap = {
      "Watching a Screen": translations[language].dreamStates.watching,
      "Character in Dream": translations[language].dreamStates.character,
      "Both Watching and Being a Character": translations[language].dreamStates.both
    }

    const dreamTypeMap = {
      "Normal Dream": translations[language].dreamTypes.normal,
      "Aware but Can't Control": translations[language].dreamTypes.awareButCantControl,
      "Mimpi Sedar": translations[language].dreamTypes.mimpiSedar,
      "Mimpi Ambang": translations[language].dreamTypes.mimpiAmbang,
      "Mimpi Jelas": translations[language].dreamTypes.mimpiJelas
    }

    // Get translated values using the maps
    const kategoriMimpi = dreamCategoryMap[dream.kategori_mimpi] || dream.kategori_mimpi
    const keadaanMimpi = dreamStateMap[dream.keadaan_mimpi] || dream.keadaan_mimpi
    const jenisMimpi = dreamTypeMap[dream.jenis_mimpi] || dream.jenis_mimpi
    const ending = dream.ending ? translations[language][dream.ending as keyof typeof translations.en] : ''

    return `${t.wasAt} ${dream.location} ${t.with} ${dream.people || t.noOne}. ${t.itWas} ${timeOfDay} ${t.and} ${dream.activity}. ${
      dream.unusual_events.occurred ? `${t.somethingUnusual} ${dream.unusual_events.description}.` : ""
    } ${dream.symbols ? `${t.sawSymbols} ${dream.symbols}.` : ""} ${t.iFelt} ${emotion}. ${t.dreamCategory} ${kategoriMimpi}. ${t.dreamState} ${keadaanMimpi}. ${t.dreamType} ${jenisMimpi}. ${t.theDream} ${ending}${
      dream.final_moments ? `. ${t.lastThing} ${dream.final_moments}.` : "."
    }`
  }

  const getSummaryText = (): string => {
    return dream.summary || generateSummary();
  }

  // Helper function to safely get translation string
  const getTranslation = (key: keyof typeof translations.en): string => {
    const value = translations[language][key]
    return typeof value === 'string' ? value : ''
  }

  const dreamTypeOptions = [
    { value: "Normal Dream", label: translations[language].dreamTypes.normal },
    { value: "Aware but Can't Control", label: translations[language].dreamTypes.awareButCantControl },
    { value: "Mimpi Sedar", label: translations[language].dreamTypes.mimpiSedar },
    { value: "Mimpi Ambang", label: translations[language].dreamTypes.mimpiAmbang },
    { value: "Mimpi Jelas", label: translations[language].dreamTypes.mimpiJelas }
  ]

  return (
    <div className="min-h-screen bg-black text-white pb-24 capture-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/home" className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">{translations[language].newDreamEntry}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mx-4 mt-4">
          {error}
        </div>
      )}

      {/* Main Form */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].dreamTitle}</label>
          <input
            type="text"
            value={dream.title}
            onChange={(e) => setDream({ ...dream, title: e.target.value })}
            placeholder={translations[language].enterTitle}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].whereWereYou}</label>
          <input
            type="text"
            value={dream.location}
            onChange={(e) => setDream({ ...dream, location: e.target.value })}
            placeholder={translations[language].locationPlaceholder}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* People */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].whoWasThere}</label>
          <input
            type="text"
            value={dream.people}
            onChange={(e) => setDream({ ...dream, people: e.target.value })}
            placeholder={translations[language].peoplePlaceholder}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Time of Day */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].timeOfDay}</label>
          <div className="grid grid-cols-4 gap-2">
            {["Morning", "Afternoon", "Night", "Unknown"].map((time) => (
              <button
                key={time}
                onClick={() => setDream({ ...dream, time_of_day: time as Dream['time_of_day'] })}
                className={`p-2 rounded-lg text-sm ${
                  dream.time_of_day === time ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                {getTranslation(time.toLowerCase() as keyof typeof translations.en)}
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].whatWereYouDoing}</label>
          <textarea
            value={dream.activity}
            onChange={(e) => setDream({ ...dream, activity: e.target.value })}
            placeholder={translations[language].activityPlaceholder}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500 min-h-[100px]"
          />
        </div>

        {/* Unusual Events */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].anythingUnusual}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDream({ ...dream, unusual_events: { ...dream.unusual_events, occurred: true } })}
              className={`p-2 rounded-lg ${
                dream.unusual_events.occurred ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              {translations[language].yes}
            </button>
            <button
              onClick={() => setDream({ ...dream, unusual_events: { occurred: false, description: "" } })}
              className={`p-2 rounded-lg ${
                !dream.unusual_events.occurred ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              {translations[language].no}
            </button>
          </div>
          {dream.unusual_events.occurred && (
            <textarea
              value={dream.unusual_events.description}
              onChange={(e) =>
                setDream({
                  ...dream,
                  unusual_events: { ...dream.unusual_events, description: e.target.value },
                })
              }
              placeholder={translations[language].describeWhat}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500 mt-2"
            />
          )}
        </div>

        {/* Symbols */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].seeSymbols}</label>
          <input
            type="text"
            value={dream.symbols}
            onChange={(e) => setDream({ ...dream, symbols: e.target.value })}
            placeholder={translations[language].symbolsPlaceholder}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Emotions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].howDidYouFeel}</label>
          <div className="grid grid-cols-3 gap-2">
            {["Happy", "Scared", "Confused", "Peaceful", "Anxious", "Excited"].map((emotion) => (
              <button
                key={emotion}
                onClick={() => setDream({ ...dream, emotion: emotion as Dream['emotion'] })}
                className={`p-2 rounded-lg ${
                  dream.emotion === emotion ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                {getTranslation(emotion.toLowerCase() as keyof typeof translations.en)}
              </button>
            ))}
          </div>
        </div>

        {/* Dream Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].dreamCategory}</label>
          <select
            value={dream.kategori_mimpi}
            onChange={(e) => setDream({ ...dream, kategori_mimpi: e.target.value as Dream['kategori_mimpi'] })}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <option value="Daytime Carryover Dream">{translations[language].dreamCategories.daytimeCarryover}</option>
            <option value="Random Dream">{translations[language].dreamCategories.random}</option>
            <option value="Carried Dream">{translations[language].dreamCategories.carried}</option>
            <option value="Learning Dream">{translations[language].dreamCategories.learning}</option>
            <option value="Receiving Dream">{translations[language].dreamCategories.receiving}</option>
            <option value="Message Dream">{translations[language].dreamCategories.message}</option>
            <option value="Disturbance Dream">{translations[language].dreamCategories.disturbance}</option>
            <option value="Blank Dream">{translations[language].dreamCategories.blank}</option>
          </select>
        </div>

        {/* Dream State */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].dreamState}</label>
          <select
            value={dream.keadaan_mimpi}
            onChange={(e) => setDream({ ...dream, keadaan_mimpi: e.target.value as Dream['keadaan_mimpi'] })}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <option value="Watching a Screen">{translations[language].dreamStates.watching}</option>
            <option value="Character in Dream">{translations[language].dreamStates.character}</option>
            <option value="Both Watching and Being a Character">{translations[language].dreamStates.both}</option>
          </select>
        </div>

        {/* Dream Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].dreamType}</label>
          <select
            value={dream.jenis_mimpi}
            onChange={(e) => setDream({ ...dream, jenis_mimpi: e.target.value as Dream['jenis_mimpi'] })}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            {dreamTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dream Ending */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].howDidDreamEnd}</label>
          <select
            value={dream.ending}
            onChange={(e) => setDream({ ...dream, ending: e.target.value })}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <option value="">{translations[language].selectOption}</option>
            <option value="abruptly">{translations[language].abruptly}</option>
            <option value="slowly">{translations[language].slowly}</option>
            <option value="wokeUpSuddenly">{translations[language].wokeUpSuddenly}</option>
            <option value="fadedAway">{translations[language].fadedAway}</option>
          </select>
        </div>

        {/* Final Moments */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].lastThingBeforeWaking}</label>
          <input
            type="text"
            value={dream.final_moments}
            onChange={(e) => setDream({ ...dream, final_moments: e.target.value })}
            placeholder={translations[language].lastThingPlaceholder}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Dream Summary */}
        <div className="space-y-2 border-t border-zinc-800 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{translations[language].dreamSummary}</h2>
            <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-lg hover:bg-zinc-900">
              <Edit2Icon className="h-5 w-5" />
            </button>
          </div>
          {isEditing ? (
            <textarea
              value={getSummaryText()}
              onChange={(e) => setDream({ ...dream, summary: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500 min-h-[100px]"
            />
          ) : (
            <p className="text-zinc-400">{getSummaryText()}</p>
          )}
        </div>

        {/* Save Buttons */}
        <div className="space-y-3 pt-4">
          <GradientButton 
            onClick={handleSave} 
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {translations[language].saveDream}
          </GradientButton>
          
          <GradientButton 
            onClick={handleSaveAndVisualize}
            className="w-full py-3 flex items-center justify-center gap-2 gradient-button-variant"
          >
            <Sparkles className="h-5 w-5" />
            {translations[language].saveAndVisualize}
          </GradientButton>
        </div>
      </main>

      {/* Bottom Navigation - Only show on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}

