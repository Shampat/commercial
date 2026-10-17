"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/db"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/account")
    })
  }, [router])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setMessage("")

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(signInError.message)
      else router.replace("/account")
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) setError(signUpError.message)
      else if (data.session) router.replace("/account")
      else setMessage("Account created. Check your email to confirm your address, then sign in.")
    }

    setBusy(false)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section>
          <Link href="/marketplace" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">← Back to marketplace</Link>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">WorldwideCRE marketplace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Your properties. Your account. Your control.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">Create an account to list commercial property and manage the listings you own. Public visitors only see listings you choose to publish.</p>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm md:p-8">
          <div className="flex rounded-xl bg-zinc-100 p-1 text-sm font-medium">
            <button type="button" onClick={() => setMode("signin")} className={`flex-1 rounded-lg px-4 py-2.5 ${mode === "signin" ? "bg-white shadow-sm" : "text-zinc-500"}`}>Sign in</button>
            <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-lg px-4 py-2.5 ${mode === "signup" ? "bg-white shadow-sm" : "text-zinc-500"}`}>Create account</button>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-medium">Email</span><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 outline-none focus:border-zinc-400" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">Password</span><input required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 outline-none focus:border-zinc-400" /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">{message}</p>}
            <button disabled={busy} className="w-full rounded-full bg-[#FF6A00] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
          </form>

          <p className="mt-5 text-xs leading-5 text-zinc-500">By creating an account, you agree to manage your own listings responsibly and follow the marketplace rules.</p>
        </section>
      </div>
    </main>
  )
}
