"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/db"

export default function MyListingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/auth")
      else setEmail(data.user.email ?? null)
      setLoading(false)
    })
  }, [router])

  if (loading) return <main className="min-h-screen bg-zinc-50 p-8 text-zinc-500">Loading your listings…</main>

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
          <Link href="/account" className="text-sm font-medium text-zinc-600">← Account</Link>
          <Link href="/marketplace" className="font-semibold tracking-tight">WorldwideCRE</Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">Private workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">My listings</h1>
            <p className="mt-2 text-zinc-600">Only your account should manage its listings. Signed in as {email}.</p>
          </div>
          <Link href="/listings/new" className="rounded-full bg-[#FF6A00] px-5 py-3 text-center text-sm font-semibold text-white">List a property</Link>
        </div>

        <section className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">Owner data connection is the next database step.</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">The account layer is now in place, but I am not pretending the existing listings table has an owner column. Before this screen reads or changes private listings, the live Supabase schema must be verified and the owner_id + RLS rules added against the real table.</p>
        </section>

        <div className="mt-5 rounded-2xl bg-zinc-100 px-4 py-3 text-xs leading-5 text-zinc-600">Security rule: ownership will be enforced in Supabase with auth.uid(), not just hidden in the interface. That prevents one signed-in user from managing another user's property by changing an ID in the browser.</div>
      </div>
    </main>
  )
}
