import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { faixa, fmt } from '../../utils/formatters'
import HeatLayer from './HeatLayer'

// criterio: null => raio fixo; id de critério => raio proporcional ao valor (filtro lateral)
// Servidor de tiles configurável (VITE_TILE_URL). Se trocar de provedor, ajuste img-src na CSP do nginx.conf.
const TILE_URL = import.meta.env.VITE_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function MapaView({ ranking, criteria, criterio = null, heat = false, height = 'h-72' }) {
  const c = criteria.find(x => x.id === criterio)
  const max = c ? Math.max(...ranking.map(r => r.values[c.id])) : 1
  // intensidade: valor normalizado do critério selecionado ou (1 − Ci) = vulnerabilidade
  const pts = ranking.map(r => [r.lat, r.lng, c ? (max ? r.values[c.id] / max : 0) : 1 - r.ci])
  return (
    <MapContainer center={[-11.5, -41.5]} zoom={6} className={`${height} w-full rounded-lg z-0`}>
      <TileLayer attribution="&copy; OpenStreetMap" url={TILE_URL} referrerPolicy="strict-origin-when-cross-origin" maxZoom={19} />
      {heat && <HeatLayer points={pts} />}
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
