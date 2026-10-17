"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getMyListings, updateOwnedListing, supabase } from "@/lib/db"

export default function EditListingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ title: "", category: "", type: "", address: "", city: "", price: "", description: "" })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.replace("/auth"); return }
      try {
        const listings = (await getMyListings()) as Array<Record<string, unknown>>
        const listing = listings.find((item) => String(item.id) === params.id)
        if (!listing) { router.replace("/account/listings"); return }
        setForm({
          title: String(listing.title ?? ""), category: String(listing.category ?? ""), type: String(listing.type ?? ""),
          address: String(listing.address ?? ""), city: String(listing.city ?? ""), price: String(listing.price ?? ""), description: String(listing.description ?? ""),
        })
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load this listing.") }
      finally { setLoading(false) }
    }
    void load()
  }, [params.id, router])

  function change(name: keyof typeof form, value: string) { setForm((current) => ({ ...current, [name]: value })) }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("")
    try { await updateOwnedListing(params.id, form); router.replace("/account/listings") }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save changes."); setSaving(false) }
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 p-8 text-zinc-500">Loading listing…</main>

  return <main className="min-h-screen bg-zinc-50 text-zinc-900"><header className="border-b border-zinc-200 bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 md:px-8"><Link href="/account/listings" className="text-sm font-medium text-zinc-600">← My listings</Link><span className="font-semibold">Edit listing</span></div></header><div className="mx-auto max-w-3xl px-4 py-10 md:px-8"><form onSubmit={submit} className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8"><div><h1 className="text-2xl font-semibold tracking-tight">Edit your listing</h1><p className="mt-2 text-sm text-zinc-500">Changes apply only to the listing owned by your account.</p></div><div className="grid gap-4 md:grid-cols-2">{([['title','Title'],['category','Category'],['type','Listing type'],['address','Address'],['city','City'],['price','Price']] as const).map(([name,label]) => <label key={name}><span className="mb-1.5 block text-sm font-medium">{label}</span><input value={form[name]} onChange={(e) => change(name,e.target.value)} required className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 outline-none focus:border-zinc-400" /></label>)}<label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium">Description</span><textarea value={form.description} onChange={(e) => change('description',e.target.value)} required rows={8} className="w-full resize-y rounded-xl border border-zinc-200 px-3.5 py-3 outline-none focus:border-zinc-400" /></label></div>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3"><Link href="/account/listings" className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium">Cancel</Link><button disabled={saving} className="rounded-full bg-[#FF6A00] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button></div></form></div></main>
}
