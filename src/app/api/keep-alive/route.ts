import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  // simple query = counts as activity for Supabase
  const { data, error } = await supabase.from('properties').select('id').limit(1)
  return NextResponse.json({ 
    ok: true, 
    active: true, 
    time: new Date().toISOString(),
    supabase_ok: !error
  })
}
