import { useState, useRef } from 'react'
import type { Home, Renovation, RenovationDoc, BudgetLine } from '../types'

const STATUSES = ['Planning', 'In Progress', 'Complete', 'On Hold'] as const
const DOC_CATEGORIES = ['Plan', 'Invoice', 'Agreement', 'Quote', 'Permit', 'Photo', 'Other'] as const

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  'Planning':    { bg: '#EFF6FF', color: '#1D4ED8', dot: '#93C5FD' },
  'In Progress': { bg: '#FFFBEB', color: '#92400E', dot: '#FCD34D' },
  'Complete':    { bg: '#F0FDF4', color: '#166534', dot: '#86EFAC' },
  'On Hold':     { bg: '#F9FAFB', color: '#374151', dot: '#D1D5DB' },
}

const DOC_ICONS: Record<string, string> = {
  Plan: '📐', Invoice: '🧾', Agreement: '📝', Quote: '💬',
  Permit: '📋', Photo: '📷', Other: '📎',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface Props {
  home: Home
  renovations: Renovation[]
  onAddRenovation: (r: Renovation) => void
  onUpdateRenovation: (r: Renovation) => void
}

const BUDGET_CATEGORIES = [
  'Labour', 'Materials', 'Concrete & Groundworks', 'Insulation', 'Roofing',
  'Electrical', 'Plumbing', 'Tiling', 'Flooring', 'Plastering', 'Painting',
  'Windows & Doors', 'Joinery & Fit-Out', 'Landscaping', 'Fees & Permits', 'Other'
]

const emptyLine = (): Omit<BudgetLine, 'id'> => ({
  description: '', category: 'Materials', estimated: '', actual: '', paid: false, supplier: '', notes: ''
})

const emptyRenovation = (): Partial<Renovation> => ({
  title: '', description: '', status: 'Planning',
  startDate: '', endDate: '', budget: '', actualCost: '',
  contractor: '', notes: '', documents: [], budgetLines: []
})

export function Renovations({ home, renovations, onAddRenovation, onUpdateRenovation }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Renovation | null>(null)
  const [selected, setSelected] = useState<Renovation | null>(null)
  const [form, setForm] = useState<Partial<Renovation>>(emptyRenovation())
  const [uploading, setUploading] = useState(false)
  const [docCategory, setDocCategory] = useState<RenovationDoc['category']>('Invoice')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLineForm, setShowLineForm] = useState(false)
  const [editLine, setEditLine] = useState<BudgetLine | null>(null)
  const [lineForm, setLineForm] = useState<Omit<BudgetLine, 'id'>>(emptyLine())

  const openAdd = () => { setForm(emptyRenovation()); setEditItem(null); setShowForm(true); setSelected(null) }
  const openEdit = (r: Renovation) => { setForm({ ...r }); setEditItem(r); setShowForm(true); setSelected(null) }

  const handleSave = () => {
    if (!form.title) return
    if (editItem) {
      const updated = { ...editItem, ...form } as Renovation
      onUpdateRenovation(updated)
      setSelected(updated)
    } else {
      onAddRenovation({ ...form, id: crypto.randomUUID(), homeId: home.id, documents: [], budgetLines: [], createdAt: new Date().toISOString() } as Renovation)
    }
    setShowForm(false); setEditItem(null)
  }

  // Upload a document to the selected renovation
  const handleFileUpload = (files: FileList | null) => {
    if (!files || !selected) return
    setUploading(true)
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
      const doc: RenovationDoc = {
        id: crypto.randomUUID(),
        name: file.name,
        category: docCategory,
        data: ev.target?.result as string,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }
      const updated: Renovation = {
        ...selected,
        documents: [...(selected.documents || []), doc],
      }
      onUpdateRenovation(updated)
      setSelected(updated)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteDoc = (docId: string) => {
    if (!selected) return
    const updated: Renovation = {
      ...selected,
      documents: selected.documents.filter(d => d.id !== docId),
    }
    onUpdateRenovation(updated)
    setSelected(updated)
  }

  const handleSaveLine = () => {
    if (!lineForm.description) return
    const lines = selected?.budgetLines || []
    const newLines = editLine
      ? lines.map(l => l.id === editLine.id ? { ...editLine, ...lineForm } : l)
      : [...lines, { ...lineForm, id: crypto.randomUUID() }]
    const updated = { ...selected!, budgetLines: newLines }
    // Auto-update actualCost from sum of actual lines
    const totalActual = newLines.reduce((s, l) => s + (parseFloat(l.actual) || 0), 0)
    updated.actualCost = totalActual > 0 ? String(totalActual) : updated.actualCost
    onUpdateRenovation(updated)
    setSelected(updated)
    setShowLineForm(false); setEditLine(null); setLineForm(emptyLine())
  }

  const handleDeleteLine = (lineId: string) => {
    if (!selected) return
    const newLines = selected.budgetLines.filter(l => l.id !== lineId)
    const updated = { ...selected, budgetLines: newLines }
    onUpdateRenovation(updated)
    setSelected(updated)
  }

  const handleTogglePaid = (lineId: string) => {
    if (!selected) return
    const newLines = selected.budgetLines.map(l => l.id === lineId ? { ...l, paid: !l.paid } : l)
    const updated = { ...selected, budgetLines: newLines }
    onUpdateRenovation(updated)
    setSelected(updated)
  }

  const totalBudget = renovations.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0)
  const totalSpent = renovations.reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0)

  // Detail view
  if (selected) {
    const docs = selected.documents || []
    const grouped = DOC_CATEGORIES.reduce((acc, cat) => {
      const items = docs.filter(d => d.category === cat)
      if (items.length) acc[cat] = items
      return acc
    }, {} as Record<string, RenovationDoc[]>)

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setSelected(null)} className="text-sm mb-6 flex items-center gap-1 opacity-60 hover:opacity-100">← Back to Renovations</button>

        <div className="rounded-2xl p-6 shadow-sm mb-4" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>{selected.title}</h2>
              {selected.description && <p className="text-sm opacity-60 mt-1">{selected.description}</p>}
            </div>
            <button onClick={() => openEdit(selected)} className="px-3 py-1.5 rounded-lg text-xs font-semibold ml-4" style={{ background: '#F0F7F4', color: '#1F3A32' }}>Edit</button>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: STATUS_STYLES[selected.status].bg, color: STATUS_STYLES[selected.status].color }}>
            <div className="w-2 h-2 rounded-full" style={{ background: STATUS_STYLES[selected.status].dot }}></div>
            {selected.status}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {[
              ['Start Date', selected.startDate ? new Date(selected.startDate).toLocaleDateString('en-IE') : '—'],
              ['End Date', selected.endDate ? new Date(selected.endDate).toLocaleDateString('en-IE') : '—'],
              ['Budget', selected.budget ? `€${parseFloat(selected.budget).toLocaleString()}` : '—'],
              ['Actual Cost', selected.actualCost ? `€${parseFloat(selected.actualCost).toLocaleString()}` : '—'],
              ['Contractor', selected.contractor || '—'],
              ['Documents', `${docs.length} file${docs.length !== 1 ? 's' : ''}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs opacity-50 font-semibold uppercase tracking-wide mb-0.5">{k}</div>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>

          {selected.budget && selected.actualCost && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: '#F7F3EB' }}>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>Budget: €{parseFloat(selected.budget).toLocaleString()}</span>
                <span className={parseFloat(selected.actualCost) > parseFloat(selected.budget) ? 'text-red-600' : 'text-green-700'}>
                  Spent: €{parseFloat(selected.actualCost).toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#E8E0D5' }}>
                <div className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (parseFloat(selected.actualCost) / parseFloat(selected.budget)) * 100)}%`,
                    background: parseFloat(selected.actualCost) > parseFloat(selected.budget) ? '#EF4444' : '#1F3A32'
                  }} />
              </div>
            </div>
          )}

          {selected.notes && <p className="text-sm opacity-70 italic">{selected.notes}</p>}
        </div>

        {/* Budget Lines */}
        <div className="rounded-2xl p-6 shadow-sm mb-4" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: '#1F3A32' }}>💰 Budget Breakdown</h3>
            <button onClick={() => { setLineForm(emptyLine()); setEditLine(null); setShowLineForm(true) }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: '#1F3A32' }}>
              + Add Line
            </button>
          </div>

          {/* Totals bar */}
          {(selected.budgetLines?.length || 0) > 0 && (() => {
            const lines = selected.budgetLines || []
            const estTotal = lines.reduce((s, l) => s + (parseFloat(l.estimated) || 0), 0)
            const actTotal = lines.reduce((s, l) => s + (parseFloat(l.actual) || 0), 0)
            const paidTotal = lines.filter(l => l.paid).reduce((s, l) => s + (parseFloat(l.actual) || parseFloat(l.estimated) || 0), 0)
            return (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  ['Estimated', `€${estTotal.toLocaleString()}`, '#1F3A32'],
                  ['Actual', `€${actTotal.toLocaleString()}`, actTotal > estTotal && estTotal > 0 ? '#EF4444' : '#C9A86A'],
                  ['Paid', `€${paidTotal.toLocaleString()}`, '#166534'],
                ].map(([l, v, c]) => (
                  <div key={l} className="rounded-xl p-3 text-center" style={{ background: '#F7F3EB' }}>
                    <div className="text-xs opacity-50 mb-0.5">{l}</div>
                    <div className="font-bold text-sm" style={{ color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Group by category */}
          {(selected.budgetLines?.length || 0) === 0 ? (
            <div className="text-center py-8 opacity-40">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm">No budget lines yet</p>
              <p className="text-xs mt-1">e.g. Concrete €2,400 · Insulation €1,800</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-1 text-xs font-semibold opacity-40 uppercase tracking-wide px-2 mb-1">
                <div className="col-span-4">Item</div>
                <div className="col-span-2 text-right">Est.</div>
                <div className="col-span-2 text-right">Actual</div>
                <div className="col-span-2 text-center">Paid</div>
                <div className="col-span-2"></div>
              </div>
              {(selected.budgetLines || []).map(line => (
                <div key={line.id} className={`grid grid-cols-12 gap-1 items-center px-2 py-2 rounded-lg text-sm ${line.paid ? 'opacity-60' : ''}`}
                  style={{ background: line.paid ? '#F0FDF4' : '#F7F3EB' }}>
                  <div className="col-span-4 min-w-0">
                    <div className={`font-medium text-xs truncate ${line.paid ? 'line-through' : ''}`} style={{ color: '#1F3A32' }}>{line.description}</div>
                    <div className="text-xs opacity-40 truncate">{line.category}</div>
                  </div>
                  <div className="col-span-2 text-right text-xs font-medium opacity-70">
                    {line.estimated ? `€${parseFloat(line.estimated).toLocaleString()}` : '—'}
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold" style={{ color: line.actual && line.estimated && parseFloat(line.actual) > parseFloat(line.estimated) ? '#EF4444' : '#1F3A32' }}>
                    {line.actual ? `€${parseFloat(line.actual).toLocaleString()}` : '—'}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button onClick={() => handleTogglePaid(line.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${line.paid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                      {line.paid ? '✓' : ''}
                    </button>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <button onClick={() => { setLineForm({ description: line.description, category: line.category, estimated: line.estimated, actual: line.actual, paid: line.paid, supplier: line.supplier, notes: line.notes }); setEditLine(line); setShowLineForm(true) }}
                      className="text-xs px-1.5 py-1 rounded opacity-60 hover:opacity-100" style={{ background: '#E8E0D5' }}>✏️</button>
                    <button onClick={() => handleDeleteLine(line.id)}
                      className="text-xs px-1.5 py-1 rounded opacity-60 hover:opacity-100" style={{ background: '#FEE2E2' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget line form modal */}
        {showLineForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'white' }}>
              <h3 className="font-semibold text-base mb-4" style={{ color: '#1F3A32' }}>{editLine ? 'Edit Budget Line' : 'Add Budget Line'}</h3>
              <div className="space-y-3">
                <input placeholder="Description * (e.g. Concrete, Insulation, Labour)" value={lineForm.description} onChange={e => setLineForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} autoFocus />
                <select value={lineForm.category} onChange={e => setLineForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }}>
                  {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs opacity-50 block mb-1">Estimated (€)</label><input type="number" placeholder="0" value={lineForm.estimated} onChange={e => setLineForm(f => ({ ...f, estimated: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
                  <div><label className="text-xs opacity-50 block mb-1">Actual (€)</label><input type="number" placeholder="0" value={lineForm.actual} onChange={e => setLineForm(f => ({ ...f, actual: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
                </div>
                <input placeholder="Supplier / Contractor" value={lineForm.supplier} onChange={e => setLineForm(f => ({ ...f, supplier: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={lineForm.paid} onChange={e => setLineForm(f => ({ ...f, paid: e.target.checked }))} className="rounded" />
                  Mark as paid
                </label>
                <textarea placeholder="Notes..." value={lineForm.notes} onChange={e => setLineForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{ borderColor: '#E8E0D5' }} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setShowLineForm(false); setEditLine(null) }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
                  <button onClick={handleSaveLine} disabled={!lineForm.description} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#1F3A32' }}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents section */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-sm" style={{ color: '#1F3A32' }}>📁 Documents</h3>
            <span className="text-xs opacity-50">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Upload area */}
          <div className="mb-5 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: '#C9A86A' }}>
            <div className="flex items-center gap-2 mb-3">
              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value as RenovationDoc['category'])}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
                style={{ borderColor: '#E8E0D5' }}
              >
                {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <label className="flex-1">
                <div className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: '#1F3A32' }}>
                  {uploading ? '⏳ Uploading...' : '📎 Upload file'}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.dwg"
                  className="hidden"
                  onChange={e => handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs opacity-40 text-center">PDF, images, Word, Excel, DWG plans supported</p>
          </div>

          {/* Document list grouped by category */}
          {docs.length === 0 ? (
            <div className="text-center py-8 opacity-40">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm">No documents uploaded yet</p>
              <p className="text-xs mt-1">Upload plans, invoices, agreements, permits</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([cat, catDocs]) => (
                <div key={cat}>
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">
                    {DOC_ICONS[cat]} {cat}
                  </h4>
                  <div className="space-y-2">
                    {catDocs.map(doc => {
                      const isImage = doc.data.startsWith('data:image')
                      const isPdf = doc.data.startsWith('data:application/pdf')
                      return (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F7F3EB', border: '1px solid #E8E0D5' }}>
                          {isImage ? (
                            <img src={doc.data} alt={doc.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#E8E0D5' }}>
                              {isPdf ? '📄' : DOC_ICONS[doc.category]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: '#1F3A32' }}>{doc.name}</div>
                            <div className="text-xs opacity-50">
                              {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString('en-IE')}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <a
                              href={doc.data}
                              download={doc.name}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                              style={{ background: '#F0F7F4', color: '#1F3A32' }}
                            >
                              ↓
                            </a>
                            {isImage && (
                              <a
                                href={doc.data}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                                style={{ background: '#F0F7F4', color: '#1F3A32' }}
                              >
                                👁
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                              style={{ background: '#FFF0F0', color: '#6A1E2C' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

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
            <div className={`text-xl font-bold`} style={{ color: totalSpent > totalBudget && totalBudget > 0 ? '#EF4444' : '#C9A86A' }}>€{totalSpent.toLocaleString()}</div>
          </div>
        </div>
      )}

      {renovations.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">🏗️</div>
          <p className="text-sm">No renovation projects yet</p>
          <p className="text-xs mt-1">Track budgets, timelines, contractors and upload all documents</p>
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
                    <div className="flex items-center gap-2">
                      {(r.documents?.length || 0) > 0 && (
                        <span className="text-xs opacity-50">📁 {r.documents.length}</span>
                      )}
                      <div className="text-xs font-semibold opacity-60">{r.budget ? `€${parseFloat(r.budget).toLocaleString()}` : ''}</div>
                    </div>
                  </div>
                  {r.contractor && <div className="text-xs opacity-50 mt-0.5">👷 {r.contractor}</div>}
                  {r.startDate && <div className="text-xs opacity-50 mt-0.5">📅 {new Date(r.startDate).toLocaleDateString('en-IE')}{r.endDate ? ` → ${new Date(r.endDate).toLocaleDateString('en-IE')}` : ''}</div>}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Add/Edit form modal */}
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
              <p className="text-xs opacity-50 italic">💡 Documents can be uploaded after saving the project</p>
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
