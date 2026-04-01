import { useState } from 'react'
import type { Home, Renovation } from '../types'

const STATUSES = ['Planning', 'In Progress', 'Complete', 'On Hold'] as const
const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  'Planning':    { bg: '#EFF6FF', color: '#1D4ED8', dot: '#93C5FD' },
  'In Progress': { bg: '#FFFBEB', color: '#92400E', dot: '#FCD34D' },
  'Complete':    { bg: '#F0FDF4', color: '#166534', dot: '#86EFAC' },
  'On Hold':     { bg: '#F9FAFB', color: '#374151', dot: '#D1D5DB' },
}

interface Props {
  home: Home
  renovations: Renovation[]
  onAddRenovation: (r: Renovation) => void
  onUpdateRenovation: (r: Renovation) => void
}

const empty = (): Partial<Renovation> => ({
  title: '', description: '', status: 'Planning',
  startDate: '', endDate: '', budget: '', actualCost: '', contractor: '', notes: ''
})

export function Renovations({ home, renovations, onAddRenovation, onUpdateRenovation }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Renovation | null>(null)
  const [selected, setSelected] = useState<Renovation | null>(null)
  const [form, setForm] = useState<Partial<Renovation>>(empty())

  const openAdd = () => { setForm(empty()); setEditItem(null); setShowForm(true); setSelected(null) }
  const openEdit = (r: Renovation) => { setForm({ ...r }); setEditItem(r); setShowForm(true); setSelected(null) }

  const handleSave = () => {
    if (!form.title) return
    if (editItem) {
      onUpdateRenovation({ ...editItem, ...form } as Renovation)
    } else {
      onAddRenovation({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as Renovation)
    }
    setShowForm(false); setEditItem(null)
  }

  const totalBudget = renovations.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0)
  const totalSpent = renovations.reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0)

  if (selected) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setSelected(null)} className="text-sm mb-6 flex items-center gap-1 opacity-60 hover:opacity-100">← Back to Renovations</button>
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>{selected.title}</h2>
            {selected.description && <p className="text-sm opacity-60 mt-1">{selected.description}</p>}
          </div>
          <div className="flex gap-2 ml-4">
            <button onClick={() => openEdit(selected)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#F0F7F4', color: '#1F3A32' }}>Edit</button>
          </div>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: STATUS_STYLES[selected.status].bg, color: STATUS_STYLES[selected.status].color }}>
          <div className="w-2 h-2 rounded-full" style={{ background: STATUS_STYLES[selected.status].dot }}></div>
          {selected.status}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          {[
            ['Start Date', selected.startDate ? new Date(selected.startDate).toLocaleDateString('en-IE') : '—'],
            ['End Date', selected.endDate ? new Date(selected.endDate).toLocaleDateString('en-IE') : '—'],
            ['Budget', selected.budget ? `€${parseFloat(selected.budget).toLocaleString()}` : '—'],
            ['Actual Cost', selected.actualCost ? `€${parseFloat(selected.actualCost).toLocaleString()}` : '—'],
            ['Contractor', selected.contractor || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-0.5">{k}</div>
              <div className="font-medium">{v}</div>
            </div>
          ))}
        </div>

        {/* Budget vs actual bar */}
        {selected.budget && selected.actualCost && (
          <div className="mb-5 p-3 rounded-xl" style={{ background: '#F7F3EB' }}>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span>Budget: €{parseFloat(selected.budget).toLocaleString()}</span>
              <span className={parseFloat(selected.actualCost) > parseFloat(selected.budget) ? 'text-red-600' : 'text-green-700'}>
                Spent: €{parseFloat(selected.actualCost).toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: '#E8E0D5' }}>
              <div className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (parseFloat(selected.actualCost) / parseFloat(selected.budget)) * 100)}%`,
                  background: parseFloat(selected.actualCost) > parseFloat(selected.budget) ? '#EF4444' : '#1F3A32'
                }} />
            </div>
          </div>
        )}

        {selected.notes && <p className="text-sm opacity-70 italic">{selected.notes}</p>}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>Renovations</h2>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>+ Add Project</button>
      </div>

      {renovations.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
            <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-1">Total Budget</div>
            <div className="text-xl font-bold" style={{ color: '#1F3A32' }}>€{totalBudget.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
            <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-1">Total Spent</div>
            <div className={`text-xl font-bold ${totalSpent > totalBudget && totalBudget > 0 ? 'text-red-600' : ''}`} style={{ color: totalSpent > totalBudget && totalBudget > 0 ? undefined : '#C9A86A' }}>€{totalSpent.toLocaleString()}</div>
          </div>
        </div>
      )}

      {renovations.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">🏗️</div>
          <p className="text-sm">No renovation projects yet</p>
          <p className="text-xs mt-1">Track budgets, timelines, and contractors</p>
        </div>
      )}

      {STATUSES.map(status => {
        const group = renovations.filter(r => r.status === status)
        if (!group.length) return null
        return (
          <div key={status} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_STYLES[status].dot }}></div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">{status}</h3>
            </div>
            <div className="space-y-2">
              {group.map(r => (
                <button key={r.id} onClick={() => setSelected(r)}
                  className="w-full text-left rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{ background: 'white', border: '1px solid #E8E0D5' }}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm" style={{ color: '#1F3A32' }}>{r.title}</div>
                    <div className="text-xs font-semibold opacity-60">{r.budget ? `€${parseFloat(r.budget).toLocaleString()}` : ''}</div>
                  </div>
                  {r.contractor && <div className="text-xs opacity-50 mt-0.5">👷 {r.contractor}</div>}
                  {r.startDate && <div className="text-xs opacity-50 mt-0.5">📅 {new Date(r.startDate).toLocaleDateString('en-IE')}{r.endDate ? ` → ${new Date(r.endDate).toLocaleDateString('en-IE')}` : ''}</div>}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'white' }}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{ color: '#1F3A32' }}>{editItem ? 'Edit Project' : 'Add Renovation'}</h3>
            <div className="space-y-3">
              <input placeholder="Project title *" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <textarea placeholder="Description..." value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{ borderColor: '#E8E0D5' }} />
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Renovation['status'] }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs opacity-50 block mb-1">Start Date</label><input type="date" value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
                <div><label className="text-xs opacity-50 block mb-1">End Date</label><input type="date" value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs opacity-50 block mb-1">Budget (€)</label><input type="number" placeholder="0" value={form.budget || ''} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
                <div><label className="text-xs opacity-50 block mb-1">Actual Cost (€)</label><input type="number" placeholder="0" value={form.actualCost || ''} onChange={e => setForm(f => ({ ...f, actualCost: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
              </div>
              <input placeholder="Main contractor / company" value={form.contractor || ''} onChange={e => setForm(f => ({ ...f, contractor: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <textarea placeholder="Notes..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{ borderColor: '#E8E0D5' }} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
                <button onClick={handleSave} disabled={!form.title} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#1F3A32' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
