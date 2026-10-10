import { Table } from '../common/ui'
import { fmt, faixa } from '../../utils/formatters'
export default function ResultadoTabela({ ranking, onSelect }) {
  return <Table rows={ranking} onRow={onSelect} cols={[
    { h: 'Pos.', r: r => r.pos + 'º' }, { h: 'Município', r: r => `${r.nome}/${r.uf}` },
    { h: 'D+', r: r => fmt(r.dPlus) }, { h: 'D-', r: r => fmt(r.dMinus) },
    { h: 'Ci', r: r => <span className="font-semibold" style={{ color: faixa(r.ci).cor }}>{fmt(r.ci)}</span> }]} />
}
