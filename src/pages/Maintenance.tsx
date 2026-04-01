import { useState } from 'react'
import type { Home, MaintenanceLog, Item } from '../types'

const CATEGORIES = ['Boiler', 'Electrics', 'Plumbing', 'Roof', 'Appliance', 'Windows', 'Garden', 'Smoke Alarms', 'Gutters', 'General']
const CAT_ICONS: Record<string, string> = { Boiler:'🔥', Electrics:'⚡', Plumbing:'🚿', Roof:'🏠', Appliance:'🧹', Windows:'🪟', Garden:'🌿', 'Smoke Alarms':'🚨', Gutters:'🌧️', General:'🔧' }

interface Props {
  home: Home
  logs: MaintenanceLog[]
  items: Item[]
  onAddLog: (m: MaintenanceLog) => void
}

const emptyLog = (): Partial<MaintenanceLog> => ({ title: '', category: 'General', date: '', cost: '', notes: '', nextDueDate: '', itemId: '' })

export function Maintenance({ home, logs, items, onAddLog }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<MaintenanceLog>>(emptyLog())

  const today = new Date()
  const in30 = new Date(); in30.setDate(today.getDate() + 30)

  const overdue = logs.filter(m => m.nextDueDate && new Date(m.nextDueDate) < today)
  const upcoming = logs.filter(m => m.nextDueDate && new Date(m.nextDueDate) >= today && new Date(m.nextDueDate) <= in30)
  const rest = logs.filter(m => !overdue.find(o => o.id === m.id) && !upcoming.find(u => u.id === m.id))

  const handleSave = () => {
    if (!form.title) return
    onAddLog({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as MaintenanceLog)
    setShowForm(false); setForm(emptyLog())
  }

  const itemName = (id?: string) => id ? items.find(i => i.id === id)?.name : undefined

  const LogCard = ({ log, highlight }: { log: MaintenanceLog; highlight?: 'red' | 'amber' }) => (
    <div className="rounded-xl p-4 shadow-sm" style={{
      background: 'white',
      border: `1px solid ${highlight === 'red' ? '#FCA5A5' : highlight === 'amber' ? '#FCD34D' : '#E8E0D5'}`
    }}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{CAT_ICONS[log.category] || '🔧'}</span>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{color:'#1F3A32'}}>{log.title}</div>
          <div className="text-xs opacity-50 mt-0.5">
            {log.category}
            {log.date && ` · Done ${new Date(log.date).toLocaleDateString('en-IE')}`}
            {log.cost && ` · €${log.cost}`}
            {itemName(log.itemId) && ` · ${itemName(log.itemId)}`}
          </div>
          {log.nextDueDate && (
            <div className={`text-xs font-semibold mt-1 ${highlight === 'red' ? 'text-red-600' : highlight === 'amber' ? 'text-amber-600' : 'opacity-50'}`}>
              {highlight === 'red' ? '⚠️ Overdue — ' : '📅 Next: '}
              {new Date(log.nextDueDate).toLocaleDateString('en-IE')}
            </div>
          )}
          {log.notes && <p className="text-xs opacity-60 mt-1 italic">{log.notes}</p>}
          {log.productUrl && (
            <a href={log.productUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold mt-1 hover:opacity-70"
              style={{color:'#C9A86A'}}>
              🔗 {log.productUrl.replace(/^https?:\/\//, '').split('/')[0]} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{color:'#1F3A32'}}>Maintenance</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:'#1F3A32'}}>+ Log Service</button>
      </div>

      {logs.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-sm">No maintenance logs yet — start tracking services</p>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-red-500">⚠️ Overdue</h3>
          <div className="space-y-2">{overdue.map(m => <LogCard key={m.id} log={m} highlight="red" />)}</div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-amber-600">📅 Due in Next 30 Days</h3>
          <div className="space-y-2">{upcoming.map(m => <LogCard key={m.id} log={m} highlight="amber" />)}</div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-40">History</h3>
          <div className="space-y-2">{rest.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(m => <LogCard key={m.id} log={m} />)}</div>
        </div>
      )}

      {/* Suggested schedule */}
      <div className="mt-8 rounded-2xl p-5" style={{background:'white', border:'1px solid #E8E0D5'}}>
        <h3 className="font-semibold text-sm mb-4" style={{color:'#1F3A32'}}>📋 Recommended Annual Checks</h3>
        <div className="grid grid-cols-2 gap-2 text-xs opacity-60">
          {[
            ['🔥', 'Boiler service', 'Annual'],
            ['🚨', 'Smoke alarm batteries', 'Every 6 months'],
            ['🌧️', 'Gutter cleaning', 'Autumn'],
            ['⚡', 'Electrical check', 'Every 5 years'],
            ['🏠', 'Roof inspection', 'Annual'],
            ['🌿', 'Chimney sweep', 'Annual (if used)'],
          ].map(([icon, task, freq]) => (
            <div key={task} className="flex items-center gap-2 py-1">
              <span>{icon}</span>
              <div>
                <div className="font-medium">{task}</div>
                <div className="opacity-60">{freq}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Log Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:'white'}}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{color:'#1F3A32'}}>Log Service</h3>
            <div className="space-y-3">
              <input placeholder="Title *" value={form.title || ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {items.length > 0 && (
                <select value={form.itemId || ''} onChange={e => setForm(f => ({...f, itemId: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}}>
                  <option value="">No specific item (whole-home job)</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs opacity-50 block mb-1">Date Done</label><input type="date" value={form.date || ''} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
                <div><label className="text-xs opacity-50 block mb-1">Cost (€)</label><input type="number" placeholder="0" value={form.cost || ''} onChange={e => setForm(f => ({...f, cost: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
              </div>
              <div><label className="text-xs opacity-50 block mb-1">Next Due Date</label><input type="date" value={form.nextDueDate || ''} onChange={e => setForm(f => ({...f, nextDueDate: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
              <textarea placeholder="Notes..." value={form.notes || ''} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{borderColor:'#E8E0D5'}} />
              <div>
                <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-1">🔗 Product / Service Link</label>
                <input placeholder="e.g. tradesperson website or parts link" value={form.productUrl || ''} onChange={e => setForm(f => ({...f, productUrl: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:'#E8E0D5'}}>Cancel</button>
                <button onClick={handleSave} disabled={!form.title} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:'#1F3A32'}}>Save Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
