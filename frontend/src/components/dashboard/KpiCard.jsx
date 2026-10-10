export default function KpiCard({ icon: I, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700"><I size={22} /></div>
      <div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="font-bold text-slate-800 truncate">{value}</p></div>
    </div>)
}
