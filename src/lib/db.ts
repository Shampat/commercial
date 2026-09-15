import { createClient } from '@supabase/supabase-js'
import { BRAND } from '@/config/brand'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getListings() {
  const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function getListingById(id: string) {
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) throw error
}

export async function addListing(listing: any) {
  const payload = {...listing, is_demo: false }
  const { data, error } = await supabase.from('listings').insert(payload).select().single()
  if (error) throw error
  const { count: total } = await supabase.from('listings').select('*', { count: 'exact', head: true })
  if ((total || 0) > BRAND.maxDemoCapacity) {
    const { data: oldest } = await supabase.from('listings').select('id').eq('is_demo', true).order('created_at', { ascending: true }).limit(1)
    if (oldest?.[0]) {
      await supabase.from('listings').delete().eq('id', oldest[0].id)
    }
  }
  return data
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) throw error
}
