import { useState } from 'react'
import type { Home, Finish, Room } from '../types'

const FINISH_TYPES = ['Paint', 'Tiles', 'Flooring', 'Worktop', 'Ironmongery', 'Wallpaper', 'Other'] as const
const TYPE_ICONS: Record<string, string> = { Paint: '🎨', Tiles: '🔲', Flooring: '🪵', Worktop: '🍽️', Ironmongery: '🔩', Wallpaper: '📰', Other: '🏠' }
const DEFAULT_ROOMS = ['Kitchen', 'Living Room', 'Master Bedroom', 'Bedroom 2', 'Bathroom', 'Hallway', 'Garage', 'Garden', 'Other']

interface Props {
  home: Home
  finishes: Finish[]
  rooms: Room[]
  onAddFinish: (f: Finish) => void
  onUpdateFinish: (f: Finish) => void
  onDeleteFinish: (id: string) => void
}

const empty = (): Partial<Finish> => ({
  type: 'Paint', roomId: '', name: '', brand: '', colourCode: '', colourName: '',
  finish: '', supplier: '', productCode: '', batchNumber: '',
  quantityBought: '', quantityLeftover: '', notes: '', productUrl: ''
})

export function Finishes({ home, finishes, rooms, onAddFinish, onUpdateFinish, onDeleteFinish }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Finish | null>(null)
  const [selected, setSelected] = useState<Finish | null>(null)
  const [form, setForm] = useState<Partial<Finish>>(empty())
  const [filterType, setFilterType] = useState('')
  const [filterRoom, setFilterRoom] = useState('')

  const allRooms = [
    ...DEFAULT_ROOMS.filter(r => !rooms.find(r2 => r2.name === r)).map(r => ({ id: r, name: r })),
    ...rooms.filter(r => r.homeId === home.id),
  ]

  const filtered = finishes.filter(f => {
    if (filterType && f.type !== filterType) return false
    if (filterRoom && f.roomId !== filterRoom) return false
    return true
  })

  const roomName = (id: string) => allRooms.find(r => r.id === id)?.name || id || '—'

  const openAdd = () => { setForm(empty()); setEditItem(null); setShowForm(true); setSelected(null) }
  const openEdit = (f: Finish) => { setForm({ ...f }); setEditItem(f); setShowForm(true); setSelected(null) }

  const handleSave = () => {
    if (!form.name && !form.colourName && !form.brand) return
    if (editItem) {
      onUpdateFinish({ ...editItem, ...form } as Finish)
    } else {
      onAddFinish({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as Finish)
    }
    setShowForm(false); setEditItem(null)
  }

  // Paint colour preview swatch (very rough hex from colour name mapping)
  const ColourSwatch = ({ code }: { code: string }) => {
    if (!code) return null
    const isHex = /^#[0-9A-Fa-f]{6}$/.test(code)
    return isHex ? (
      <div className="w-8 h-8 rounded-lg border flex-shrink-0" style={{ background: code, borderColor: '#E8E0D5' }} title={code} />
    ) : (
      <div className="w-8 h-8 rounded-lg border flex-shrink-0 flex items-center justify-center text-xs opacity-40" style={{ borderColor: '#E8E0D5' }}>🎨</div>
    )
  }

  // Detail view
  if (selected) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setSelected(null)} className="text-sm mb-6 flex items-center gap-1 opacity-60 hover:opacity-100">← Back to Finishes</button>
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{TYPE_ICONS[selected.type]}</span>
            <div>
              <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>{selected.colourName || selected.name || selected.brand}</h2>
              <p className="text-sm opacity-60">{selected.type} · {roomName(selected.roomId)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEdit(selected)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#F0F7F4', color: '#1F3A32' }}>Edit</button>
            <button onClick={() => { onDeleteFinish(selected.id); setSelected(null) }} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#FFF0F0', color: '#6A1E2C' }}>Delete</button>
          </div>
        </div>

        {/* Colour swatch for paint */}
        {selected.type === 'Paint' && selected.colourCode && (
          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: '#F7F3EB' }}>
            <ColourSwatch code={selected.colourCode} />
            <div>
              <div className="font-semibold text-sm">{selected.colourName || 'Colour'}</div>
              <div className="text-xs opacity-60 font-mono">{selected.colourCode}</div>
            </div>
          </div>
        )}

        {/* Photo */}
        {selected.photoData && (
          <img src={selected.photoData} alt="Finish" className="w-full max-h-52 object-cover rounded-xl mb-5 border" style={{ borderColor: '#E8E0D5' }} />
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          {[
            ['Brand', selected.brand],
            ['Supplier', selected.supplier],
            ['Product Code', selected.productCode],
            ['Batch Number', selected.batchNumber],
            ['Finish', selected.finish],
            ['Quantity Bought', selected.quantityBought],
            ['Quantity Leftover', selected.quantityLeftover],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-0.5">{k}</div>
              <div className="font-medium">{v}</div>
            </div>
          ))}
        </div>

        {selected.notes && <p className="text-sm opacity-70 italic mb-4">{selected.notes}</p>}

        {/* Receipt */}
        {selected.receiptData ? (
          <div className="mt-2 mb-4 pt-4 border-t" style={{ borderColor: '#F0EBE3' }}>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Receipt</div>
            {selected.receiptData.startsWith('data:image') ? (
              <img src={selected.receiptData} alt="Receipt" className="rounded-xl w-full max-h-72 object-contain border" style={{ borderColor: '#E8E0D5' }} />
            ) : (
              <a href={selected.receiptData} download={selected.receiptName || 'receipt.pdf'}
                className="flex items-center gap-3 rounded-xl p-3 border" style={{ borderColor: '#A9C1A9', background: '#F0F7F4' }}>
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1F3A32' }}>{selected.receiptName || 'receipt.pdf'}</div>
                  <div className="text-xs opacity-50">Tap to download</div>
                </div>
              </a>
            )}
          </div>
        ) : null}

        {selected.productUrl && (
          <a href={selected.productUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 rounded-xl p-3 border hover:opacity-80 transition-opacity"
            style={{ borderColor: '#E8E0D5', background: '#F7F3EB' }}>
            <span className="text-xl">🔗</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: '#1F3A32' }}>{selected.productUrl.replace(/^https?:\/\//, '').split('/')[0]}</div>
              <div className="text-xs opacity-50 truncate">{selected.productUrl}</div>
            </div>
            <span className="text-xs font-semibold opacity-50">Open ↗</span>
          </a>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>Finishes & Materials</h2>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>+ Add Finish</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{ borderColor: '#E8E0D5' }}>
          <option value="">All Types</option>
          {FINISH_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{ borderColor: '#E8E0D5' }}>
          <option value="">All Rooms</option>
          {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <span className="text-xs opacity-50 self-center">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-sm">No finishes recorded yet</p>
          <p className="text-xs mt-1">Save paint colours, tiles, flooring and more</p>
        </div>
      )}

      {/* Grouped by type */}
      {FINISH_TYPES.filter(t => !filterType || t === filterType).map(type => {
        const group = filtered.filter(f => f.type === type)
        if (!group.length) return null
        return (
          <div key={type} className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-40">{TYPE_ICONS[type]} {type}</h3>
            <div className="space-y-2">
              {group.map(f => (
                <button key={f.id} onClick={() => setSelected(f)}
                  className="w-full text-left rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                  style={{ background: 'white', border: '1px solid #E8E0D5' }}>
                  {f.type === 'Paint' && f.colourCode ? <ColourSwatch code={f.colourCode} /> : <span className="text-xl">{TYPE_ICONS[f.type]}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: '#1F3A32' }}>{f.colourName || f.name || f.brand || 'Untitled'}</div>
                    <div className="text-xs opacity-50 mt-0.5">
                      {roomName(f.roomId)}{f.brand ? ` · ${f.brand}` : ''}{f.colourCode ? ` · ${f.colourCode}` : ''}{f.productCode ? ` · ${f.productCode}` : ''}
                    </div>
                  </div>
                  {f.photoData && <span className="text-sm opacity-40">📷</span>}
                  <span className="opacity-30 text-lg">›</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'white' }}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{ color: '#1F3A32' }}>{editItem ? 'Edit Finish' : 'Add Finish'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Finish['type'] }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }}>
                  {FINISH_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={form.roomId || ''} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }}>
                  <option value="">Select room</option>
                  {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Paint-specific fields */}
              {form.type === 'Paint' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Colour name (e.g. Mizzle)" value={form.colourName || ''} onChange={e => setForm(f => ({ ...f, colourName: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                    <input placeholder="Colour code (e.g. F&B No.26)" value={form.colourCode || ''} onChange={e => setForm(f => ({ ...f, colourCode: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Brand (e.g. Farrow & Ball)" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                    <input placeholder="Finish (matt/eggshell/gloss)" value={form.finish || ''} onChange={e => setForm(f => ({ ...f, finish: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                  </div>
                </>
              )}

              {/* Non-paint name field */}
              {form.type !== 'Paint' && (
                <input placeholder="Name / Description *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Brand / Manufacturer" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                <input placeholder="Supplier / Store" value={form.supplier || ''} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Product code / Range" value={form.productCode || ''} onChange={e => setForm(f => ({ ...f, productCode: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                <input placeholder="Batch number" value={form.batchNumber || ''} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Qty bought (e.g. 3 tins)" value={form.quantityBought || ''} onChange={e => setForm(f => ({ ...f, quantityBought: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                <input placeholder="Qty leftover" value={form.quantityLeftover || ''} onChange={e => setForm(f => ({ ...f, quantityLeftover: e.target.value }))} className="border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              </div>
              <input placeholder="🔗 Product link (URL)" value={form.productUrl || ''} onChange={e => setForm(f => ({ ...f, productUrl: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <textarea placeholder="Notes..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{ borderColor: '#E8E0D5' }} />

              {/* Photo upload */}
              <div>
                <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-2">📷 Photo (tin, tile, swatch)</label>
                {form.photoData ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={form.photoData} alt="Preview" className="w-full max-h-40 object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, photoData: undefined, photoName: undefined }))} className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow">✕</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer hover:opacity-80" style={{ borderColor: '#C9A86A' }}>
                    <span className="text-sm font-semibold" style={{ color: '#C9A86A' }}>📷 Upload photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = ev => setForm(f => ({ ...f, photoData: ev.target?.result as string, photoName: file.name }))
                      reader.readAsDataURL(file)
                    }} />
                  </label>
                )}
              </div>

              {/* Receipt upload */}
              <div>
                <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-2">📎 Receipt / Invoice</label>
                {form.receiptData ? (
                  <div className="rounded-xl border p-3 flex items-center justify-between" style={{ borderColor: '#A9C1A9', background: '#F0F7F4' }}>
                    <div className="flex items-center gap-2 text-sm">
                      <span>📄</span>
                      <span className="font-medium truncate max-w-[180px]">{form.receiptName || 'Receipt uploaded'}</span>
                    </div>
                    <button onClick={() => setForm(f => ({ ...f, receiptData: undefined, receiptName: undefined }))} className="text-xs font-semibold text-red-500">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer hover:opacity-80" style={{ borderColor: '#A9C1A9' }}>
                    <span className="text-sm font-semibold" style={{ color: '#1F3A32', opacity: 0.7 }}>📎 Upload receipt (image or PDF)</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = ev => setForm(f => ({ ...f, receiptData: ev.target?.result as string, receiptName: file.name }))
                      reader.readAsDataURL(file)
                    }} />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
