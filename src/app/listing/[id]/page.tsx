"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getListingById } from "@/lib/db"
import { MapPin, ArrowLeft, ShieldCheck, Building2 } from "lucide-react"

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getListingById(id as string).then(d => { setListing(d); setLoading(false) })
    }
  }, [id])

  if (loading) return <div className="p-10 text-center">Loading {id}...</div>
  if (!listing) return <div className="p-10 text-center">Not found. <button onClick={()=>router.push('/')} className="underline">Back home</button></div>

  return (
    <div className="min-h-screen bg-white">
      <header className="h- border-b flex items-center px-6 gap-3">
        <button onClick={()=>router.push('/')} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"><ArrowLeft className="w-4 h-4"/></button>
        <div className="w-8 h-8 bg-[#FF6A00] rounded-lg flex items-center justify-center text-white font-black">A</div>
        <span className="font-semibold">AkalHomes • {listing.id}</span>
      </header>
      <div className="max-w- mx-auto p-6 grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded- overflow-hidden border bg-zinc-100">
            <img src={listing.images?.[0] || "/demo/office_space_blueprint_card.jpg"} className="w-full h- object-cover" />
          </div>
          <div className="flex gap-2 mt-3 overflow-auto">
            {(listing.images||[]).slice(0,5).map((img:string,i:number)=><img key={i} src={img} className="w-20 h-20 rounded-xl object-cover border" />)}
          </div>
        </div>
        <div>
          <span className="inline-flex text- font-bold tracking-widest bg-[#FF6A00] text-white px-3 py-1 rounded-full">{listing.sqft || listing.area || 10000} SQ FT • {listing.type}</span>
          <h1 className="text- font-bold leading-tight mt-3">{listing.title}</h1>
          <div className="flex items-center gap-1 text-zinc-500 text- mt-2"><MapPin className="w-4 h-4"/> {listing.address}, {listing.city}, {listing.province}</div>
          <div className="text- font-black mt-4">{typeof listing.price === 'number'? `$${listing.price.toLocaleString()}/mo` : listing.price}</div>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text- flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-">{listing.country} • {listing.district}</span>
          </div>
          <p className="mt-6 text-[13.5px] leading-[1.6] text-zinc-600">{listing.description || "Premium commercial space - direct owner listing. Verified • TMI Included. Contact for viewing."}</p>
          <div className="mt-6 p-4 rounded-2xl border bg-zinc-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold">OW</div>
              <div><div className="font-medium text-">{listing.contact || "Direct Owner"}</div><div className="text- text-[#FF6A00] font-bold tracking-widest">PRO</div></div>
            </div>
            <button onClick={()=>alert('Contact: ' + (listing.contact||'Owner'))} className="w-full mt-4 h-11 rounded-full bg-zinc-900 text-white font-medium">Contact Owner</button>
          </div>
        </div>
      </div>
    </div>
  )
}
