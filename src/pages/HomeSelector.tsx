import { useState } from 'react'
import type { Home } from '../types'

const HOME_EMOJIS = ['🏡', '🏘️', '🏠', '🏗️', '🏚️', '🏛️', '🏰', '🌿']

interface Props {
  homes: Home[]
  onAddHome: (h: Home) => void
  onSelectHome: (h: Home) => void
}

export function HomeSelector({ homes, onAddHome, onSelectHome }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('🏡')

  const handleAdd = () => {
    if (!name) return
    const home: Home = {
      id: crypto.randomUUID(),
      name, address, description,
      coverEmoji: emoji,
      createdAt: new Date().toISOString(),
    }
    onAddHome(home)
    setShowForm(false)
    setName(''); setAddress(''); setDescription('')
  }

  return (
    <div className="min-h-screen" style={{background:'#F7F3EB'}}>
      {/* Header */}
      <div style={{background:'#1F3A32'}} className="px-6 py-8 text-center">
        <h1 className="font-display text-4xl font-bold text-white mb-1">Ár mBaile</h1>
        <p className="text-white/60 text-sm">Your homes, all in one place</p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {homes.length === 0 && !showForm && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="font-display text-2xl font-semibold mb-2" style={{color:'#1F3A32'}}>Welcome to Ár mBaile</h2>
            <p className="text-sm mb-6" style={{color:'#3A3A3C', opacity:0.7}}>Add your first home to get started</p>
            <button onClick={() => setShowForm(true)} style={{background:'#1F3A32'}} className="text-white font-semibold px-8 py-3 rounded-xl text-sm">
              + Add Your Home
            </button>
          </div>
        )}

        {/* Home list */}
        {homes.length > 0 && (
          <div className="space-y-3 mb-6">
            {homes.map(home => (
              <button key={home.id} onClick={() => onSelectHome(home)}
                className="w-full text-left rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
                style={{background:'white', border:'1px solid #E8E0D5'}}
              >
                <div className="text-4xl">{home.coverEmoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-base" style={{color:'#1F3A32'}}>{home.name}</div>
                  <div className="text-sm opacity-60 mt-0.5">{home.address || 'No address added'}</div>
                  {home.description && <div className="text-xs opacity-50 mt-1 italic">{home.description}</div>}
                </div>
                <span className="text-xl opacity-30">›</span>
              </button>
            ))}
          </div>
        )}

        {homes.length > 0 && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-colors"
            style={{borderColor:'#C9A86A', color:'#C9A86A'}}
          >
            + Add Another Home
          </button>
        )}

        {/* Add form */}
        {showForm && (
          <div className="rounded-2xl p-6 shadow-sm" style={{background:'white', border:'1px solid #E8E0D5'}}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{color:'#1F3A32'}}>Add a Home</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{color:'#3A3A3C', opacity:0.6}}>Home Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Our Family Home"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{borderColor:'#E8E0D5'}} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{color:'#3A3A3C', opacity:0.6}}>Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 14 Oak Avenue, Dublin 6"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{borderColor:'#E8E0D5'}} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{color:'#3A3A3C', opacity:0.6}}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder="e.g. Three-bed semi-detached, red brick, green door..."
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
                  style={{borderColor:'#E8E0D5'}} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-2 uppercase tracking-wide" style={{color:'#3A3A3C', opacity:0.6}}>Choose an Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {HOME_EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${emoji === e ? 'scale-110' : 'opacity-50'}`}
                      style={{borderColor: emoji === e ? '#1F3A32' : 'transparent', background: emoji === e ? '#F0F7F4' : 'transparent'}}
                    >{e}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:'#E8E0D5', color:'#3A3A3C'}}>Cancel</button>
                <button onClick={handleAdd} disabled={!name} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:'#1F3A32'}}>Create Home</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
