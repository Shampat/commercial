"use client"

import { CheckCircle2, Flag, ShieldCheck, UserRound } from "lucide-react"

const rules = [
  "Only list property you are authorized to advertise.",
  "Keep pricing, availability, address, property details and photos accurate and current.",
  "Comply with applicable zoning, licensing, advertising, accessibility and other legal requirements.",
  "Do not publish misleading, fraudulent, discriminatory, defamatory or unlawful content.",
  "Do not use someone else's property, identity, contact information or photos without authorization.",
  "Update or remove a listing when material information changes or the property is no longer available.",
]

export default function MarketplaceRulesPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8">
          <a href="/marketplace" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A00] font-black text-white">A</span>
            AkalHomes
          </a>
          <a href="/marketplace" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">Back to marketplace</a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF6A00]">Marketplace rules</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">List responsibly. Manage your own property.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 md:text-base">
          This marketplace is self-service. Property owners, landlords, brokers and other authorized advertisers are responsible for the listings they publish and manage.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5"><UserRound className="h-5 w-5" /><h2 className="mt-4 font-semibold">You own your listing</h2><p className="mt-2 text-sm leading-5 text-zinc-500">Your account is responsible for the property information you submit and maintain.</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5"><ShieldCheck className="h-5 w-5" /><h2 className="mt-4 font-semibold">Follow the rules</h2><p className="mt-2 text-sm leading-5 text-zinc-500">Listings must be lawful, accurate and appropriate for the commercial marketplace.</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5"><Flag className="h-5 w-5" /><h2 className="mt-4 font-semibold">Report violations</h2><p className="mt-2 text-sm leading-5 text-zinc-500">Listings that violate marketplace rules may be reported and removed.</p></div>
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-semibold">Before you publish</h2>
          <ul className="mt-5 space-y-4">
            {rules.map((rule) => <li key={rule} className="flex gap-3 text-sm leading-6 text-zinc-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6A00]" />{rule}</li>)}
          </ul>
        </section>

        <section className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold">The marketplace does not independently verify every listing</h2>
          <p className="mt-2 text-sm leading-6 text-orange-900/80">Publishing a listing does not mean the platform guarantees the property's ownership, condition, zoning, availability, pricing or legal status. Users should perform their own due diligence before entering a transaction.</p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/listings/new" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800">List a property</a>
          <a href="/marketplace" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-100">Browse marketplace</a>
        </div>
      </section>
    </main>
  )
}
