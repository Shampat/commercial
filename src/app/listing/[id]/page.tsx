"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getListingById, deleteListing } from "@/lib/db"
import { MapPin, ArrowLeft } from "lucide-react"

export default function ListingDetail(){
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ if(id){ getListingById(id as string).then(d=>{ setListing(d); setLoading(false) }) } },[id])

  const handleDelete = async () => {
    if(!listing) return
    const ok = confirm("Delete " + listing.title + "?")
    if(!ok) return
    try {
      await deleteListing(listing.id.toString())
      alert("Deleted!")
      router.push("/")
    } catch(e){ alert("Delete failed") }
  }

  if(loading) return <div className="p-10 text-center">Loading {String(id)}...</div>
  if(!listing) return <div className="p-10 text-center">Not found <button onClick={()=>router.push("/")} className="underline">Home</button></div>

  return (
    <div className="min-h-screen bg-white">
      <header className="h- border-b flex items-center px-6 gap-3">
        <button onClick={()=>router.push("/")} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"><ArrowLeft className="w-4 h-4"/></button>
        <div className="w-8 h-8 bg-[#FF6A00] rounded-lg flex items-center justify-center text-white font-black">A</div>
        <span className="font-semibold">AkalHomes • {listing.id}</span>
      </header>
      <div className="max-w- mx-auto p-6 grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded- overflow-hidden border bg-zinc-100">
            <img src={listing.images?.[0] || "/demo/office_space_blueprint_card.jpg"} className="w-full h- object-cover" alt="" />
          </div>
        </div>
        <div>
          <h1 className="text- font-bold mt-3">{listing.title}</h1>
          <div className="flex items-center gap-1 text-zinc-500 text- mt-2"><MapPin className="w-4 h-4"/> {listing.address || listing.city}</div>
          <div className="text- font-black mt-4">{String(listing.price).slice(0,50)}</div>
          <p className="mt-6 text-[13.5px] text-zinc-600">{listing.description || "Premium commercial space"}</p>
          <button onClick={()=>router.push("/")} className="w-full mt-6 h-11 rounded-full bg-zinc-900 text-white">Back</button>
          <button onClick={handleDelete} className="w-full mt-3 h-11 rounded-full bg-red-600 text-white font-medium">Delete Listing</button>
        </div>
      </div>
    </div>
  )
}
