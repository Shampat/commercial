"use client"

import { useEffect, useState } from "react"
import { ArrowRight, LogOut, Plus, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth"

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null)
      setLoading(false)
    })
  }, [])

  async function signOut() {
    await authClient.auth.signOut()
    window.location.href = "/marketplace"
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 p-8" />

  if (!email) {
    return <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4"><div className="text-center"><h1 className="text-2xl font-semibold">Sign in to manage your listings</h1><p className="mt-2 text-sm text-zinc-500">Your property management tools are tied to your account.</p><a href="/auth" className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Sign in <ArrowRight className="h-4 w-4" /></a></div></main>
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8"><a href="/marketplace" className="font-semibold">AkalHomes</a><button onClick={signOut} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"><LogOut className="h-4 w-4" /> Sign out</button></div></header>
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF6A00]">Your account</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage your commercial listings.</h1><p className="mt-2 text-sm text-zinc-500">Signed in as {email}</p></div><a href="/listings/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> List a property</a></div>
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6"><div className="flex items-start gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100"><UserRound className="h-5 w-5" /></div><div><h2 className="font-semibold">Your listings</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Listings created from this account will be managed here. Ownership and edit/delete permissions will be enforced at the database level when the live listings schema is connected.</p><a href="/marketplace" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Browse public marketplace <ArrowRight className="h-4 w-4" /></a></div></div></div>
      </section>
    </main>
  )
}
