'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'

export default function RealMap({ listings }: { listings: any[] }) {
  useEffect(()=>{
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  },[])

  const getPos = (l:any, i:number) => {
    if (l.latitude && l.longitude) return [l.latitude, l.longitude]
    const bases: any = { brampton:[43.7315,-79.7624], mississauga:[43.589,-79.6441], vaughan:[43.8361,-79.4983], caledon:[43.8667,-79.8667], toronto:[43.6532,-79.3832] }
    const b = bases[(l.city||'brampton').toLowerCase()] || bases.brampton
    return [b[0]+(i%10)*0.03-0.135, b[1]+Math.floor(i/10)*0.03-0.135]
  }

  return (
    <div className="h- w-full rounded- overflow-hidden border relative">
      <div className="absolute top-4 left-4 z-[1000] bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold">
        {listings.length} pins • {listings.length===70?'All':'Filtered'}
      </div>
      <MapContainer center={[43.7315,-79.7624]} zoom={10} style={{height:'100%',width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
        {listings.map((l:any,i:number)=>{
          const pos = getPos(l,i) as any
          return <Marker key={l.id||i} position={pos}><Popup><b>{l.title||'Space'}</b><br/>{l.city} • {l.size_sqft||10000} SQ FT</Popup></Marker>
        })}
      </MapContainer>
    </div>
  )
}
