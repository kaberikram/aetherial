"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Moon, Brain, Sparkles, CloudLightning } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"

export default function LandingPage() {
  const [language, setLanguage] = useState<'en' | 'ms'>('en');

  // Load language from local storage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to local storage when it changes
  const handleLanguageChange = (lang: 'en' | 'ms') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Dispatch custom event for other components
    window.dispatchEvent(new StorageEvent('storage-local', { key: 'language', newValue: lang }));
  };

  // Apply landing-page class to document body and html
  useEffect(() => {
    document.body.classList.add('landing-page');
    document.documentElement.classList.add('landing-page');
    
    return () => {
      document.body.classList.remove('landing-page');
      document.documentElement.classList.remove('landing-page');
    };
  }, []);

  // Translations
  const translations = {
    en: {
      title: "Capture Your Dreams, Unlock Your Mind",
      description: "A beautiful and intuitive dream journal that helps you record, explore, and understand your dreams.",
      features: "Features",
      howItWorks: "How It Works",
      readyToStart: "Ready to Start Your Dream Journey?",
      explore: "Explore our dream journal and visualization tools to discover new insights about yourself.",
      startExploring: "Start Exploring",
      dreamJournal: "Dream Journal",
      dreamJournalDesc: "Easily record and organize your dreams with our intuitive journaling interface.",
      patternRecognition: "Pattern Recognition",
      patternRecognitionDesc: "Discover recurring themes and symbols in your dreams over time.",
      dreamVisualization: "Dream Visualization",
      dreamVisualizationDesc: "Experience your dreams in a new way with our unique 3D visualization tool.",
      recordDreams: "Record Your Dreams",
      recordDreamsDesc: "As soon as you wake up, quickly capture your dream memories using our streamlined journaling interface.",
      exploreAnalyze: "Explore and Analyze",
      exploreAnalyzeDesc: "Use our powerful search and filtering tools to discover patterns and connections in your dream journal.",
      visualizeShare: "Visualize and Share",
      visualizeShareDesc: "Transform your dreams into stunning 3D visualizations and optionally share them with the community."
    },
    ms: {
      title: "Tangkap Mimpi Anda, Buka Minda Anda",
      description: "Jurnal mimpi yang cantik dan intuitif yang membantu anda merekod, meneroka, dan memahami mimpi anda.",
      features: "Ciri-ciri",
      howItWorks: "Cara Ia Berfungsi",
      readyToStart: "Bersedia untuk Memulakan Perjalanan Mimpi Anda?",
      explore: "Terokai jurnal mimpi dan alat visualisasi kami untuk menemui wawasan baru tentang diri anda.",
      startExploring: "Mulakan Penjelajahan",
      dreamJournal: "Jurnal Mimpi",
      dreamJournalDesc: "Mudah merekod dan mengatur mimpi anda dengan antara muka jurnal yang intuitif.",
      patternRecognition: "Pengenalan Corak",
      patternRecognitionDesc: "Temui tema dan simbol yang berulang dalam mimpi anda dari masa ke masa.",
      dreamVisualization: "Visualisasi Mimpi",
      dreamVisualizationDesc: "Alami mimpi anda dengan cara baru menggunakan alat visualisasi 3D unik kami.",
      recordDreams: "Rekod Mimpi Anda",
      recordDreamsDesc: "Sebaik sahaja anda bangun, cepat merekodkan ingatan mimpi anda menggunakan antara muka jurnal yang dipermudahkan.",
      exploreAnalyze: "Terokai dan Analisis",
      exploreAnalyzeDesc: "Gunakan alat carian dan penapisan yang kuat untuk menemui corak dan hubungan dalam jurnal mimpi anda.",
      visualizeShare: "Visualisasikan dan Kongsikan",
      visualizeShareDesc: "Ubah mimpi anda menjadi visualisasi 3D yang menakjubkan dan pilih untuk berkongsi dengan komuniti."
    }
  };

  return (
    <div className="min-h-screen landing-page">
      {/* Language Switcher */}
      <div className="flex justify-end p-4">
        <span 
          onClick={() => handleLanguageChange('en')} 
          className={`mr-4 cursor-pointer ${language === 'en' ? 'text-white font-bold' : 'text-gray-400'}`}
        >
          EN
        </span>
        <span 
          onClick={() => handleLanguageChange('ms')} 
          className={`cursor-pointer ${language === 'ms' ? 'text-white font-bold' : 'text-gray-400'}`}
        >
          BM
        </span>
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              {translations[language].title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
              {translations[language].description}
            </p>
            <div className="flex justify-center">
              <Link href="/home" className="w-full sm:w-auto">
                <GradientButton className="w-full px-8 py-3 text-lg flex items-center justify-center gap-2">
                  {translations[language].startExploring} <ArrowRight className="h-5 w-5" />
                </GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{translations[language].features}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="mb-4 text-blue-400">
                <Moon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translations[language].dreamJournal}</h3>
              <p className="text-zinc-400">
                {translations[language].dreamJournalDesc}
              </p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="mb-4 text-purple-400">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translations[language].patternRecognition}</h3>
              <p className="text-zinc-400">
                {translations[language].patternRecognitionDesc}
              </p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="mb-4 text-amber-400">
                <CloudLightning className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translations[language].dreamVisualization}</h3>
              <p className="text-zinc-400">
                {translations[language].dreamVisualizationDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{translations[language].howItWorks}</h2>
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{translations[language].recordDreams}</h3>
                <p className="text-zinc-400">
                  {translations[language].recordDreamsDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{translations[language].exploreAnalyze}</h3>
                <p className="text-zinc-400">
                  {translations[language].exploreAnalyzeDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{translations[language].visualizeShare}</h3>
                <p className="text-zinc-400">
                  {translations[language].visualizeShareDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-zinc-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{translations[language].readyToStart}</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            {translations[language].explore}
          </p>
          <Link href="/home">
            <GradientButton className="px-8 py-3 text-lg">
              {translations[language].startExploring}
            </GradientButton>
          </Link>
        </div>
      </section>
    </div>
  )
}

