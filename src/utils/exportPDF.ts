import type { Home, Item, InsurancePolicy, MaintenanceLog, Finish, Renovation, Tradesperson } from '../types'

function esc(s: string) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function section(title: string, rows: string) {
  return `
  <div class="section">
    <h2>${esc(title)}</h2>
    ${rows}
  </div>`
}

function row(label: string, value: string) {
  if (!value) return ''
  return `<div class="row"><span class="label">${esc(label)}</span><span class="value">${esc(value)}</span></div>`
}

function card(lines: string[]) {
  return `<div class="card">${lines.join('')}</div>`
}

export function generateHomeReport(params: {
  home: Home
  items: Item[]
  policies: InsurancePolicy[]
  maintenance: MaintenanceLog[]
  finishes: Finish[]
  renovations: Renovation[]
  tradespeople: Tradesperson[]
}) {
  const { home, items, policies, maintenance, finishes, renovations, tradespeople } = params
  const date = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalValue = items.reduce((s, i) => s + (parseFloat(i.purchasePrice) || 0), 0)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(home.name)} — Home Report</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; color: #3A3A3C; background: white; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; color: #1F3A32; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #888; margin-bottom: 32px; }
  h2 { font-size: 16px; font-weight: bold; color: #1F3A32; border-bottom: 2px solid #C9A86A; padding-bottom: 6px; margin-bottom: 12px; margin-top: 32px; }
  .section { margin-bottom: 24px; }
  .card { background: #F7F3EB; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; }
  .row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; border-bottom: 1px solid #E8E0D5; }
  .row:last-child { border-bottom: none; }
  .label { color: #888; min-width: 140px; }
  .value { font-weight: bold; text-align: right; max-width: 60%; word-break: break-word; }
  .card-title { font-size: 14px; font-weight: bold; color: #1F3A32; margin-bottom: 8px; }
  .stats { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat { background: #F7F3EB; border-radius: 8px; padding: 12px 20px; flex: 1; }
  .stat-val { font-size: 22px; font-weight: bold; color: #1F3A32; }
  .stat-label { font-size: 11px; color: #888; margin-top: 2px; }
  .stars { color: #F59E0B; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <h1>${esc(home.coverEmoji)} ${esc(home.name)}</h1>
  <div class="subtitle">${esc(home.address || '')} &nbsp;·&nbsp; Report generated ${date}</div>

  <div class="stats">
    <div class="stat"><div class="stat-val">${items.length}</div><div class="stat-label">Items</div></div>
    <div class="stat"><div class="stat-val">€${totalValue.toLocaleString()}</div><div class="stat-label">Inventory Value</div></div>
    <div class="stat"><div class="stat-val">${policies.length}</div><div class="stat-label">Insurance Policies</div></div>
    <div class="stat"><div class="stat-val">${renovations.length}</div><div class="stat-label">Renovations</div></div>
  </div>

  ${items.length > 0 ? section('Inventory', items.map(i => card([
    `<div class="card-title">${esc(i.name)}${i.isHighValue ? ' 💰' : ''}</div>`,
    row('Room', i.roomId),
    row('Category', i.category),
    row('Brand / Model', [i.brand, i.model].filter(Boolean).join(' ')),
    row('Serial Number', i.serialNumber),
    row('Purchase Date', i.purchaseDate ? new Date(i.purchaseDate).toLocaleDateString('en-IE') : ''),
    row('Purchase Price', i.purchasePrice ? `€${i.purchasePrice}` : ''),
    row('Warranty Expires', i.warrantyExpiry ? new Date(i.warrantyExpiry).toLocaleDateString('en-IE') : ''),
    row('Notes', i.notes),
  ])).join('')) : ''}

  ${policies.length > 0 ? section('Insurance Policies', policies.map(p => card([
    `<div class="card-title">${esc(p.type)} Insurance</div>`,
    row('Provider', p.provider),
    row('Policy Number', p.policyNumber),
    row('Renewal Date', p.renewalDate ? new Date(p.renewalDate).toLocaleDateString('en-IE') : ''),
    row('Annual Premium', p.premium ? `€${p.premium}` : ''),
    row('Notes', p.notes),
  ])).join('')) : ''}

  ${maintenance.length > 0 ? section('Maintenance Log', maintenance.map(m => card([
    `<div class="card-title">${esc(m.title)}</div>`,
    row('Category', m.category),
    row('Date', m.date ? new Date(m.date).toLocaleDateString('en-IE') : ''),
    row('Cost', m.cost ? `€${m.cost}` : ''),
    row('Next Due', m.nextDueDate ? new Date(m.nextDueDate).toLocaleDateString('en-IE') : ''),
    row('Notes', m.notes),
  ])).join('')) : ''}

  ${finishes.length > 0 ? section('Finishes & Materials', finishes.map(f => card([
    `<div class="card-title">${esc(f.type)}: ${esc(f.colourName || f.name || f.brand || '')}</div>`,
    row('Room', f.roomId),
    row('Brand', f.brand),
    row('Colour Code', f.colourCode),
    row('Product Code', f.productCode),
    row('Batch Number', f.batchNumber),
    row('Supplier', f.supplier),
    row('Qty Bought', f.quantityBought),
    row('Qty Leftover', f.quantityLeftover),
    row('Notes', f.notes),
  ])).join('')) : ''}

  ${renovations.length > 0 ? section('Renovations', renovations.map(r => card([
    `<div class="card-title">${esc(r.title)} <span style="font-weight:normal;color:#888;font-size:12px;">${esc(r.status)}</span></div>`,
    row('Dates', [r.startDate && new Date(r.startDate).toLocaleDateString('en-IE'), r.endDate && new Date(r.endDate).toLocaleDateString('en-IE')].filter(Boolean).join(' → ')),
    row('Budget', r.budget ? `€${parseFloat(r.budget).toLocaleString()}` : ''),
    row('Actual Cost', r.actualCost ? `€${parseFloat(r.actualCost).toLocaleString()}` : ''),
    row('Contractor', r.contractor),
    row('Notes', r.notes),
  ])).join('')) : ''}

  ${tradespeople.length > 0 ? section('Tradespeople', tradespeople.map(t => card([
    `<div class="card-title">${esc(t.name)} — ${esc(t.trade)} <span class="stars">${'★'.repeat(t.rating || 0)}</span></div>`,
    row('Phone', t.phone),
    row('Email', t.email),
    row('Last Used', t.lastUsed ? new Date(t.lastUsed).toLocaleDateString('en-IE') : ''),
    row('Notes', t.notes),
  ])).join('')) : ''}

</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${home.name.replace(/\s+/g, '-')}-home-report.html`
  a.click()
  URL.revokeObjectURL(url)
}
