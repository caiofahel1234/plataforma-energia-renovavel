import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
// Camada de calor (Cap. 8): points = [[lat, lng, intensidade 0..1], ...]
export default function HeatLayer({ points }) {
  const map = useMap()
  useEffect(() => {
    const layer = L.heatLayer(points, { radius: 48, blur: 32, maxZoom: 9, minOpacity: 0.45, gradient: { 0.2: '#16a34a', 0.5: '#eab308', 0.9: '#dc2626' } }).addTo(map)
    return () => { map.removeLayer(layer) }
  }, [map, points])
  return null
}
