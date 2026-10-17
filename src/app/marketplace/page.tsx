"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, MapPin, Search, SlidersHorizontal, X } from "lucide-react"
import { getListings } from "@/lib/db"

type Listing = {
  id: string
  title?: string
  address?: string
  city?: string
  price?: string | number
  type?: string
  category?: string
  images?: string[]
}

const CATEGORIES = ["All", "Office", "Retail", "Industrial", "Warehouse", "Medical Office", "Restaurant", "Plaza"]
const LEASE_TYPES = ["All", "For Lease", "For Sale", "For Sublease", "Assignment"]
const CITIES = ["All Cities", "Brampton", "Mississauga", "Caledon", "Vaughan", "Etobicoke", "Oakville", "Toronto", "Milton", "Bolton", "Georgetown"]

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [leaseType, setLeaseType] = useState("All")
  const [city, setCity] = useState("All Cities")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getListings().then((data) => setListings(data as Listing[])).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return listings.filter((listing) => {
      const text = [listing.title, listing.address, listing.city, listing.category, listing.type].filter(Boolean).join(" ").toLowerCase()
      const matchesQuery = !normalized || text.includes(normalized)
      const matchesCategory = category === "All" || listing.category === category || listing.type === category
      const matchesLease = leaseType === "All" || listing.type === leaseType
      const matchesCity = city === "All Cities" || listing.city === city
      return matchesQuery && matchesCategory && matchesLease && matchesCity
    })
  }, [listings, query, category, leaseType, city])

  const activeFilters = [
    category !== "All" ? category : null,
    leaseType !== "All" ? leaseType : null,
    city !== "All Cities" ? city : null,
  ].filter(Boolean) as string[]

  const clearFilters = () => {
    setQuery("")
    setCategory("All")
    setLeaseType("All")
    setCity("All Cities")
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A00] font-black text-white">A</span>
            AkalHomes
          </a>
          <a href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">Back to home</a>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF6A00]">Worldwide commercial marketplace</p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Find the right commercial space.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 md:text-base">Search verified marketplace inventory by property type, city and transaction type.</p>

          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 md:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4">
              <Search className="h-5 w-5 text-zinc-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search address, city, property type..." className="w-full bg-transparent text-sm outline-none" aria-label="Search commercial listings" />
              {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X className="h-4 w-4 text-zinc-400" /></button>}
            </label>
            <button onClick={() => setShowFilters(!showFilters)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium hover:bg-zinc-100 md:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilters.length ? `(${activeFilters.length})` : ""}
            </button>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="hidden min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none md:block">
              {CITIES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={leaseType} onChange={(e) => setLeaseType(e.target.value)} className="hidden min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none md:block">
              {LEASE_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className={`${showFilters ? "flex" : "hidden"} mt-3 flex-wrap gap-2 md:flex`}>
            {CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full border px-3.5 py-2 text-xs font-medium ${category === item ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{item}</button>)}
          </div>
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((item) => <span key={item} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">{item}</span>)}
              <button onClick={clearFilters} className="text-xs font-medium text-zinc-500 underline underline-offset-2">Clear all</button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold">{loading ? "Loading listings..." : `${filtered.length} listings`}</p><p className="mt-1 text-xs text-zinc-500">Public marketplace inventory</p></div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="h-72 animate-pulse rounded-2xl bg-zinc-200" /><div className="h-72 animate-pulse rounded-2xl bg-zinc-200" /><div className="h-72 animate-pulse rounded-2xl bg-zinc-200" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center"><Building2 className="mx-auto h-8 w-8 text-zinc-300" /><h2 className="mt-4 font-semibold">No matching spaces</h2><p className="mt-1 text-sm text-zinc-500">Try a different city, property type or search term.</p><button onClick={clearFilters} className="mt-5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white">Clear filters</button></div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-44 items-center justify-center bg-zinc-100">
                  {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title || "Commercial property"} className="h-full w-full object-cover" /> : <Building2 className="h-10 w-10 text-zinc-300" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">{listing.type || listing.category || "Commercial"}</span>{listing.price && <span className="text-sm font-semibold">{typeof listing.price === "number" ? `$${listing.price.toLocaleString()}` : listing.price}</span>}</div>
                  <h2 className="mt-3 line-clamp-2 font-semibold leading-6">{listing.title || "Commercial property"}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><MapPin className="h-3.5 w-3.5" />{listing.address || listing.city || "Location available on request"}</p>
                  <a href={`/listing/${listing.id}`} className="mt-5 block rounded-xl bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-white hover:bg-black">View listing</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
