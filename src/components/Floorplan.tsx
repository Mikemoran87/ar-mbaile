import { useState, useRef, useCallback } from 'react'
import type { Room, Item, Finish } from '../types'

const COLS = 20
const ROWS = 14
const CELL = 32

const ROOM_COLORS = [
  '#D1E8D5', '#D1E0F0', '#F0E8D1', '#E8D1D1',
  '#D1E8E8', '#E8E2D1', '#E2D1E8', '#D1E8D8',
]

const GROUND_DEFAULTS: Omit<Room, 'id' | 'homeId'>[] = [
  { name: 'Kitchen',       icon: '🍳', floor: 0, fx: 0,  fy: 0,  fw: 6, fh: 5, fcolor: ROOM_COLORS[0] },
  { name: 'Living Room',   icon: '🛋️', floor: 0, fx: 6,  fy: 0,  fw: 8, fh: 7, fcolor: ROOM_COLORS[1] },
  { name: 'Dining Room',   icon: '🍽️', floor: 0, fx: 14, fy: 0,  fw: 6, fh: 5, fcolor: ROOM_COLORS[2] },
  { name: 'Hallway',       icon: '🚪', floor: 0, fx: 0,  fy: 5,  fw: 6, fh: 4, fcolor: ROOM_COLORS[6] },
  { name: 'Utility Room',  icon: '🧺', floor: 0, fx: 14, fy: 5,  fw: 6, fh: 4, fcolor: ROOM_COLORS[7] },
  { name: 'WC',            icon: '🚿', floor: 0, fx: 6,  fy: 7,  fw: 4, fh: 3, fcolor: ROOM_COLORS[4] },
  { name: 'Study',         icon: '📚', floor: 0, fx: 10, fy: 7,  fw: 4, fh: 3, fcolor: ROOM_COLORS[5] },
  { name: 'Garage',        icon: '🚗', floor: 0, fx: 0,  fy: 9,  fw: 6, fh: 5, fcolor: ROOM_COLORS[3] },
]

const FIRST_DEFAULTS: Omit<Room, 'id' | 'homeId'>[] = [
  { name: 'Master Bedroom', icon: '🛏️', floor: 1, fx: 0,  fy: 0,  fw: 7, fh: 6, fcolor: ROOM_COLORS[3] },
  { name: 'En Suite',       icon: '🛁', floor: 1, fx: 7,  fy: 0,  fw: 4, fh: 4, fcolor: ROOM_COLORS[4] },
  { name: 'Bedroom 2',      icon: '🛏️', floor: 1, fx: 11, fy: 0,  fw: 5, fh: 6, fcolor: ROOM_COLORS[5] },
  { name: 'Bedroom 3',      icon: '🛏️', floor: 1, fx: 16, fy: 0,  fw: 4, fh: 6, fcolor: ROOM_COLORS[0] },
  { name: 'Bathroom',       icon: '🚿', floor: 1, fx: 0,  fy: 6,  fw: 6, fh: 5, fcolor: ROOM_COLORS[1] },
  { name: 'Landing',        icon: '🪜', floor: 1, fx: 6,  fy: 6,  fw: 6, fh: 5, fcolor: ROOM_COLORS[2] },
  { name: 'Bedroom 4',      icon: '🛏️', floor: 1, fx: 12, fy: 6,  fw: 8, fh: 5, fcolor: ROOM_COLORS[7] },
]

interface Props {
  rooms: Room[]
  items: Item[]
  finishes: Finish[]
  onUpdateRoom: (r: Room) => void
  onAddRoom: (r: Room) => void
  onDeleteRoom?: (id: string) => void
  homeId: string
  onSelectRoom?: (roomId: string, tab: 'inventory' | 'finishes') => void
}

interface DragState { roomId: string; startX: number; startY: number; origFx: number; origFy: number }
interface ResizeState { roomId: string; startX: number; startY: number; origFw: number; origFh: number }

