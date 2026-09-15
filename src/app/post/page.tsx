"use client"
import { useState } from "react"
import { addListing, supabase } from "@/lib/db"

export default function PostPage() {
  const [title, setTitle] = useState("10,000 Sq Ft Premium Office")
  const [city, setCity] = useState("Brampton")
  const [country, setCountry] = useState("Canada")
  const [state, setState] = useState("Ontario")
  const [district, setDistrict] = useState("Peel")
  const [village_area, setVillage] = useState("")
  const [land_subtype, setLandSubtype] = useState("Commercial Land")
  const [currency, setCurrency] = useState("CAD")
  const formData = {country, state, province: state, district, village_area, land_subtype, currency}

  const [price, setPrice] = useState("18500")
  const [type, setType] = useState("Office")
  const [address, setAddress] = useState("50 Sunny Meadow Blvd, Brampton")
  const [sqft, setSqft] = useState("10000")
  const [files, setFiles] = useState<FileList | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fl = e.target.files
    setFiles(fl)
    if (fl) {
      const urls = Array.from(fl).map(f => URL.createObjectURL(f))
      setPreviews(urls)
    }
  }

  async function uploadImages(): Promise<string[]> {
    if (!files || files.length === 0) return ["/demo/office_space_blueprint_card.jpg"]
    const uploaded: string[] = []
    for (let i=0;i<files.length;i++) {
      const file = files[i]
      const name = Date.now() + "_" + i + "_" + file.name.replace(/[^a-zA-Z0-9.-]/g,"_")
      const { error } = await supabase.storage.from("listing-images").upload(name, file, { cacheControl: "3600", upsert: false })
      if (error) throw error
      const { data: pub } = supabase.storage.from("listing-images").getPublicUrl(name)
      uploaded.push(pub.publicUrl)
    }
    return uploaded
  }

  async function handleAdd() {
    setLoading(true)
    try {
      const imageUrls = await uploadImages()
      await addListing({
        title: `${type}${land_subtype? ` - ${land_subtype}` : ""} - ${city}`, city, price: Number(price), type,
        description: "Premium commercial space - direct owner listing",
        images: imageUrls,
        address, province: formData.state || formData.province, country: formData.country, district: formData.district, village_area: formData.village_area, land_subtype: formData.land_subtype, currency: formData.currency,
        sqft: Number(sqft), area: Number(sqft),
        peoplemin: 5, peoplemax: 15, verified: true, contact: "Direct Owner"
      })
      alert("Success! Added with " + imageUrls.length + " real images. Check homepage!")
      setTitle(""); setFiles(null); setPreviews([])
    } catch (e: any) {
      alert("Error: " + e.message)
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded bg-white">
      <h1 className="text-xl font-bold mb-4">Add Listing + Real Images</h1>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full border p-2 mb-2" />
      <div className="grid grid-cols-3 gap-2 mb-2">
        <select value={country} onChange={e=>setCountry(e.target.value)} className="border p-2"><option>Canada</option><option>India</option><option>USA</option></select>
        <input value={state} onChange={e=>setState(e.target.value)} placeholder="State / Province" className="border p-2" />
        <input value={district} onChange={e=>setDistrict(e.target.value)} placeholder="District" className="border p-2" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City / Village" className="w-full border p-2" />
        <input value={village_area} onChange={e=>setVillage(e.target.value)} placeholder="Village / Area" className="w-full border p-2" />
      </div>
      <select value={land_subtype} onChange={e=>setLandSubtype(e.target.value)} className="w-full border p-2 mb-2"><option>Commercial Land</option><option>Industrial Land</option><option>Agricultural Land</option><option>Residential Plot</option></select>

      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" className="w-full border p-2 mb-2" />
      <div className="flex gap-2">
        <select value={type} onChange={e=>setType(e.target.value)} className="w-full border p-2 mb-2">
          <option>Office</option><option>Retail</option><option>Industrial</option><option>Warehouse</option><option>Medical</option><option>Restaurant</option>
        </select>
        <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full border p-2 mb-2" />
        <input value={sqft} onChange={e=>setSqft(e.target.value)} placeholder="Sqft" className="w-full border p-2 mb-2" />
      </div>
      <div className="border-2 border-dashed p-4 mb-3">
        <input type="file" multiple accept="image/*" onChange={onFilesChange} />
        <p className="text-xs text-gray-500 mt-1">First image = cover for homepage.</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {previews.map((p,i)=><img key={i} src={p} className="w-20 h-20 object-cover rounded" />)}
        </div>
      </div>
      <button onClick={handleAdd} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-semibold">
        {loading? "Uploading..." : "Add to Live DB"}
      </button>
    </div>
  )
}
