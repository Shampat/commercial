"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Building2, List, MapPin, Search } from "lucide-react"
import { getListings } from "@/lib/db"

type Listing = { id: string; title?: string; address?: string; city?: string; price?: string | number; type?: string; category?: string; images?: string[]; latitude?: number; longitude?: number; lat?: number; lng?: number }

const CITIES = ["All Cities", "Brampton", "Mississauga", "Caledon", "Vaughan", "Etobicoke", "Oakville", "Toronto", "Milton", "Bolton", "Georgetown"]

export default function MarketplaceMapPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("All Cities")
  const [selected, setSelected] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { getListings().then((data) => setListings(data as Listing[])).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings.filter((item) => {
      const text = [item.title, item.address, item.city, item.category, item.type].filter(Boolean).join(" ").toLowerCase()
      return (!q || text.includes(q)) && (city === "All Cities" || item.city === city)
    })
  }, [listings, query, city])

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-6"><a href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"><ArrowLeft className="h-4 w-4" /> Marketplace</a><div className="flex items-center gap-2 font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6A00] font-black text-white">A</span>AkalHomes</div><a href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium"><List className="h-3.5 w-3.5" /> List view</a></div></header>
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[1500px] flex-col md:flex-row">
        <aside className="w-full overflow-y-auto border-b border-zinc-200 bg-white md:w-[390px] md:border-b-0 md:border-r"><div className="p-4"><h1 className="text-xl font-semibold">Commercial properties</h1><p className="mt-1 text-xs text-zinc-500">Browse available marketplace inventory geographically.</p><label className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3"><Search className="h-4 w-4 text-zinc-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search properties..." className="w-full text-sm outline-none" /></label><select value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none">{CITIES.map((item) => <option key={item}>{item}</option>)}</select></div><div className="border-t border-zinc-100">{loading ? <p className="p-5 text-sm text-zinc-500">Loading properties...</p> : filtered.length === 0 ? <p className="p-5 text-sm text-zinc-500">No properties match your search.</p> : filtered.map((item) => <button key={item.id} onClick={() => setSelected(item)} className={`w-full border-b border-zinc-100 p-4 text-left hover:bg-zinc-50 ${selected?.id === item.id ? "bg-orange-50" : ""}`}><div className="flex gap-3"><div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">{item.images?.[0] ? <img src={item.images[0]} alt="" className="h-full w-full object-cover" /> : <Building2 className="m-5 h-6 w-6 text-zinc-300" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title || "Commercial property"}</p><p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3 w-3" />{item.address || item.city || "Location available on request"}</p>{item.price && <p className="mt-1 text-xs font-semibold">{typeof item.price === "number" ? `$${item.price.toLocaleString()}` : item.price}</p>}</div></div></button>)}</div></aside>
        <section className="relative min-h-[520px] flex-1 overflow-hidden bg-[#e8e5df]"><div className="absolute inset-0 opacity-50" style={{backgroundImage:"linear-gradient(#ffffff 1px,transparent 1px),linear-gradient(90deg,#ffffff 1px,transparent 1px)",backgroundSize:"48px 48px"}} /><div className="absolute inset-0 flex items-center justify-center p-8"><div className="max-w-lg rounded-3xl border border-white/80 bg-white/90 p-7 text-center shadow-xl backdrop-blur"><MapPin className="mx-auto h-10 w-10 text-[#FF6A00]" /><h2 className="mt-4 text-xl font-semibold">Property map</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Map coordinates are shown when a listing provides latitude and longitude. Current marketplace records do not expose verified coordinates through the public view, so this map avoids inventing property locations.</p><p className="mt-4 text-xs text-zinc-400">{filtered.length} matching {filtered.length === 1 ? "property" : "properties"}</p></div></div>{selected && <div className="absolute bottom-5 left-5 right-5 max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl md:left-auto md:right-5"><button onClick={() => setSelected(null)} className="absolute right-3 top-3 text-zinc-400">×</button><p className="pr-5 text-sm font-semibold">{selected.title || "Commercial property"}</p><p className="mt-1 text-xs text-zinc-500">{selected.address || selected.city || "Location available on request"}</p><a href={`/listing/${selected.id}`} className="mt-3 block rounded-xl bg-zinc-950 px-4 py-2.5 text-center text-xs font-medium text-white">View listing</a></div>}</section>
      </div>
    </main>
  )
}
