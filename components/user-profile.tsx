"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/utils/supabase/client"

interface UserProfileProps {
  language: 'en' | 'ms'
  dreamCount?: number // Optional prop to pass dream count if available
}

export function UserProfile({ language, dreamCount: propDreamCount }: UserProfileProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dreamCount, setDreamCount] = useState(propDreamCount || 0)
  const [level, setLevel] = useState(1)
  const [progress, setProgress] = useState(0)

  const translations = {
    en: {
      profile: "Profile",
      level: "Level",
      dreams: "Dreams",
      progress: "Progress to Next Level",
      guest: "Guest"
    },
    ms: {
      profile: "Profil",
      level: "Tahap",
      dreams: "Mimpi",
      progress: "Kemajuan ke Tahap Seterusnya",
      guest: "Tetamu"
    }
  }

  // Calculate level based on dream count
  const calculateLevel = (count: number) => {
    // Example formula: level = floor(sqrt(dreamCount)) + 1
    // Level 1: 0-3 dreams
    // Level 2: 4-8 dreams
    // Level 3: 9-15 dreams
    // etc.
    const level = Math.floor(Math.sqrt(count)) + 1
    
    // Calculate progress to next level
    const currentLevelThreshold = Math.pow(level - 1, 2)
    const nextLevelThreshold = Math.pow(level, 2)
    const progressPercentage = ((count - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
    
    return { level, progress: Math.min(progressPercentage, 100) }
  }

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Error fetching user:", error.message)
          return
        }
        
        setUser(user)
        
        // If dream count wasn't provided as a prop, load all dreams from local storage
        if (!propDreamCount) {
          const dreamsString = localStorage.getItem('dreams')
          if (dreamsString) {
            const dreams = JSON.parse(dreamsString)
            setDreamCount(dreams.length)
            
            const { level, progress } = calculateLevel(dreams.length)
            setLevel(level)
            setProgress(progress)
          }
        } else {
          const { level, progress } = calculateLevel(propDreamCount)
          setLevel(level)
          setProgress(progress)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [propDreamCount])

  return (
    <Card className="bg-gray-800 text-white border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <User className="w-5 h-5 mr-2" />
          {translations[language].profile}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">{translations[language].level}</p>
                <p className="text-2xl font-bold">{level}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">{translations[language].dreams}</p>
                <p className="text-2xl font-bold">{dreamCount}</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{translations[language].progress}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-700" />
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-gray-400">
                {user ? user.email : translations[language].guest}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 