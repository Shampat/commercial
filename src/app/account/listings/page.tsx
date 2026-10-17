"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteOwnedListing, getMyListings, publishOwnedListing, supabase, unpublishOwnedListing } from "@/lib/db"

type Listing = { id: string; title?: string; city?: string; category?: string; type?: string; price?: string | number; status?: string }

export default function MyListingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function load() {
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.replace("/auth"); return }
      setEmail(data.user.email ?? null)
      setListings((await getMyListings()) as Listing[])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your listings.")
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [router])

  async function togglePublish(listing: Listing) {
    setBusyId(listing.id); setError("")
    try {
      if (listing.status === "ACTIVE") await unpublishOwnedListing(listing.id)
      else await publishOwnedListing(listing.id)
      await load()
    } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Unable to update listing.") }
    finally { setBusyId(null) }
  }

  async function remove(listing: Listing) {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return
    setBusyId(listing.id); setError("")
    try { await deleteOwnedListing(listing.id); await load() }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Unable to delete listing.") }
    finally { setBusyId(null) }
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 p-8 text-zinc-500">Loading your listings…</main>

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8"><Link href="/account" className="text-sm font-medium text-zinc-600">← Account</Link><Link href="/marketplace" className="font-semibold tracking-tight">WorldwideCRE</Link></div></header>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">Private workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My listings</h1><p className="mt-2 text-zinc-600">Only your account can manage these listings. Signed in as {email}.</p></div><Link href="/listings/new" className="rounded-full bg-[#FF6A00] px-5 py-3 text-center text-sm font-semibold text-white">List a property</Link></div>
        {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {listings.length === 0 ? <section className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center"><h2 className="text-lg font-semibold">You have no listings yet.</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">Create a draft, review it, then publish it when the property information is ready.</p><Link href="/listings/new" className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white">Create your first listing</Link></section> : <div className="mt-8 space-y-4">{listings.map((listing) => { const published = listing.status === "ACTIVE"; const busy = busyId === listing.id; return <article key={listing.id} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{published ? "Published" : "Draft"}</span>{listing.category && <span className="text-xs text-zinc-400">{listing.category}</span>}</div><h2 className="mt-3 text-xl font-semibold tracking-tight">{listing.title || "Untitled listing"}</h2><p className="mt-1 text-sm text-zinc-500">{listing.city || ""}{listing.type ? ` · ${listing.type}` : ""}{listing.price ? ` · ${listing.price}` : ""}</p></div><div className="flex flex-wrap gap-2"><Link href={`/listings/${listing.id}/edit`} className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium">Edit</Link><button disabled={busy} onClick={() => void togglePublish(listing)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Saving…" : published ? "Unpublish" : "Publish"}</button><button disabled={busy} onClick={() => void remove(listing)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50">Delete</button></div></div></article> })}</div>}
        <div className="mt-6 rounded-2xl bg-zinc-100 px-4 py-3 text-xs leading-5 text-zinc-600">Ownership is enforced in Supabase with auth.uid(). The browser interface is not the security boundary.</div>
      </div>
    </main>
  )
}
