import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.from('listings').select('id').limit(1)
  return NextResponse.json({ 
    ok: true, 
    active: true, 
    time: new Date().toISOString(),
    supabase_ok: !error,
    table: 'listings'
  })
}
