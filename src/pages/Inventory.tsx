import { useState } from 'react'
import type { Home, Item, Room } from '../types'

const CATEGORIES = ['Appliance', 'Furniture', 'Electronics', 'Tool', 'Clothing', 'Kitchenware', 'Garden', 'Other']
const DEFAULT_ROOMS = ['Kitchen', 'Living Room', 'Master Bedroom', 'Bedroom 2', 'Bathroom', 'Garage', 'Garden', 'Attic', 'Other']

interface Props {
  home: Home
  items: Item[]
  rooms: Room[]
  onAddRoom: (r: Room) => void
  onAddItem: (i: Item) => void
  onUpdateItem: (i: Item) => void
  onDeleteItem: (id: string) => void
}

const emptyItem = (): Partial<Item> => ({
  name: '', brand: '', model: '', serialNumber: '',
  purchaseDate: '', purchasePrice: '', warrantyExpiry: '',
  category: 'Appliance', roomId: '', notes: '',
  tags: [], hasReceipt: false, hasManual: false,
  isHighValue: false, isSentimental: false,
  needsMaintenance: false, insuranceLinked: false,
})

export function Inventory({ home, items, rooms, onAddRoom, onAddItem, onUpdateItem, onDeleteItem }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [form, setForm] = useState<Partial<Item>>(emptyItem())
  const [filterRoom, setFilterRoom] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterFlag, setFilterFlag] = useState('')
  const [newRoom, setNewRoom] = useState('')
  const [showRoomInput, setShowRoomInput] = useState(false)

  const allRooms = [
    ...DEFAULT_ROOMS.filter(r => !rooms.find(r2 => r2.name === r)).map(r => ({ id: r, name: r })),
    ...rooms.filter(r => r.homeId === home.id),
  ]

  const filtered = items.filter(i => {
    if (filterRoom && i.roomId !== filterRoom) return false
    if (filterCat && i.category !== filterCat) return false
    if (filterFlag === 'highValue' && !i.isHighValue) return false
    if (filterFlag === 'needsMaintenance' && !i.needsMaintenance) return false
    if (filterFlag === 'noReceipt' && i.hasReceipt) return false
    if (filterFlag === 'insurance' && !i.insuranceLinked) return false
    if (filterFlag === 'sentimental' && !i.isSentimental) return false
    return true
  })

  const openAdd = () => { setForm(emptyItem()); setEditItem(null); setShowForm(true); setSelectedItem(null) }
  const openEdit = (item: Item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); setSelectedItem(null) }

  const handleSave = () => {
    if (!form.name) return
    if (editItem) {
      onUpdateItem({ ...editItem, ...form } as Item)
    } else {
      onAddItem({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as Item)
    }
    setShowForm(false); setEditItem(null)
  }

  const handleAddRoom = () => {
    if (!newRoom) return
    onAddRoom({ id: crypto.randomUUID(), homeId: home.id, name: newRoom, icon: '🚪' })
    setNewRoom(''); setShowRoomInput(false)
  }

  const roomName = (id: string) => allRooms.find(r => r.id === id)?.name || id || '—'

  if (selectedItem) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setSelectedItem(null)} className="text-sm mb-6 flex items-center gap-1 opacity-60 hover:opacity-100">← Back to Inventory</button>
      <div className="rounded-2xl p-6 shadow-sm" style={{background:'white', border:'1px solid #E8E0D5'}}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{color:'#1F3A32'}}>{selectedItem.name}</h2>
            <p className="text-sm opacity-60">{selectedItem.brand} {selectedItem.model}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEdit(selectedItem)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:'#F0F7F4', color:'#1F3A32'}}>Edit</button>
            <button onClick={() => { onDeleteItem(selectedItem.id); setSelectedItem(null) }} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:'#FFF0F0', color:'#6A1E2C'}}>Delete</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          {[
            ['Room', roomName(selectedItem.roomId)],
            ['Category', selectedItem.category],
            ['Purchase Date', selectedItem.purchaseDate || '—'],
            ['Purchase Price', selectedItem.purchasePrice ? `€${selectedItem.purchasePrice}` : '—'],
            ['Warranty Expires', selectedItem.warrantyExpiry || '—'],
            ['Serial Number', selectedItem.serialNumber || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-0.5">{k}</div>
              <div className="font-medium">{v}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedItem.isHighValue && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:'#FEF3C7', color:'#92400E'}}>💰 High Value</span>}
          {selectedItem.hasReceipt && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:'#D1FAE5', color:'#065F46'}}>✅ Receipt</span>}
          {selectedItem.hasManual && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:'#DBEAFE', color:'#1E40AF'}}>📄 Manual</span>}
          {selectedItem.insuranceLinked && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:'#EDE9FE', color:'#5B21B6'}}>🛡️ Insured</span>}
          {selectedItem.needsMaintenance && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:'#FEE2E2', color:'#991B1B'}}>🔧 Needs Service</span>}
          {selectedItem.isSentimental && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:'#FCE7F3', color:'#9D174D'}}>💛 Sentimental</span>}
        </div>
        {selectedItem.notes && <p className="text-sm opacity-70 italic">{selectedItem.notes}</p>}

        {/* Product link */}
        {selectedItem.productUrl && (
          <div className="mt-4 pt-4 border-t" style={{borderColor:'#F0EBE3'}}>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Product Link</div>
            <a href={selectedItem.productUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl p-3 border hover:opacity-80 transition-opacity"
              style={{borderColor:'#E8E0D5', background:'#F7F3EB'}}>
              <span className="text-xl">🔗</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{color:'#1F3A32'}}>{selectedItem.productUrl.replace(/^https?:\/\//, '').split('/')[0]}</div>
                <div className="text-xs opacity-50 truncate">{selectedItem.productUrl}</div>
              </div>
              <span className="text-xs font-semibold opacity-50">Open ↗</span>
            </a>
          </div>
        )}

        {/* Receipt viewer */}
        {selectedItem.receiptData ? (
          <div className="mt-4 pt-4 border-t" style={{borderColor:'#F0EBE3'}}>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Receipt</div>
            {selectedItem.receiptData.startsWith('data:image') ? (
              <img src={selectedItem.receiptData} alt="Receipt" className="rounded-xl w-full max-h-80 object-contain border" style={{borderColor:'#E8E0D5'}} />
            ) : (
              <a href={selectedItem.receiptData} download={selectedItem.receiptName || 'receipt.pdf'} className="flex items-center gap-3 rounded-xl p-3 border" style={{borderColor:'#A9C1A9', background:'#F0F7F4'}}>
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-sm font-semibold" style={{color:'#1F3A32'}}>{selectedItem.receiptName || 'receipt.pdf'}</div>
                  <div className="text-xs opacity-50">Tap to download</div>
                </div>
              </a>
            )}
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t" style={{borderColor:'#F0EBE3'}}>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Receipt</div>
            <p className="text-xs opacity-40 italic">No receipt uploaded — edit item to add one</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{color:'#1F3A32'}}>Inventory</h2>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:'#1F3A32'}}>+ Add Item</button>
      </div>

      {/* Room cost summary */}
      {items.some(i => i.purchasePrice) && (() => {
        const roomTotals = allRooms.map(r => ({
          name: r.name,
          count: items.filter(i => i.roomId === r.id && i.purchasePrice).length,
          total: items.filter(i => i.roomId === r.id).reduce((s, i) => s + (parseFloat(i.purchasePrice) || 0), 0),
        })).filter(r => r.total > 0)
        const grandTotal = items.reduce((s, i) => s + (parseFloat(i.purchasePrice) || 0), 0)
        return roomTotals.length > 0 ? (
          <div className="rounded-2xl p-5 shadow-sm mb-6" style={{background:'white', border:'1px solid #E8E0D5'}}>
            <h3 className="font-semibold text-sm mb-4" style={{color:'#1F3A32'}}>💰 Cost by Room</h3>
            <div className="space-y-2">
              {roomTotals.map(r => (
                <div key={r.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs opacity-40">{r.count} item{r.count !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="font-bold" style={{color:'#1F3A32'}}>€{r.total.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t font-bold" style={{borderColor:'#E8E0D5'}}>
                <span>Total</span>
                <span style={{color:'#C9A86A'}}>€{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : null
      })()}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{borderColor:'#E8E0D5'}}>
          <option value="">All Rooms</option>
          {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{borderColor:'#E8E0D5'}}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterFlag} onChange={e => setFilterFlag(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{borderColor:'#E8E0D5'}}>
          <option value="">All Items</option>
          <option value="highValue">💰 High Value</option>
          <option value="needsMaintenance">🔧 Needs Service</option>
          <option value="noReceipt">⚠️ Missing Receipt</option>
          <option value="insurance">🛡️ Insured</option>
          <option value="sentimental">💛 Sentimental</option>
        </select>
        <span className="text-xs opacity-50 self-center">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Item list */}
      {filtered.length === 0 && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm">No items yet — add your first one</p>
        </div>
      )}
      <div className="space-y-2">
        {filtered.map(item => (
          <button key={item.id} onClick={() => setSelectedItem(item)}
            className="w-full text-left rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            style={{background:'white', border:'1px solid #E8E0D5'}}
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{color:'#1F3A32'}}>{item.name}</div>
              <div className="text-xs opacity-50 mt-0.5">{roomName(item.roomId)} · {item.category}{item.purchasePrice ? ` · €${item.purchasePrice}` : ''}</div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {item.isHighValue && <span title="High Value">💰</span>}
              {!item.hasReceipt && <span title="Missing receipt">⚠️</span>}
              {item.needsMaintenance && <span title="Needs service">🔧</span>}
              {item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date(Date.now() + 60*24*60*60*1000) && new Date(item.warrantyExpiry) > new Date() && <span title="Warranty expiring">📋</span>}
            </div>
            <span className="opacity-30 text-lg">›</span>
          </button>
        ))}
      </div>

      {/* Add Item Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{background:'white'}}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{color:'#1F3A32'}}>{editItem ? 'Edit Item' : 'Add Item'}</h3>
            <div className="space-y-3">
              <input placeholder="Item name *" value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Brand" value={form.brand || ''} onChange={e => setForm(f => ({...f, brand: e.target.value}))} className="border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
                <input placeholder="Model" value={form.model || ''} onChange={e => setForm(f => ({...f, model: e.target.value}))} className="border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category || 'Appliance'} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={form.roomId || ''} onChange={e => setForm(f => ({...f, roomId: e.target.value}))} className="border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}}>
                  <option value="">Select room</option>
                  {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              {!showRoomInput
                ? <button onClick={() => setShowRoomInput(true)} className="text-xs font-semibold" style={{color:'#C9A86A'}}>+ Add custom room</button>
                : <div className="flex gap-2"><input placeholder="Room name" value={newRoom} onChange={e => setNewRoom(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm" style={{borderColor:'#E8E0D5'}} /><button onClick={handleAddRoom} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:'#1F3A32'}}>Add</button></div>
              }
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs opacity-50 block mb-1">Purchase Date</label><input type="date" value={form.purchaseDate || ''} onChange={e => setForm(f => ({...f, purchaseDate: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
                <div><label className="text-xs opacity-50 block mb-1">Purchase Price (€)</label><input type="number" placeholder="0" value={form.purchasePrice || ''} onChange={e => setForm(f => ({...f, purchasePrice: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs opacity-50 block mb-1">Warranty Expires</label><input type="date" value={form.warrantyExpiry || ''} onChange={e => setForm(f => ({...f, warrantyExpiry: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
                <div><label className="text-xs opacity-50 block mb-1">Serial Number</label><input placeholder="SN..." value={form.serialNumber || ''} onChange={e => setForm(f => ({...f, serialNumber: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} /></div>
              </div>
              <textarea placeholder="Notes..." value={form.notes || ''} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{borderColor:'#E8E0D5'}} />

              <div>
                <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-1">🔗 Product Link</label>
                <input placeholder="https://www.amazon.co.uk/..." value={form.productUrl || ''} onChange={e => setForm(f => ({...f, productUrl: e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{borderColor:'#E8E0D5'}} />
              </div>

              {/* Receipt upload */}
              <div>
                <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-2">📎 Receipt / Invoice</label>
                {form.receiptData ? (
                  <div className="rounded-xl border p-3 flex items-center justify-between" style={{borderColor:'#A9C1A9', background:'#F0F7F4'}}>
                    <div className="flex items-center gap-2 text-sm">
                      <span>📄</span>
                      <span className="font-medium truncate max-w-[180px]">{form.receiptName || 'Receipt uploaded'}</span>
                    </div>
                    <div className="flex gap-2">
                      {form.receiptData.startsWith('data:image') && (
                        <a href={form.receiptData} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{color:'#1F3A32'}}>View</a>
                      )}
                      <button onClick={() => setForm(f => ({...f, receiptData: undefined, receiptName: undefined, hasReceipt: false}))} className="text-xs font-semibold text-red-500">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer hover:opacity-80 transition-opacity" style={{borderColor:'#C9A86A'}}>
                    <span className="text-sm font-semibold" style={{color:'#C9A86A'}}>📎 Upload receipt (image or PDF)</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = ev => setForm(f => ({...f, receiptData: ev.target?.result as string, receiptName: file.name, hasReceipt: true}))
                      reader.readAsDataURL(file)
                    }} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {([
                  ['hasReceipt', '✅ Has receipt'],
                  ['hasManual', '📄 Has manual'],
                  ['isHighValue', '💰 High value'],
                  ['isSentimental', '💛 Sentimental'],
                  ['needsMaintenance', '🔧 Needs service'],
                  ['insuranceLinked', '🛡️ Insurance linked'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.checked}))} className="rounded" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:'#E8E0D5'}}>Cancel</button>
                <button onClick={handleSave} disabled={!form.name} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:'#1F3A32'}}>Save Item</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
