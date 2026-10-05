import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { faixa, fmt } from '../../utils/formatters'

// criterio: null => raio fixo; id de critério => raio proporcional ao valor (filtro lateral)
export default function MapaView({ ranking, criteria, criterio = null, height = 'h-72' }) {
  const c = criteria.find(x => x.id === criterio)
  const max = c ? Math.max(...ranking.map(r => r.values[c.id])) : 1
  return (
    <MapContainer center={[-11.5, -41.5]} zoom={6} className={`${height} w-full rounded-lg z-0`}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {ranking.map(r => {
        const f = faixa(r.ci)
        return (
          <CircleMarker key={r.id} center={[r.lat, r.lng]} radius={c ? 6 + 16 * (r.values[c.id] / max) : 10}
            pathOptions={{ color: f.cor, fillColor: f.cor, fillOpacity: 0.7 }}>
            <Popup>
              <b>{r.nome}</b><br />Posição: {r.pos}º · Ci: {fmt(r.ci)}<br />{f.rotulo}<br />
              Indicador crítico: {r.critico}
              {c && <><br />{c.nome}: {r.values[c.id]} {c.unit}</>}
            </Popup>
          </CircleMarker>)
      })}
    </MapContainer>)
}
