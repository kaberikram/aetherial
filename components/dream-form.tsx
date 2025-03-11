"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createDream, updateDream } from "@/utils/supabase/dreams"
import type { Dream } from "@/utils/supabase/dreams"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { GradientButton } from "@/components/ui/gradient-button"

const translations = {
  en: {
    createDream: "Create Dream",
    editDream: "Edit Dream",
    title: "Title",
    date: "Date",
    location: "Location",
    people: "People",
    timeOfDay: "Time of Day",
    activity: "Activity",
    unusualEvents: "Unusual Events",
    unusualEventsOccurred: "Did unusual events occur?",
    unusualEventsDescription: "Description of unusual events",
    symbols: "Symbols",
    emotion: "Emotion",
    kategoriMimpi: "Dream Category",
    keadaanMimpi: "Dream State",
    jenisMimpi: "Dream Type",
    ending: "Ending",
    finalMoments: "Final Moments",
    summary: "Summary",
    submit: "Submit",
    update: "Update",
    success: {
      create: "Dream created successfully!",
      update: "Dream updated successfully!"
    },
    error: {
      create: "Failed to create dream",
      update: "Failed to update dream"
    },
    timeOfDayOptions: {
      Morning: "Morning",
      Afternoon: "Afternoon",
      Night: "Night",
      Unknown: "Unknown"
    },
    emotions: {
      Happy: "Happy",
      Scared: "Scared",
      Confused: "Confused",
      Peaceful: "Peaceful",
      Anxious: "Anxious",
      Excited: "Excited"
    },
    dreamCategories: {
      "Daytime Carryover Dream": "Daytime Carryover Dream",
      "Random Dream": "Random Dream",
      "Carried Dream": "Carried Dream",
      "Learning Dream": "Learning Dream",
      "Receiving Dream": "Receiving Dream",
      "Message Dream": "Message Dream",
      "Disturbance Dream": "Disturbance Dream",
      "Blank Dream": "Blank Dream"
    },
    dreamStates: {
      "Watching a Screen": "Watching a Screen",
      "Character in Dream": "Character in Dream",
      "Both Watching and Being a Character": "Both Watching and Being a Character"
    },
    dreamTypes: {
      "Normal Dream": "Normal Dream",
      "Aware but Can't Control": "Aware but Can't Control",
      "Lucid Dream": "Lucid Dream",
      "Liminal Dream": "Liminal Dream",
      "Vivid Dream": "Vivid Dream"
    },
    endings: {
      abruptly: "Abruptly",
      slowly: "Slowly",
      select: "Select an ending"
    }
  },
  ms: {
    createDream: "Cipta Mimpi",
    editDream: "Edit Mimpi",
    title: "Tajuk",
    date: "Tarikh",
    location: "Lokasi",
    people: "Orang",
    timeOfDay: "Waktu",
    activity: "Aktiviti",
    unusualEvents: "Peristiwa Luar Biasa",
    unusualEventsOccurred: "Adakah berlaku peristiwa luar biasa?",
    unusualEventsDescription: "Penerangan peristiwa luar biasa",
    symbols: "Simbol",
    emotion: "Perasaan",
    kategoriMimpi: "Kategori Mimpi",
    keadaanMimpi: "Keadaan Mimpi",
    jenisMimpi: "Jenis Mimpi",
    ending: "Pengakhiran",
    finalMoments: "Saat-saat Terakhir",
    summary: "Ringkasan",
    submit: "Hantar",
    update: "Kemaskini",
    success: {
      create: "Mimpi berjaya dicipta!",
      update: "Mimpi berjaya dikemaskini!"
    },
    error: {
      create: "Gagal mencipta mimpi",
      update: "Gagal mengemaskini mimpi"
    },
    timeOfDayOptions: {
      Morning: "Pagi",
      Afternoon: "Tengah Hari",
      Night: "Malam",
      Unknown: "Tidak Pasti"
    },
    emotions: {
      Happy: "Gembira",
      Scared: "Takut",
      Confused: "Keliru",
      Peaceful: "Tenang",
      Anxious: "Cemas",
      Excited: "Teruja"
    },
    dreamCategories: {
      "Daytime Carryover Dream": "Mimpi Bawaan Siang",
      "Random Dream": "Mimpi Rawak",
      "Carried Dream": "Mimpi Bawaan",
      "Learning Dream": "Mimpi Pembelajaran",
      "Receiving Dream": "Mimpi Penerimaan",
      "Message Dream": "Mimpi Pesanan",
      "Disturbance Dream": "Mimpi Gangguan",
      "Blank Dream": "Mimpi Kosong"
    },
    dreamStates: {
      "Watching a Screen": "Menonton Skrin",
      "Character in Dream": "Watak dalam Mimpi",
      "Both Watching and Being a Character": "Menonton dan Menjadi Watak"
    },
    dreamTypes: {
      "Normal Dream": "Mimpi Biasa",
      "Aware but Can't Control": "Sedar tapi Tidak Boleh Kawal",
      "Lucid Dream": "Mimpi Lucid",
      "Liminal Dream": "Mimpi Liminal",
      "Vivid Dream": "Mimpi Jelas"
    },
    endings: {
      abruptly: "Secara Tiba-tiba",
      slowly: "Secara Perlahan",
      select: "Pilih pengakhiran"
    }
  }
} as const;

const dreamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string(),
  people: z.string(),
  time_of_day: z.enum(["Morning", "Afternoon", "Night", "Unknown"]),
  activity: z.string(),
  unusual_events: z.object({
    occurred: z.boolean(),
    description: z.string()
  }),
  symbols: z.string(),
  emotion: z.enum(["Happy", "Scared", "Confused", "Peaceful", "Anxious", "Excited"]),
  kategori_mimpi: z.enum([
    "Daytime Carryover Dream",
    "Random Dream",
    "Carried Dream",
    "Learning Dream",
    "Receiving Dream",
    "Message Dream",
    "Disturbance Dream",
    "Blank Dream"
  ]),
  keadaan_mimpi: z.enum([
    "Watching a Screen",
    "Character in Dream",
    "Both Watching and Being a Character"
  ]),
  jenis_mimpi: z.enum([
    "Normal Dream",
    "Aware but Can't Control",
    "Lucid Dream",
    "Liminal Dream",
    "Vivid Dream"
  ]),
  ending: z.enum(["abruptly", "slowly"]).nullable(),
  final_moments: z.string(),
  summary: z.string().min(1, "Summary is required")
})

type DreamFormData = z.infer<typeof dreamSchema>

interface DreamFormProps {
  initialData?: Dream
  isEditing?: boolean
}

export function DreamForm({ initialData, isEditing = false }: DreamFormProps) {
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<DreamFormData>({
    resolver: zodResolver(dreamSchema),
    defaultValues: initialData || {
      title: "",
      date: new Date().toISOString().split('T')[0],
      location: "",
      people: "",
      time_of_day: "Unknown",
      activity: "",
      unusual_events: {
        occurred: false,
        description: ""
      },
      symbols: "",
      emotion: "Peaceful",
      kategori_mimpi: "Random Dream",
      keadaan_mimpi: "Character in Dream",
      jenis_mimpi: "Normal Dream",
      ending: null,
      final_moments: "",
      summary: ""
    }
  })

  const onSubmit = async (data: DreamFormData) => {
    try {
      setIsSubmitting(true)
      if (isEditing && initialData) {
        await updateDream(initialData.id, data)
        toast.success(translations[language].success.update)
        router.push(`/dream/${initialData.id}`)
      } else {
        const newDream = await createDream(data)
        toast.success(translations[language].success.create)
        router.push(`/dream/${newDream.id}`)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(isEditing ? translations[language].error.update : translations[language].error.create)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        setLanguage(e.newValue as 'en' | 'ms')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('storage-local', handleStorageChange as any)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storage-local', handleStorageChange as any)
    }
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].title} <span className="text-red-500">*</span>
            </label>
            <input
              {...field}
              type="text"
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title?.message && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].date} <span className="text-red-500">*</span>
            </label>
            <input
              {...field}
              type="date"
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date?.message && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].location}
            </label>
            <input
              {...field}
              type="text"
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.location?.message && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="people"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].people}
            </label>
            <input
              {...field}
              type="text"
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.people?.message && (
              <p className="text-sm text-red-500">{errors.people.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="time_of_day"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].timeOfDay}
            </label>
            <select
              {...field}
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(translations[language].timeOfDayOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.time_of_day?.message && (
              <p className="text-sm text-red-500">{errors.time_of_day.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="activity"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].activity}
            </label>
            <input
              {...field}
              type="text"
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.activity?.message && (
              <p className="text-sm text-red-500">{errors.activity.message}</p>
            )}
          </div>
        )}
      />

      <div className="space-y-3">
        <Controller
          name="unusual_events.occurred"
          control={control}
          render={({ field }) => (
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-zinc-900"
              />
              <span className="text-sm font-medium text-zinc-200">
                {translations[language].unusualEventsOccurred}
              </span>
            </label>
          )}
        />

        <Controller
          name="unusual_events.description"
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
                {translations[language].unusualEventsDescription}
              </label>
              <textarea
                {...field}
                id={field.name}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.unusual_events?.description?.message && (
                <p className="text-sm text-red-500">{errors.unusual_events.description.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <Controller
        name="symbols"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].symbols}
            </label>
            <input
              {...field}
              type="text"
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.symbols?.message && (
              <p className="text-sm text-red-500">{errors.symbols.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="emotion"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].emotion}
            </label>
            <select
              {...field}
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(translations[language].emotions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.emotion?.message && (
              <p className="text-sm text-red-500">{errors.emotion.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="kategori_mimpi"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].kategoriMimpi}
            </label>
            <select
              {...field}
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(translations[language].dreamCategories).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.kategori_mimpi?.message && (
              <p className="text-sm text-red-500">{errors.kategori_mimpi.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="keadaan_mimpi"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].keadaanMimpi}
            </label>
            <select
              {...field}
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(translations[language].dreamStates).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.keadaan_mimpi?.message && (
              <p className="text-sm text-red-500">{errors.keadaan_mimpi.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="jenis_mimpi"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].jenisMimpi}
            </label>
            <select
              {...field}
              id={field.name}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(translations[language].dreamTypes).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.jenis_mimpi?.message && (
              <p className="text-sm text-red-500">{errors.jenis_mimpi.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="ending"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].ending}
            </label>
            <select
              {...field}
              id={field.name}
              value={field.value || ''}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{translations[language].endings.select}</option>
              {Object.entries(translations[language].endings)
                .filter(([key]) => key !== 'select')
                .map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.ending?.message && (
              <p className="text-sm text-red-500">{errors.ending.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="final_moments"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].finalMoments}
            </label>
            <textarea
              {...field}
              id={field.name}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.final_moments?.message && (
              <p className="text-sm text-red-500">{errors.final_moments.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="summary"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-zinc-200">
              {translations[language].summary} <span className="text-red-500">*</span>
            </label>
            <textarea
              {...field}
              id={field.name}
              rows={4}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.summary?.message && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
            )}
          </div>
        )}
      />

      <GradientButton
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isEditing ? "Updating..." : "Creating..."}
          </>
        ) : (
          isEditing ? translations[language].update : translations[language].submit
        )}
      </GradientButton>
    </form>
  )
} 