'use client'
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'
import { useRouter } from 'next/navigation'

export default function RealMap({ listings }: { listings: any[] }) {
  const router = useRouter()

  useEffect(()=>{
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  },[])

  if (!listings || listings.length===0) {
    return <div className="h- w-full bg-zinc-50 rounded- flex items-center justify-center border">No listings match filters - add postal code to show on map</div>
  }

  return (
    <div className="h- w-full rounded- overflow-hidden border border-zinc-200 relative">
      <div className="absolute top-4 left-4 z-[1000] bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold shadow">
        {listings.length} pins • {listings.length===70?'GTA West - True Location':'Filtered Search'}
      </div>
      <MapContainer center={[43.7315, -79.7624]} zoom={10} style={{height:'100%',width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {listings.map((l:any)=>{
          if (!l.latitude ||!l.longitude) return null
          return (
            <Marker
              key={l.id}
              position={[l.latitude, l.longitude]}
              eventHandlers={{
                dblclick: () => router.push(`/listing/${l.id}`),
              }}
            >
              <Tooltip direction="top" offset={[0,-20]} opacity={1} permanent={false}>
                <div className="text-xs font-semibold">
                  {l.city} • {l.size_sqft||'10K'} SQ FT<br/>
                  {l.price?`$${l.price}/mo • `:''}{l.type||'Office'}
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <b>{l.title||'Commercial Space'}</b><br/>
                  {l.city} - {l.postal_code||''}<br/>
                  {l.size_sqft} SQ FT • ${l.price}/mo<br/>
                  <button onClick={()=>router.push(`/listing/${l.id}`)} className="mt-2 bg-black text-white px-3 py-1 rounded-full text-xs">View Full Listing (double-click map pin also)</button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