export function Floorplan({ rooms, items, finishes, onUpdateRoom, onAddRoom, onDeleteRoom, homeId, onSelectRoom }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [activeFloor, setActiveFloor] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [popup, setPopup] = useState<string | null>(null)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [measureRoom, setMeasureRoom] = useState<Room | null>(null)
  const [measureW, setMeasureW] = useState('')
  const [measureL, setMeasureL] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const resizeRef = useRef<ResizeState | null>(null)

  const hasFirstFloor = rooms.some(r => r.floor === 1 && r.fx !== undefined)
  const floorRooms = rooms.filter(r => r.fx !== undefined && (r.floor ?? 0) === activeFloor)

  const handleSeedDefaults = () => {
    const defaults = activeFloor === 0 ? GROUND_DEFAULTS : FIRST_DEFAULTS
    defaults.forEach(dr => {
      const exists = rooms.find(r => r.name === dr.name && (r.floor ?? 0) === activeFloor)
      if (exists) {
        onUpdateRoom({ ...exists, ...dr })
      } else {
        onAddRoom({ ...dr, id: crypto.randomUUID(), homeId })
      }
    })
  }

  const getSvgPos = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { col: 0, row: 0 }
    const rect = svg.getBoundingClientRect()
    const scaleX = (COLS * CELL) / rect.width
    const scaleY = (ROWS * CELL) / rect.height
    return {
      col: Math.floor(((clientX - rect.left) * scaleX) / CELL),
      row: Math.floor(((clientY - rect.top) * scaleY) / CELL),
    }
  }

  const onMouseDown = useCallback((e: React.MouseEvent, roomId: string, type: 'drag' | 'resize') => {
    if (!editMode) return
    e.preventDefault()
    const room = rooms.find(r => r.id === roomId)!
    const { col, row } = getSvgPos(e.clientX, e.clientY)
    if (type === 'drag') {
      dragRef.current = { roomId, startX: col, startY: row, origFx: room.fx!, origFy: room.fy! }
    } else {
      resizeRef.current = { roomId, startX: col, startY: row, origFw: room.fw!, origFh: room.fh! }
    }
    setSelected(roomId)
  }, [editMode, rooms])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragRef.current) {
      const { col, row } = getSvgPos(e.clientX, e.clientY)
      const dx = col - dragRef.current.startX
      const dy = row - dragRef.current.startY
      const room = rooms.find(r => r.id === dragRef.current!.roomId)!
      onUpdateRoom({ ...room, fx: Math.max(0, Math.min(COLS - (room.fw || 4), dragRef.current.origFx + dx)), fy: Math.max(0, Math.min(ROWS - (room.fh || 3), dragRef.current.origFy + dy)) })
    }
    if (resizeRef.current) {
      const { col, row } = getSvgPos(e.clientX, e.clientY)
      const room = rooms.find(r => r.id === resizeRef.current!.roomId)!
      onUpdateRoom({ ...room, fw: Math.max(2, Math.min(COLS - (room.fx || 0), resizeRef.current.origFw + (col - resizeRef.current.startX))), fh: Math.max(2, Math.min(ROWS - (room.fy || 0), resizeRef.current.origFh + (row - resizeRef.current.startY))) })
    }
  }, [rooms, onUpdateRoom])

  const onMouseUp = useCallback(() => { dragRef.current = null; resizeRef.current = null }, [])

  const handleRoomClick = (roomId: string) => {
    if (editMode) { setSelected(roomId); return }
    setPopup(popup === roomId ? null : roomId)
  }

  const handleAddRoom = () => {
    if (!newRoomName) return
    onAddRoom({ id: crypto.randomUUID(), homeId, name: newRoomName, icon: '🚪', floor: activeFloor, fx: 0, fy: 0, fw: 4, fh: 3, fcolor: ROOM_COLORS[floorRooms.length % ROOM_COLORS.length] })
    setNewRoomName(''); setShowAddRoom(false)
  }

  const openMeasure = (room: Room) => {
    setMeasureRoom(room)
    setMeasureW(room.widthM ? String(room.widthM) : '')
    setMeasureL(room.lengthM ? String(room.lengthM) : '')
  }

  const saveMeasure = () => {
    if (!measureRoom) return
    onUpdateRoom({ ...measureRoom, widthM: measureW ? parseFloat(measureW) : undefined, lengthM: measureL ? parseFloat(measureL) : undefined })
    setMeasureRoom(null)
  }

  const W = COLS * CELL
  const H = ROWS * CELL

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#F0EBE3' }}>
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm" style={{ color: '#1F3A32' }}>🗺️ Floorplan</h3>
          {/* Floor tabs */}
          <div className="flex gap-1">
            {[{ label: 'Ground', floor: 0 }, { label: '1st Floor', floor: 1 }].map(f => (
              <button key={f.floor} onClick={() => setActiveFloor(f.floor)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${activeFloor === f.floor ? 'text-white' : 'opacity-50 hover:opacity-80'}`}
                style={{ background: activeFloor === f.floor ? '#1F3A32' : '#F0F7F4', color: activeFloor === f.floor ? 'white' : '#1F3A32' }}>
                {f.label}
                {f.floor === 1 && hasFirstFloor && <span className="ml-1 opacity-60">·</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode && <button onClick={() => setShowAddRoom(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: '#C9A86A', color: '#C9A86A' }}>+ Room</button>}
          {floorRooms.length === 0 && (
            <button onClick={handleSeedDefaults} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F0F7F4', color: '#1F3A32' }}>
              Load {activeFloor === 0 ? 'ground' : '1st'} floor
            </button>
          )}
          <button onClick={() => { setEditMode(!editMode); setSelected(null); setPopup(null) }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: editMode ? '#1F3A32' : '#F0F7F4', color: editMode ? 'white' : '#1F3A32' }}>
            {editMode ? '✓ Done' : '✏️ Edit'}
          </button>
        </div>
      </div>

      {/* SVG */}
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', maxHeight: '320px', cursor: editMode ? 'crosshair' : 'default', display: 'block' }}
          onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          <rect x={0} y={0} width={W} height={H} fill="#F7F3EB" />
          {editMode && (
            <g opacity="0.12">
              {Array.from({ length: COLS + 1 }, (_, i) => <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={H} stroke="#1F3A32" strokeWidth="0.5" />)}
              {Array.from({ length: ROWS + 1 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * CELL} x2={W} y2={i * CELL} stroke="#1F3A32" strokeWidth="0.5" />)}
            </g>
          )}

          {floorRooms.map(room => {
            const x = (room.fx || 0) * CELL, y = (room.fy || 0) * CELL
            const w = (room.fw || 4) * CELL, h = (room.fh || 3) * CELL
            const roomItems = items.filter(i => i.roomId === room.id)
            const roomFinishes = finishes.filter(f => f.roomId === room.id)
            const isSelected = selected === room.id
            const isPopup = popup === room.id
            const hasMeasures = room.widthM && room.lengthM

            return (
              <g key={room.id}>
                <rect x={x+2} y={y+2} width={w-4} height={h-4} rx={6} ry={6}
                  fill={room.fcolor || ROOM_COLORS[0]}
                  stroke={isSelected ? '#1F3A32' : '#C9A86A'} strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ cursor: editMode ? 'move' : 'pointer' }}
                  onMouseDown={e => onMouseDown(e, room.id, 'drag')}
                  onClick={() => handleRoomClick(room.id)} />

                <text x={x+w/2} y={y+h/2 - (roomItems.length || roomFinishes.length || hasMeasures ? 10 : 0)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={Math.min(12, w / room.name.length * 1.5)} fontWeight="600" fill="#1F3A32"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {room.name}
                </text>

                {hasMeasures && (
                  <text x={x+w/2} y={y+h/2+6} textAnchor="middle" dominantBaseline="middle"
                    fontSize={8} fill="#1F3A32" opacity={0.45}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {room.widthM}m × {room.lengthM}m
                  </text>
                )}

                {(roomItems.length > 0 || roomFinishes.length > 0) && (
                  <text x={x+w/2} y={y+h/2+(hasMeasures ? 16 : 9)} textAnchor="middle" dominantBaseline="middle"
                    fontSize={8} fill="#1F3A32" opacity={0.4}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {roomItems.length > 0 ? `📦${roomItems.length}` : ''}{roomItems.length > 0 && roomFinishes.length > 0 ? ' ' : ''}{roomFinishes.length > 0 ? `🎨${roomFinishes.length}` : ''}
                  </text>
                )}

                {/* Edit mode controls */}
                {editMode && isSelected && (
                  <>
                    {/* Resize handle */}
                    <rect x={x+w-10} y={y+h-10} width={10} height={10} fill="#1F3A32" rx={2}
                      style={{ cursor: 'se-resize' }} onMouseDown={e => onMouseDown(e, room.id, 'resize')} />
                    {/* Measure button */}
                    <foreignObject x={x+2} y={y+2} width={60} height={20}>
                      <button
                        style={{ fontSize: 9, background: 'rgba(255,255,255,0.85)', border: '1px solid #C9A86A', borderRadius: 4, padding: '1px 4px', cursor: 'pointer', color: '#1F3A32', fontWeight: 600, whiteSpace: 'nowrap' }}
                        onClick={() => openMeasure(room)}>
                        📏 m²
                      </button>
                    </foreignObject>
                    {/* Delete button */}
                    {onDeleteRoom && (
                      <foreignObject x={x+w-30} y={y+2} width={28} height={20}>
                        <button
                          style={{ fontSize: 10, background: 'rgba(255,240,240,0.9)', border: '1px solid #FCA5A5', borderRadius: 4, padding: '1px 4px', cursor: 'pointer', color: '#991B1B', fontWeight: 700 }}
                          onClick={() => { onDeleteRoom(room.id); setSelected(null) }}>
                          ✕
                        </button>
                      </foreignObject>
                    )}
                  </>
                )}

                {/* Popup */}
                {isPopup && !editMode && (
                  <foreignObject x={Math.min(x, W-190)} y={Math.max(0, y - 130)} width={190} height={130}>
                    <div style={{ background: 'white', border: '1px solid #E8E0D5', borderRadius: 10, padding: '10px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: '#1F3A32', marginBottom: 4 }}>{room.icon} {room.name}</div>
                      {hasMeasures && <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>{room.widthM}m × {room.lengthM}m = {(room.widthM! * room.lengthM!).toFixed(1)}m²</div>}
                      {roomItems.length > 0 && (
                        <button onClick={() => onSelectRoom?.(room.id, 'inventory')}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px', borderRadius: 6, background: '#F0F7F4', color: '#1F3A32', fontWeight: 600, marginBottom: 4, cursor: 'pointer', border: 'none', fontSize: 11 }}>
                          📦 {roomItems.length} item{roomItems.length !== 1 ? 's' : ''} →
                        </button>
                      )}
                      {roomFinishes.length > 0 && (
                        <button onClick={() => onSelectRoom?.(room.id, 'finishes')}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px', borderRadius: 6, background: '#FFF8F0', color: '#92400E', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: 11 }}>
                          🎨 {roomFinishes.length} finish{roomFinishes.length !== 1 ? 'es' : ''} →
                        </button>
                      )}
                      {roomItems.length === 0 && roomFinishes.length === 0 && (
                        <div style={{ color: '#999', fontSize: 11 }}>No items yet</div>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}

          {floorRooms.length === 0 && (
            <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#999">
              Tap "Load {activeFloor === 0 ? 'ground' : '1st'} floor" to get started
            </text>
          )}
        </svg>
      </div>

      {floorRooms.length > 0 && !editMode && (
        <div className="px-5 py-2 text-xs opacity-50 border-t" style={{ borderColor: '#F0EBE3' }}>
          Tap a room to see its items and finishes
        </div>
      )}
      {editMode && (
        <div className="px-5 py-2 text-xs opacity-50 border-t" style={{ borderColor: '#F0EBE3' }}>
          Drag to move · Drag ■ to resize · 📏 to set measurements · ✕ to delete
        </div>
      )}

      {/* Add room modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-xs" style={{ background: 'white' }}>
            <h3 className="font-semibold text-base mb-4" style={{ color: '#1F3A32' }}>Add Room — {activeFloor === 0 ? 'Ground Floor' : '1st Floor'}</h3>
            <input placeholder="Room name" value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddRoom()}
              className="w-full border rounded-xl px-4 py-2.5 text-sm mb-4" style={{ borderColor: '#E8E0D5' }} autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowAddRoom(false)} className="flex-1 py-2 rounded-xl text-sm border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
              <button onClick={handleAddRoom} disabled={!newRoomName} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#1F3A32' }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Measurements modal */}
      {measureRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-xs" style={{ background: 'white' }}>
            <h3 className="font-semibold text-base mb-1" style={{ color: '#1F3A32' }}>📏 {measureRoom.name}</h3>
            <p className="text-xs opacity-50 mb-4">Enter real-world dimensions in metres</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-xs opacity-50 block mb-1">Width (m)</label>
                <input type="number" step="0.1" placeholder="e.g. 4.2" value={measureW}
                  onChange={e => setMeasureW(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} autoFocus />
              </div>
              <div>
                <label className="text-xs opacity-50 block mb-1">Length (m)</label>
                <input type="number" step="0.1" placeholder="e.g. 5.8" value={measureL}
                  onChange={e => setMeasureL(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              </div>
            </div>
            {measureW && measureL && (
              <p className="text-xs font-semibold mb-3 text-center" style={{ color: '#C9A86A' }}>
                Area: {(parseFloat(measureW) * parseFloat(measureL)).toFixed(1)} m²
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setMeasureRoom(null)} className="flex-1 py-2 rounded-xl text-sm border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
              <button onClick={saveMeasure} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
