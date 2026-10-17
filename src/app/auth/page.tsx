"use client"

import { FormEvent, useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth"

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    authClient.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/account"
    })
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const result = mode === "signin"
      ? await authClient.auth.signInWithPassword({ email, password })
      : await authClient.auth.signUp({ email, password })

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your account, then sign in.")
      setMode("signin")
      return
    }

    window.location.href = "/account"
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 md:py-16">
      <div className="mx-auto max-w-md">
        <a href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"><ArrowLeft className="h-4 w-4" /> Back to marketplace</a>
        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A00] font-black text-white">A</div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{mode === "signin" ? "Sign in to your account" : "Create your marketplace account"}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Your account will be used to manage the commercial properties you list.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block"><span className="text-sm font-medium">Email</span><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-zinc-950" /></label>
            <label className="block"><span className="text-sm font-medium">Password</span><input required minLength={6} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-zinc-950" /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p className="flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"><CheckCircle2 className="h-5 w-5 shrink-0" />{message}</p>}
            <button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white disabled:opacity-50">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "signin" ? "Sign in" : "Create account"}</button>
          </form>

          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage("") }} className="mt-5 w-full text-center text-sm font-medium text-zinc-600 hover:text-zinc-950">
            {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  )
}
