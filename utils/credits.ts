import { createClient } from '@/utils/supabase/server'

export async function updateImageGenerationUsage(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // First try to update existing record for today
  const { data: updateData, error: updateError } = await supabase
    .from('image_generation_usage')
    .upsert(
      {
        user_id: userId,
        date: today,
        count: 1
      },
      {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      }
    )

  if (updateError) {
    console.error('Error updating image generation usage:', updateError)
    throw new Error('Failed to update image generation usage')
  }

  return { success: true }
}

export async function getCurrentUsage(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('image_generation_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error getting current usage:', error)
    throw new Error('Failed to get current usage')
  }

  return data?.count || 0
}

export async function checkRemainingCredits(userId: string) {
  const DAILY_LIMIT = 4 // Set your daily limit here
  const currentUsage = await getCurrentUsage(userId)
  return {
    remaining: Math.max(0, DAILY_LIMIT - currentUsage),
    used: currentUsage
  }
} 