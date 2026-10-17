"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, CircleAlert, Plus, X } from "lucide-react"

const CATEGORIES = ["Office", "Retail", "Industrial", "Warehouse", "Medical Office", "Restaurant", "Plaza"]
const LISTING_TYPES = ["For Lease", "For Sale", "For Sublease", "Assignment"]

export default function NewListingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")

  function addImage() {
    const value = imageUrl.trim()
    if (!value) return
    setImages((current) => [...current, value])
    setImageUrl("")
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // The submission contract is intentionally user-owned. Server persistence
    // will be connected after the live Supabase listings schema/RLS is verified.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm md:p-12">
          <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-600" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Listing submission</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your listing is ready to publish.</h1>
          <p className="mt-4 leading-7 text-zinc-600">
            You remain responsible for the accuracy and legality of the information you submit. The marketplace provides the platform and applies its listing rules; it does not certify the property, pricing, zoning, ownership, or availability.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace" className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white">Browse marketplace</Link>
            <Link href="/" className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium">Back home</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> Marketplace
          </Link>
          <span className="font-semibold tracking-tight">List a commercial property</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">Self-service marketplace</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Put your space in front of commercial users.</h1>
          <p className="mt-3 text-zinc-600">Owners, landlords, brokers and authorized representatives can submit their own listings.</p>
        </div>

        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Property details</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2"><span className="label">Listing title</span><input required name="title" placeholder="10,000 SF industrial unit — Brampton" className="field" /></label>
                <label><span className="label">Category</span><select required name="category" className="field"><option value="">Select category</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span className="label">Listing type</span><select required name="type" className="field"><option value="">Select type</option>{LISTING_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="md:col-span-2"><span className="label">Address</span><input required name="address" placeholder="Street address" className="field" /></label>
                <label><span className="label">City</span><input required name="city" placeholder="Brampton" className="field" /></label>
                <label><span className="label">Price</span><input required name="price" placeholder="$18,500 / month" className="field" /></label>
                <label className="md:col-span-2"><span className="label">Description</span><textarea required name="description" rows={7} placeholder="Describe the space, permitted uses, size, access, parking and other material details." className="field resize-y" /></label>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Photos</h2>
              <p className="mt-1 text-sm text-zinc-500">Add public image URLs for now. Upload storage can be connected once the production storage policy is confirmed.</p>
              <div className="mt-4 flex gap-2">
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="field" />
                <button type="button" onClick={addImage} className="shrink-0 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white"><Plus className="h-4 w-4" /></button>
              </div>
              {images.length > 0 && <div className="mt-4 space-y-2">{images.map((image, index) => <div key={`${image}-${index}`} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm"><span className="truncate">{image}</span><button type="button" onClick={() => removeImage(index)}><X className="h-4 w-4" /></button></div>)}</div>}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Your responsibility</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                <li>• You must have authority to advertise the property.</li>
                <li>• Information, pricing, photos and availability must be accurate.</li>
                <li>• You are responsible for applicable zoning, licensing and legal requirements.</li>
                <li>• Do not post misleading, fraudulent, discriminatory or unlawful content.</li>
                <li>• Update or remove a listing when material information changes.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6">
              <div className="flex gap-3"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6A00]" /><p className="text-sm leading-6 text-zinc-700">The marketplace does not independently verify every listing. Listings may be reported and removed when they violate the platform rules.</p></div>
            </div>

            <label className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-6 shadow-sm"><input required type="checkbox" className="mt-1" /> <span>I confirm that I am authorized to submit this listing and agree to the marketplace listing rules.</span></label>
            <button type="submit" className="w-full rounded-full bg-[#FF6A00] px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:brightness-95">Submit listing</button>
          </aside>
        </form>
      </div>

      <style jsx>{`.label{display:block;font-size:.8rem;font-weight:600;margin-bottom:.45rem;color:#52525b}.field{width:100%;border:1px solid #e4e4e7;border-radius:.85rem;background:#fff;padding:.75rem .9rem;font-size:.9rem;outline:none}.field:focus{border-color:#a1a1aa;box-shadow:0 0 0 3px rgba(161,161,170,.12)}`}</style>
    </main>
  )
}
