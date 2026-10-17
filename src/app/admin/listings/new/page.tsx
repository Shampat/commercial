"use client"

import { FormEvent, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Building2, CheckCircle2, Loader2, LockKeyhole } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const initialForm = {
  title: '',
  address: '',
  city: '',
  type: 'For Lease',
  price: '',
  contact: '',
  email: '',
  phone: '',
  images: '',
  description: '',
}

export default function NewListingPage() {
  const [form, setForm] = useState(initialForm)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
    } else {
      setSignedIn(true)
    }
    setLoading(false)
  }

  async function submitListing(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setSignedIn(false)
      setError('Your admin session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const response = await fetch('/api/admin/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: form.price,
        images: form.images.split('\n').map((value) => value.trim()).filter(Boolean),
      }),
    })
    const result = await response.json()

    if (!response.ok) {
      setError(result.error || 'Unable to create listing.')
    } else {
      setMessage(`Listing created: ${result.listing?.title || form.title}`)
      setForm(initialForm)
    }
    setLoading(false)
  }

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
        <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6A00] text-white">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">AkalHomes</p>
              <h1 className="text-xl font-semibold">Admin listing access</h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-6 text-zinc-500">
            Sign in with an approved admin account to create a commercial listing.
          </p>
          <form onSubmit={signIn} className="space-y-4">
            <Field label="Admin email" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required />
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
          <a href="/" className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF6A00]">Commercial marketplace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Create a listing</h1>
            <p className="mt-2 text-sm text-zinc-500">Only approved admin accounts can publish inventory.</p>
          </div>
          <a href="/marketplace" className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium md:flex">
            <ArrowLeft className="h-4 w-4" /> Marketplace
          </a>
        </div>

        <form onSubmit={submitListing} className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#FF6A00]" />
              <h2 className="font-semibold">Property details</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Listing title" value={form.title} onChange={(v) => update('title', v)} required />
              <Field label="Address" value={form.address} onChange={(v) => update('address', v)} required />
              <Field label="City" value={form.city} onChange={(v) => update('city', v)} required />
              <label className="block text-sm font-medium">
                Lease type
                <select value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-500">
                  <option>For Lease</option>
                  <option>For Sale</option>
                  <option>For Sublease</option>
                  <option>Assignment</option>
                </select>
              </label>
              <Field label="Price" type="number" value={form.price} onChange={(v) => update('price', v)} />
              <Field label="Contact name" value={form.contact} onChange={(v) => update('contact', v)} />
              <Field label="Contact email" type="email" value={form.email} onChange={(v) => update('email', v)} />
              <Field label="Contact phone" value={form.phone} onChange={(v) => update('phone', v)} />
            </div>
            <label className="mt-4 block text-sm font-medium">
              Description
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={5} className="mt-2 w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-zinc-500" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Image URLs <span className="font-normal text-zinc-400">(one per line)</span>
              <textarea value={form.images} onChange={(e) => update('images', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-zinc-500" />
            </label>
          </section>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {message}</p>}

          <div className="flex justify-end">
            <button disabled={loading} className="flex h-12 items-center gap-2 rounded-xl bg-[#FF6A00] px-6 text-sm font-bold text-white shadow-sm disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish listing
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium">
      {label}{required && <span className="text-[#FF6A00]"> *</span>}
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-500" />
    </label>
  )
}
