import { useState } from 'react'
import type { Home, InsurancePolicy, Item } from '../types'

const POLICY_TYPES = ['Home', 'Car', 'Life', 'Pet', 'Travel', 'Gadget', 'Extended Warranty', 'Other']
const TYPE_ICONS: Record<string, string> = { Home:'🏠', Car:'🚗', Life:'💚', Pet:'🐾', Travel:'✈️', Gadget:'📱', 'Extended Warranty':'📋', Other:'🛡️' }

interface Props {
  home: Home
  policies: InsurancePolicy[]
  items: Item[]
  onAddPolicy: (p: InsurancePolicy) => void
}

const emptyPolicy = (): Partial<InsurancePolicy> => ({ type: 'Home', provider: '', policyNumber: '', renewalDate: '', premium: '', notes: '' })

export function Insurance({ home, policies, items, onAddPolicy }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<InsurancePolicy>>(emptyPolicy())
  const [expanded, setExpanded] = useState<string | null>(null)

  const today = new Date()
  const in60 = new Date(); in60.setDate(today.getDate() + 60)

  const isExpiringSoon = (p: InsurancePolicy) => {
    if (!p.renewalDate) return false
    const d = new Date(p.renewalDate)
    return d <= in60 && d >= today
  }

  const handleSave = () => {
    if (!form.provider) return
    onAddPolicy({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as InsurancePolicy)
    setShowForm(false); setForm(emptyPolicy())
  }

  const insuredItems = (type: string) => items.filter(i => i.insuranceLinked && (type === 'Home' || type === 'Gadget')).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{color:'#1F3A32'}}>Insurance Vault</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:'#1F3A32'}}>+ Add Policy</button>
      </div>

      {/* Expiring banner */}
      {policies.some(isExpiringSoon) && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2" style={{background:'#FEF3C7', color:'#92400E'}}>
          ⚠️ {policies.filter(isExpiringSoon).length} policy renews within 60 days — review now
        </div>
      )}

      {policies.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-sm">No policies added yet</p>
        </div>
      )}

      <div className="space-y-3">
        {policies.map(p => (
          <div key={p.id}
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{background:'white', border: isExpiringSoon(p) ? '2px solid #F59E0B' : '1px solid #E8E0D5'}}
          >
            <button className="w-full text-left p-4 flex items-center gap-4" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
              <span className="text-2xl">{TYPE_ICONS[p.type] || '🛡️'}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{color:'#1F3A32'}}>{p.type} Insurance</div>
                <div className="text-xs opacity-60">{p.provider}{p.policyNumber ? ` · ${p.policyNumber}` : ''}</div>
              </div>
              <div className="text-right">
                {p.renewalDate && (
                  <div className={`text-xs font-semibold ${isExpiringSoon(p) ? 'text-amber-600' : 'opacity-50'}`}>
                    {isExpiringSoon(p) ? '⚠️ ' : ''}Renews {new Date(p.renewalDate).toLocaleDateString('en-IE')}
                  </div>
                )}
                {p.premium && <div className="text-xs opacity-50">€{p.premium}/yr</div>}
              </div>
              <span className="opacity-30 ml-2">{expanded === p.id ? '↑' : '↓'}</span>
            </button>
            {expanded === p.id && (
              <div className="px-4 pb-4 border-t" style={{borderColor:'#F0EBE3'}}>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  {p.policyNumber && <div><div className="text-xs opacity-50 mb-0.5">Policy Number</div><div className="font-mono font-semibold">{p.policyNumber}</div></div>}
                  {p.renewalDate && <div><div className="text-xs opacity-50 mb-0.5">Renewal Date</div><div className="font-semibold">{new Date(p.renewalDate).toLocaleDateString('en-IE')}</div></div>}
                  {p.premium && <div><div className="text-xs opacity-50 mb-0.5">Annual Premium</div><div className="font-semibold">€{p.premium}</div></div>}
                  <div><div className="text-xs opacity-50 mb-0.5">Linked Items</div><div className="font-semibold">{insuredItems(p.type)} items</div></div>
                </div>
                {p.notes && <p className="mt-3 text-sm opacity-70 italic">{p.notes}</p>}

                {/* Claims checklist */}
                <div className="mt-4 p-3 rounded-xl text-xs" style={{background:'#F7F3EB'}}>
                  <div className="font-bold mb-2 opacity-70">📋 If you need to make a claim:</div>
                  <ul className="space-y-1 opacity-60">
                    <li>□ Have your policy number ready: <strong>{p.policyNumber || '—'}</strong></li>
                    <li>□ Document the damage with photos</li>
                    <li>□ Do not dispose of damaged items</li>
                    <li>□ Get a crime reference number if applicable</li>
                    <li>□ Gather receipts/valuations for any items</li>
                    <li>□ Call {p.provider} claims line as soon as possible</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Policy Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:'white'}}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{color:'#1F3A32'}}>Add Policy</h3>
            <div className="space-y-3">
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}}>
                {POLICY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <input placeholder="Provider name *" value={form.provider || ''} onChange={e => setForm(f => ({...f, provider: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              <input placeholder="Policy number" value={form.policyNumber || ''} onChange={e => setForm(f => ({...f, policyNumber: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs opacity-50 block mb-1">Renewal Date</label><input type="date" value={form.renewalDate || ''} onChange={e => setForm(f => ({...f, renewalDate: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
                <div><label className="text-xs opacity-50 block mb-1">Annual Premium (€)</label><input type="number" placeholder="0" value={form.premium || ''} onChange={e => setForm(f => ({...f, premium: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
              </div>
              <textarea placeholder="Notes..." value={form.notes || ''} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{borderColor:'#E8E0D5'}} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:'#E8E0D5'}}>Cancel</button>
                <button onClick={handleSave} disabled={!form.provider} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:'#1F3A32'}}>Save Policy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
