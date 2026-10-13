import { createClient } from '@/utils/supabase/client'

export type DreamEmotion = "Happy" | "Scared" | "Confused" | "Peaceful" | "Anxious" | "Excited"
export type DreamCategory =
  | "Daytime Carryover Dream"
  | "Random Dream"
  | "Carried Dream"
  | "Learning Dream"
  | "Receiving Dream"
  | "Message Dream"
  | "Disturbance Dream"
  | "Blank Dream"
export type DreamState = "Watching a Screen" | "Character in Dream" | "Both Watching and Being a Character"
export type DreamType = "Normal Dream" | "Aware but Can't Control" | "Lucid Dream" | "Liminal Dream" | "Vivid Dream"

export interface Dream {
  id: string
  user_id: string
  title: string
  date: string
  location: string
  people: string
  time_of_day: "Morning" | "Afternoon" | "Night" | "Unknown"
  activity: string
  unusual_events: {
    occurred: boolean
    description: string
  }
  symbols: string
  emotion: DreamEmotion
  kategori_mimpi: DreamCategory
  keadaan_mimpi: DreamState
  jenis_mimpi: DreamType
  ending: "abruptly" | "slowly" | null
  final_moments: string
  summary: string
  created_at: string
  updated_at: string
}

export interface DreamListItem {
  id: string
  title: string
  date: string
  location: string
  people: string
  emotion: DreamEmotion
  kategori_mimpi: DreamCategory
  keadaan_mimpi: DreamState
  jenis_mimpi: DreamType
  summary: string
  created_at: string
}

export interface DreamListFilters {
  emotion?: DreamEmotion | null
  kategoriMimpi?: DreamCategory | null
  keadaanMimpi?: DreamState | null
  jenisMimpi?: DreamType | null
}

const dreamListColumns =
  "id, title, date, location, people, emotion, kategori_mimpi, keadaan_mimpi, jenis_mimpi, summary, created_at"

const emotionEnumByKey = {
  happy: "Happy",
  excited: "Excited",
  scared: "Scared",
  anxious: "Anxious",
  confused: "Confused",
  peaceful: "Peaceful",
} as const satisfies Record<string, DreamEmotion>

export function toDreamEmotion(value: string | null): DreamEmotion | null {
  if (!value) return null
  const match = emotionEnumByKey[value.toLowerCase() as keyof typeof emotionEnumByKey]
  return match ?? null
}

export async function createDream(dream: Omit<Dream, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Dream> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  console.log('Creating dream with data:', dream)

  const { data, error } = await supabase
    .from('dreams')
    .insert([
      {
        user_id: user.id,
        title: dream.title,
        date: dream.date,
        location: dream.location,
        people: dream.people,
        time_of_day: dream.time_of_day,
        activity: dream.activity,
        unusual_events: dream.unusual_events,
        symbols: dream.symbols,
        emotion: dream.emotion,
        kategori_mimpi: dream.kategori_mimpi,
        keadaan_mimpi: dream.keadaan_mimpi,
        jenis_mimpi: dream.jenis_mimpi,
        ending: dream.ending || null,
        final_moments: dream.final_moments,
        summary: dream.summary,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    throw error
  }
  if (!data) throw new Error('Failed to create dream')

  return data
}

export async function getDreams(filters: DreamListFilters = {}): Promise<DreamListItem[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('dreams')
    .select(dreamListColumns)
    .eq('user_id', user.id)

  if (filters.emotion) query = query.eq('emotion', filters.emotion)
  if (filters.kategoriMimpi) query = query.eq('kategori_mimpi', filters.kategoriMimpi)
  if (filters.keadaanMimpi) query = query.eq('keadaan_mimpi', filters.keadaanMimpi)
  if (filters.jenisMimpi) query = query.eq('jenis_mimpi', filters.jenisMimpi)

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as DreamListItem[]
}

export async function getAllDreams(): Promise<Dream[]> {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function getDreamCount() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { count, error } = await supabase
    .from('dreams')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) throw error
  return count || 0
}

export async function getDreamById(id: string) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function updateDream(id: string, dream: Partial<Omit<Dream, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('dreams')
    .update(dream)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDream(id: string) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  return true
}

export async function deleteAllDreams() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('user_id', user.id)

  if (error) throw error
  return true
} 