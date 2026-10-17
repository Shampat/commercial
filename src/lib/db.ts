import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

/** Public marketplace reads go through the hardened, security-invoker view. */
export async function getListings() {
  const { data, error } = await supabase
    .from('public_marketplace_listings')
    .select('*')

  if (error) {
    console.error('Unable to load public marketplace listings:', error)
    return []
  }

  return data || []
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('public_marketplace_listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Unable to load public marketplace listing:', error)
    return null
  }

  return data
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('You must be signed in to manage listings.')
  return data.user
}

/** Return only listings owned by the current authenticated account. */
export async function getMyListings() {
  await requireUser()

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/** Create a draft whose owner_id is always the current authenticated user. */
export async function createOwnedListing(listing: Record<string, unknown>) {
  const user = await requireUser()
  const payload = {
    ...listing,
    owner_id: user.id,
    status: 'draft',
    is_public: false,
    is_demo: false,
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

/** Update an existing listing; RLS independently enforces ownership. */
export async function updateOwnedListing(id: string, changes: Record<string, unknown>) {
  await requireUser()

  const { data, error } = await supabase
    .from('listings')
    .update(changes)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function publishOwnedListing(id: string) {
  return updateOwnedListing(id, { status: 'published', is_public: true })
}

export async function unpublishOwnedListing(id: string) {
  return updateOwnedListing(id, { status: 'draft', is_public: false })
}

export async function deleteOwnedListing(id: string) {
  await requireUser()

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)

  if (error) throw error
}
