"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/db"

export default function AccountPage() {
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

  async function signOut() {
    await supabase.auth.signOut()
    router.replace("/marketplace")
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 p-8 text-zinc-500">Loading account…</main>

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
          <Link href="/marketplace" className="font-semibold tracking-tight">WorldwideCRE</Link>
          <button onClick={signOut} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage your marketplace activity.</h1>
        <p className="mt-2 text-zinc-600">Signed in as {email}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link href="/account/listings" className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300">
            <p className="text-sm font-semibold">My listings</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">View and manage the commercial properties associated with your account.</p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#FF6A00]">Open my listings →</span>
          </Link>
          <Link href="/listings/new" className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300">
            <p className="text-sm font-semibold">List a property</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Create a self-service listing and accept responsibility for its accuracy.</p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#FF6A00]">Create listing →</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
