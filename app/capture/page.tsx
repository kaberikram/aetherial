"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2Icon, Sparkles, Save } from "lucide-react"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { BottomNav } from "@/components/bottom-nav"

interface DreamEntry {
  id: string
  title: string
  date: string
  location: string
  people: string
  timeOfDay: "Morning" | "Afternoon" | "Night" | "Unknown"
  activity: string
  unusualEvents: {
    occurred: boolean
    description: string
  }
  symbols: string
  emotion: "Happy" | "Scared" | "Confused" | "Peaceful" | "Anxious" | "Excited"
  ending: string
  finalMoments: string
  summary: string
}

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
    }
  }
}

export default function DreamCapture() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [dream, setDream] = useState<DreamEntry>({
    id: "",
    title: `Dream ${new Date().toLocaleDateString()}`,
    date: new Date().toISOString(),
    location: "",
    people: "",
    timeOfDay: "Unknown",
    activity: "",
    unusualEvents: {
      occurred: false,
      description: "",
    },
    symbols: "",
    emotion: "Happy",
    ending: "",
    finalMoments: "",
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

  useEffect(() => {
    // Generate a unique ID for the dream when the component mounts
    setDream((prev) => ({ ...prev, id: `dream_${Date.now()}` }))
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

  const handleSave = () => {
    const dreamToSave = {
      id: dream.id,
      title: dream.title,
      date: dream.date,
      location: dream.location,
      emotion: dream.emotion,
      summary: dream.summary || generateSummary(),
    }
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    dreams.push(dreamToSave)
    localStorage.setItem("dreams", JSON.stringify(dreams))
    router.push("/home")
  }

  const handleSaveAndVisualize = () => {
    const dreamToSave = {
      id: dream.id,
      title: dream.title,
      date: dream.date,
      location: dream.location,
      emotion: dream.emotion,
      summary: dream.summary || generateSummary(),
    }
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    dreams.push(dreamToSave)
    localStorage.setItem("dreams", JSON.stringify(dreams))
    router.push(`/dream/${dream.id}`)
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
      summaryTemplates: {
        wasAt: "I was at",
        with: "with",
        noOne: "no one",
        itWas: "It was",
        and: "and",
        somethingUnusual: "Something unusual happened:",
        sawSymbols: "I saw symbols like",
        iFelt: "I felt",
        theDream: "The dream",
        lastThing: "The last thing I remember was"
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
      summaryTemplates: {
        wasAt: "Saya berada di",
        with: "bersama",
        noOne: "seorang diri",
        itWas: "Ia adalah waktu",
        and: "dan",
        somethingUnusual: "Sesuatu yang luar biasa berlaku:",
        sawSymbols: "Saya nampak simbol seperti",
        iFelt: "Saya berasa",
        theDream: "Mimpi itu",
        lastThing: "Perkara terakhir yang saya ingat ialah"
      }
    }
  } satisfies Record<'en' | 'ms', Record<string, string | Record<string, string>>>;

  const generateSummary = (): string => {
    const t = translations[language].summaryTemplates as Record<string, string>;
    const timeOfDay = translations[language][dream.timeOfDay.toLowerCase()] as string;
    const emotion = translations[language][dream.emotion.toLowerCase()] as string;
    const ending = dream.ending ? (translations[language][dream.ending.toLowerCase()] as string) : '';

    return `${t.wasAt} ${dream.location} ${t.with} ${dream.people || t.noOne}. ${t.itWas} ${timeOfDay} ${t.and} ${dream.activity}. ${
      dream.unusualEvents.occurred ? `${t.somethingUnusual} ${dream.unusualEvents.description}.` : ""
    } ${dream.symbols ? `${t.sawSymbols} ${dream.symbols}.` : ""} ${t.iFelt} ${emotion}. ${t.theDream} ${ending}${
      dream.finalMoments ? `. ${t.lastThing} ${dream.finalMoments}.` : "."
    }`
  }

  const getSummaryText = (): string => {
    return dream.summary || generateSummary();
  }

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
                onClick={() => setDream({ ...dream, timeOfDay: time as DreamEntry["timeOfDay"] })}
                className={`p-2 rounded-lg text-sm ${
                  dream.timeOfDay === time ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                {translations[language][time.toLowerCase() as keyof typeof translations['en']]}
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
              onClick={() => setDream({ ...dream, unusualEvents: { ...dream.unusualEvents, occurred: true } })}
              className={`p-2 rounded-lg ${
                dream.unusualEvents.occurred ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              {translations[language].yes}
            </button>
            <button
              onClick={() => setDream({ ...dream, unusualEvents: { occurred: false, description: "" } })}
              className={`p-2 rounded-lg ${
                !dream.unusualEvents.occurred ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              {translations[language].no}
            </button>
          </div>
          {dream.unusualEvents.occurred && (
            <textarea
              value={dream.unusualEvents.description}
              onChange={(e) =>
                setDream({
                  ...dream,
                  unusualEvents: { ...dream.unusualEvents, description: e.target.value },
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
                onClick={() => setDream({ ...dream, emotion: emotion as DreamEntry["emotion"] })}
                className={`p-2 rounded-lg ${
                  dream.emotion === emotion ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                {translations[language][emotion.toLowerCase() as keyof typeof translations['en']]}
              </button>
            ))}
          </div>
        </div>

        {/* Ending */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].howDidDreamEnd}</label>
          <select
            value={dream.ending}
            onChange={(e) => setDream({ ...dream, ending: e.target.value })}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <option value="">{translations[language].selectOption}</option>
            <option value="Abruptly">{translations[language].abruptly}</option>
            <option value="Slowly">{translations[language].slowly}</option>
            <option value="Woke Up Suddenly">{translations[language].wokeUpSuddenly}</option>
            <option value="Faded Away">{translations[language].fadedAway}</option>
          </select>
        </div>

        {/* Final Moments */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{translations[language].lastThingBeforeWaking}</label>
          <input
            type="text"
            value={dream.finalMoments}
            onChange={(e) => setDream({ ...dream, finalMoments: e.target.value })}
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

