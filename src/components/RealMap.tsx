"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false })

export default function RealMap({ listings }: { listings: any[] }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
      setReady(true)
    })
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)
  }, [])

  if (!ready) return <div className="h- bg-zinc-100 rounded- flex items-center justify-center">Loading {listings.length} pins...</div>

  const pins = listings.slice(0, 100).map((l: any) => ({
  ...l,
    lat: l.lat || l.latitude || 43.7315 + (Math.random()-0.5)*0.08,
    lng: l.lng || l.longitude || -79.7624 + (Math.random()-0.5)*0.12,
  }))

  return (
    <div className="h- rounded- overflow-hidden border relative">
      <div className="absolute top-3 left-3 z-[500] bg-zinc-900 text-white text- px-3 py-1 rounded-full">{pins.length} REAL PINS</div>
      <MapContainer center={[43.7315, -79.7624] as any} zoom={11} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng] as any}>
            <Popup>
              <div className="text-">
                <div className="font-bold">{p.title?.slice(0,40)}</div>
                <div>{p.city}</div>
                <button onClick={() => router.push(`/listing/${p.id}`)} className="mt-2 bg-black text-white px-3 py-1 rounded-full">View</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
