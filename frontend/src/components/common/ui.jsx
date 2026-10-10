import { X } from 'lucide-react'
export const Card = ({ title, children, className = '' }) => (
  <section className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
    {title && <h2 className="font-semibold text-slate-700 mb-3">{title}</h2>}{children}
  </section>)
export const Btn = ({ variant = 'primary', className = '', ...p }) => (
  <button {...p} className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${variant === 'primary' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'} ${className}`} />)
export const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
export const Field = ({ label, error, children }) => (
  <label className="block text-sm text-slate-600">{label}{children}{error && <span className="text-red-600 text-xs">{error}</span>}</label>)
export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl p-5 w-full max-w-md">
      <div className="flex justify-between mb-3"><h3 className="font-semibold">{title}</h3><button onClick={onClose}><X size={18} /></button></div>{children}
    </div></div>)
export const Table = ({ cols, rows, onRow }) => (
  <div className="overflow-x-auto"><table className="w-full text-sm">
    <thead><tr className="text-left text-slate-500 border-b">{cols.map(c => <th key={c.h} className="py-2 pr-3">{c.h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={r.id ?? i} onClick={() => onRow?.(r)} className="border-b last:border-0 hover:bg-emerald-50/50 cursor-pointer">
      {cols.map(c => <td key={c.h} className="py-2 pr-3">{c.r(r)}</td>)}</tr>)}</tbody></table></div>)
