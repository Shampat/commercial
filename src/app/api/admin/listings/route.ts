import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
)

export async function POST(request: Request) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey || adminEmails.size === 0) {
    return NextResponse.json(
      { error: 'Admin listing workflow is not configured on this deployment.' },
      { status: 503 },
    )
  }

  const authorization = request.headers.get('authorization')
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null

  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userError } = await authClient.auth.getUser(token)

  if (userError || !userData.user?.email || !adminEmails.has(userData.user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const body = await request.json()
  const listing = {
    title: String(body.title || '').trim(),
    address: String(body.address || '').trim(),
    city: String(body.city || '').trim(),
    type: String(body.type || 'For Lease').trim(),
    price: body.price === '' || body.price == null ? null : Number(body.price),
    description: String(body.description || '').trim(),
    contact: String(body.contact || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    images: Array.isArray(body.images)
      ? body.images.map((image: unknown) => String(image).trim()).filter(Boolean)
      : [],
    is_demo: false,
  }

  if (!listing.title || !listing.city || !listing.address) {
    return NextResponse.json(
      { error: 'Title, address, and city are required.' },
      { status: 400 },
    )
  }

  if (listing.price !== null && !Number.isFinite(listing.price)) {
    return NextResponse.json({ error: 'Price must be a valid number.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await adminClient.from('listings').insert(listing).select().single()

  if (error) {
    console.error('Admin listing creation failed:', error)
    return NextResponse.json({ error: 'Unable to create listing.' }, { status: 500 })
  }

  return NextResponse.json({ listing: data }, { status: 201 })
}
