import { createClient } from '@/utils/supabase/client'

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
  emotion: "Happy" | "Scared" | "Confused" | "Peaceful" | "Anxious" | "Excited"
  ending: string
  final_moments: string
  summary: string
  created_at?: string
  updated_at?: string
}

export async function createDream(dream: Omit<Dream, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('dreams')
    .insert([
      {
        ...dream,
        user_id: user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDreams() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
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