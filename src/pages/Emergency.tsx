import { useState, useEffect } from 'react'
import type { Home, InsurancePolicy } from '../types'
import { PinSettings } from '../components/PinLock'

interface EmergencyInfo {
  waterShutoff: string
  gasShutoff: string
  fuseBox: string
  fireExtinguisher: string
  firstAidKit: string
  contacts: { name: string; phone: string; role: string }[]
}

interface Props {
  home: Home
  policies: InsurancePolicy[]
}

const KEY = (homeId: string) => `armbaile_emergency_${homeId}`

const defaultInfo = (): EmergencyInfo => ({
  waterShutoff: '', gasShutoff: '', fuseBox: '',
  fireExtinguisher: '', firstAidKit: '',
  contacts: [
    { name: '', phone: '', role: 'Gas Emergency' },
    { name: '', phone: '', role: 'Electrician' },
    { name: '', phone: '', role: 'Plumber' },
  ]
})

export function Emergency({ home, policies }: Props) {
  const [info, setInfo] = useState<EmergencyInfo>(() => {
    try { return JSON.parse(localStorage.getItem(KEY(home.id)) || 'null') || defaultInfo() } catch { return defaultInfo() }
  })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EmergencyInfo>(info)

  useEffect(() => {
    localStorage.setItem(KEY(home.id), JSON.stringify(info))
  }, [info, home.id])

  const handleSave = () => { setInfo(draft); setEditing(false) }

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{borderColor:'#F0EBE3'}}>
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm font-medium">{value || <span className="opacity-30 italic">Not set — tap Edit to add</span>}</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{color:'#1F3A32'}}>🚨 Emergency Info</h2>
        <button onClick={() => { setDraft({...info}); setEditing(true) }} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:'#1F3A32'}}>Edit</button>
      </div>

      {/* Shutoff locations */}
      <div className="rounded-2xl p-5 shadow-sm mb-4" style={{background:'white', border:'1px solid #E8E0D5'}}>
        <h3 className="font-semibold text-sm mb-2" style={{color:'#1F3A32'}}>Shutoffs & Locations</h3>
        <InfoRow icon="💧" label="Water Shutoff" value={info.waterShutoff} />
        <InfoRow icon="🔥" label="Gas Shutoff" value={info.gasShutoff} />
        <InfoRow icon="⚡" label="Fuse Box" value={info.fuseBox} />
        <InfoRow icon="🧯" label="Fire Extinguisher" value={info.fireExtinguisher} />
        <InfoRow icon="🩺" label="First Aid Kit" value={info.firstAidKit} />
      </div>

      {/* Emergency contacts */}
      <div className="rounded-2xl p-5 shadow-sm mb-4" style={{background:'white', border:'1px solid #E8E0D5'}}>
        <h3 className="font-semibold text-sm mb-3" style={{color:'#1F3A32'}}>Emergency Contacts</h3>
        {/* Ireland defaults */}
        <div className="space-y-2 mb-3">
          {[
            { role: '🚒 Fire & Rescue', number: '999 / 112' },
            { role: '🚑 Ambulance', number: '999 / 112' },
            { role: '🚔 Garda', number: '999 / 112' },
            { role: '⛽ Gas Emergencies (Ireland)', number: '1800 20 50 50' },
          ].map(c => (
            <div key={c.role} className="flex justify-between text-sm py-1.5 border-b" style={{borderColor:'#F0EBE3'}}>
              <span className="font-medium">{c.role}</span>
              <span className="font-mono font-bold" style={{color:'#1F3A32'}}>{c.number}</span>
            </div>
          ))}
        </div>
        {info.contacts.filter(c => c.name || c.phone).map((c, i) => (
          <div key={i} className="flex justify-between text-sm py-1.5 border-b last:border-b-0" style={{borderColor:'#F0EBE3'}}>
            <div>
              <span className="font-medium">{c.name || c.role}</span>
              {c.name && c.role && <span className="text-xs opacity-50 ml-2">{c.role}</span>}
            </div>
            <a href={`tel:${c.phone}`} className="font-mono font-bold" style={{color:'#1F3A32'}}>{c.phone || '—'}</a>
          </div>
        ))}
      </div>

      {/* Insurance quick reference */}
      {policies.length > 0 && (
        <div className="rounded-2xl p-5 shadow-sm" style={{background:'white', border:'1px solid #E8E0D5'}}>
          <h3 className="font-semibold text-sm mb-3" style={{color:'#1F3A32'}}>🛡️ Insurance Quick Reference</h3>
          <div className="space-y-2">
            {policies.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm py-1.5 border-b last:border-b-0" style={{borderColor:'#F0EBE3'}}>
                <div>
                  <span className="font-medium">{p.type}</span>
                  <span className="text-xs opacity-50 ml-2">{p.provider}</span>
                </div>
                <span className="font-mono text-xs font-bold opacity-70">{p.policyNumber || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PIN settings */}
      <div className="mt-4">
        <PinSettings />
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{background:'white'}}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{color:'#1F3A32'}}>Edit Emergency Info</h3>
            <div className="space-y-3">
              {([
                ['waterShutoff', '💧', 'Water Shutoff Location'],
                ['gasShutoff', '🔥', 'Gas Shutoff Location'],
                ['fuseBox', '⚡', 'Fuse Box Location'],
                ['fireExtinguisher', '🧯', 'Fire Extinguisher Location'],
                ['firstAidKit', '🩺', 'First Aid Kit Location'],
              ] as const).map(([key, icon, label]) => (
                <div key={key}>
                  <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-1">{icon} {label}</label>
                  <input value={draft[key]} onChange={e => setDraft(d => ({...d, [key]: e.target.value}))}
                    placeholder={`e.g. Under kitchen sink`}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
                </div>
              ))}

              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Emergency Contacts</div>
                {draft.contacts.map((c, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                    <input placeholder="Role" value={c.role} onChange={e => setDraft(d => ({ ...d, contacts: d.contacts.map((cc, j) => j === i ? {...cc, role: e.target.value} : cc) }))} className="border rounded-xl px-3 py-2 text-sm" style={{borderColor:'#E8E0D5'}} />
                    <input placeholder="Name" value={c.name} onChange={e => setDraft(d => ({ ...d, contacts: d.contacts.map((cc, j) => j === i ? {...cc, name: e.target.value} : cc) }))} className="border rounded-xl px-3 py-2 text-sm" style={{borderColor:'#E8E0D5'}} />
                    <input placeholder="Phone" value={c.phone} onChange={e => setDraft(d => ({ ...d, contacts: d.contacts.map((cc, j) => j === i ? {...cc, phone: e.target.value} : cc) }))} className="border rounded-xl px-3 py-2 text-sm" style={{borderColor:'#E8E0D5'}} />
                  </div>
                ))}
                <button onClick={() => setDraft(d => ({...d, contacts: [...d.contacts, {name:'', phone:'', role:''}]}))} className="text-xs font-semibold mt-1" style={{color:'#C9A86A'}}>+ Add contact</button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:'#E8E0D5'}}>Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'#1F3A32'}}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
