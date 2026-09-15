import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function geocodePostal(postal) {
  try {
    const q = encodeURIComponent(`${postal}, Ontario, Canada`)
    const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${postal}&country=Canada&limit=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'AkalHomes Commercial/1.0' } })
    const data = await res.json()
    if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch(e){ console.log('geocode fail', postal) }
  return null
}

async function run() {
  const { data, error } = await supabase.from('listings').select('id, city, postal_code, address, latitude')
  if (error) throw error
  console.log(`Geocoding ${data.length} listings with TRUE postal code...`)

  for (const row of data) {
    if (row.latitude) continue // already has true location
    const postal = row.postal_code || row.address?.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i)?.[0]
    if (!postal) {
      console.log(`Skip ${row.id} - no postal code, will show carrot warning`)
      continue
    }
    const loc = await geocodePostal(postal)
    if (loc) {
      await supabase.from('listings').update({ latitude: loc.lat, longitude: loc.lng }).eq('id', row.id)
      console.log(`✓ ${row.city} ${postal} -> ${loc.lat},${loc.lng}`)
      await new Promise(r=>setTimeout(r,1100)) // respect Nominatim rate limit
    }
  }
  console.log('Done - true locations!')
}
run()
