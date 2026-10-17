"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Building2, CheckCircle2, Mail, MapPin, Phone, Share2 } from "lucide-react"
import { getListingById } from "@/lib/db"

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    getListingById(String(id)).then((data) => {
      setListing(data)
      setLoading(false)
    })
  }, [id])

  const shareListing = async () => {
    try {
      if (navigator.share) await navigator.share({ title: listing?.title || "Commercial listing", url: window.location.href })
      else await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Sharing can be cancelled by the user; no error UI is needed.
    }
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 p-6"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-8 w-32 rounded bg-zinc-200" /><div className="mt-6 h-80 rounded-3xl bg-zinc-200" /></div></main>

  if (!listing) return <main className="grid min-h-screen place-items-center bg-zinc-50 p-6"><div className="text-center"><Building2 className="mx-auto h-10 w-10 text-zinc-300" /><h1 className="mt-4 text-xl font-semibold">Listing not found</h1><p className="mt-1 text-sm text-zinc-500">This property may have been removed or is not publicly available.</p><button onClick={() => router.push("/marketplace")} className="mt-5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white">Browse marketplace</button></div></main>

  const image = listing.images?.[0] || "/demo/office_space_blueprint_card.jpg"
  const contact = listing.contact || listing.email || "Listing contact"
  const price = typeof listing.price === "number" ? `$${listing.price.toLocaleString()}` : listing.price

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"><ArrowLeft className="h-4 w-4" /> Back</button>
          <div className="flex items-center gap-2 font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6A00] font-black text-white">A</span>AkalHomes</div>
          <button onClick={shareListing} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium hover:bg-zinc-100"><Share2 className="h-3.5 w-3.5" />{copied ? "Copied" : "Share"}</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="h-72 bg-zinc-100 md:h-[460px]"><img src={image} alt={listing.title || "Commercial property"} className="h-full w-full object-cover" /></div>
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_320px] md:p-10">
            <section>
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold">{listing.type || listing.category || "Commercial"}</span><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Public listing</span></div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{listing.title || "Commercial property"}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500"><MapPin className="h-4 w-4" />{listing.address || listing.city || "Location available on request"}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-zinc-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Price</p><p className="mt-1 font-semibold">{price || "Contact for price"}</p></div><div className="rounded-2xl bg-zinc-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">City</p><p className="mt-1 font-semibold">{listing.city || "—"}</p></div><div className="rounded-2xl bg-zinc-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Property type</p><p className="mt-1 font-semibold">{listing.category || listing.type || "Commercial"}</p></div></div>
              <div className="mt-8"><h2 className="text-lg font-semibold">About this property</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-600">{listing.description || "Commercial space available through the AkalHomes marketplace. Contact the listing representative for availability, permitted use, lease terms and additional property information."}</p></div>
            </section>
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 md:sticky md:top-24"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Listing contact</p><p className="mt-2 text-lg font-semibold">{contact}</p><button onClick={() => window.location.href = `mailto:${listing.email || ""}?subject=${encodeURIComponent(`Inquiry about ${listing.title || "commercial listing"}`)}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-black"><Mail className="h-4 w-4" /> Email listing</button>{listing.phone && <a href={`tel:${listing.phone}`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium hover:bg-zinc-50"><Phone className="h-4 w-4" /> Call</a>}<p className="mt-4 text-[11px] leading-5 text-zinc-400">Confirm availability, pricing, zoning and lease terms directly with the listing contact before making decisions.</p></aside>
          </div>
        </div>
      </div>
    </main>
  )
}
