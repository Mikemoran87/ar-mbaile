import { useState, useRef, useCallback } from 'react'
import type { Room, Item, Finish } from '../types'

const COLS = 20
const ROWS = 14
const CELL = 32 // px per grid cell

const ROOM_COLORS = [
  '#D1E8D5', '#D1E0F0', '#F0E8D1', '#E8D1D1',
  '#D1E8E8', '#E8E2D1', '#E2D1E8', '#D1E8D8',
]

const DEFAULT_ROOMS: Omit<Room, 'id' | 'homeId'>[] = [
  { name: 'Kitchen',         icon: '🍳', fx: 0,  fy: 0,  fw: 6, fh: 5, fcolor: ROOM_COLORS[0] },
  { name: 'Living Room',     icon: '🛋️', fx: 6,  fy: 0,  fw: 8, fh: 7, fcolor: ROOM_COLORS[1] },
  { name: 'Dining Room',     icon: '🍽️', fx: 14, fy: 0,  fw: 6, fh: 5, fcolor: ROOM_COLORS[2] },
  { name: 'Master Bedroom',  icon: '🛏️', fx: 0,  fy: 5,  fw: 6, fh: 5, fcolor: ROOM_COLORS[3] },
  { name: 'Bathroom',        icon: '🚿', fx: 14, fy: 5,  fw: 6, fh: 4, fcolor: ROOM_COLORS[4] },
  { name: 'Bedroom 2',       icon: '🛏️', fx: 6,  fy: 7,  fw: 8, fh: 5, fcolor: ROOM_COLORS[5] },
  { name: 'Hallway',         icon: '🚪', fx: 0,  fy: 10, fw: 6, fh: 4, fcolor: ROOM_COLORS[6] },
  { name: 'Garage',          icon: '🚗', fx: 14, fy: 9,  fw: 6, fh: 5, fcolor: ROOM_COLORS[7] },
]

interface Props {
  rooms: Room[]
  items: Item[]
  finishes: Finish[]
  onUpdateRoom: (r: Room) => void
  onAddRoom: (r: Room) => void
  homeId: string
  onSelectRoom?: (roomId: string, tab: 'inventory' | 'finishes') => void
}

interface DragState {
  roomId: string
  startX: number
  startY: number
  origFx: number
  origFy: number
}

interface ResizeState {
  roomId: string
  edge: 'se'
  startX: number
  startY: number
  origFw: number
  origFh: number
}

export function Floorplan({ rooms, items, finishes, onUpdateRoom, onAddRoom, homeId, onSelectRoom }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [popup, setPopup] = useState<string | null>(null)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const resizeRef = useRef<ResizeState | null>(null)

  const floorRooms = rooms.filter(r => r.fx !== undefined)

  // Seed default layout if no rooms placed yet
  const handleSeedDefaults = () => {
    DEFAULT_ROOMS.forEach((dr) => {
      const exists = rooms.find(r => r.name === dr.name)
      if (exists) {
        onUpdateRoom({ ...exists, fx: dr.fx, fy: dr.fy, fw: dr.fw, fh: dr.fh, fcolor: dr.fcolor })
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
    if (type === 'drag') {
      const { col, row } = getSvgPos(e.clientX, e.clientY)
      dragRef.current = { roomId, startX: col, startY: row, origFx: room.fx!, origFy: room.fy! }
    } else {
      const { col, row } = getSvgPos(e.clientX, e.clientY)
      resizeRef.current = { roomId, edge: 'se', startX: col, startY: row, origFw: room.fw!, origFh: room.fh! }
    }
    setSelected(roomId)
  }, [editMode, rooms])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragRef.current) {
      const { col, row } = getSvgPos(e.clientX, e.clientY)
      const dx = col - dragRef.current.startX
      const dy = row - dragRef.current.startY
      const room = rooms.find(r => r.id === dragRef.current!.roomId)!
      const newFx = Math.max(0, Math.min(COLS - (room.fw || 4), dragRef.current.origFx + dx))
      const newFy = Math.max(0, Math.min(ROWS - (room.fh || 3), dragRef.current.origFy + dy))
      onUpdateRoom({ ...room, fx: newFx, fy: newFy })
    }
    if (resizeRef.current) {
      const { col, row } = getSvgPos(e.clientX, e.clientY)
      const dx = col - resizeRef.current.startX
      const dy = row - resizeRef.current.startY
      const room = rooms.find(r => r.id === resizeRef.current!.roomId)!
      const newFw = Math.max(2, Math.min(COLS - (room.fx || 0), resizeRef.current.origFw + dx))
      const newFh = Math.max(2, Math.min(ROWS - (room.fy || 0), resizeRef.current.origFh + dy))
      onUpdateRoom({ ...room, fw: newFw, fh: newFh })
    }
  }, [rooms, onUpdateRoom])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
    resizeRef.current = null
  }, [])

  const handleRoomClick = (roomId: string) => {
    if (editMode) { setSelected(roomId); return }
    setPopup(popup === roomId ? null : roomId)
  }

  const handleAddRoom = () => {
    if (!newRoomName) return
    onAddRoom({
      id: crypto.randomUUID(), homeId,
      name: newRoomName, icon: '🚪',
      fx: 0, fy: 0, fw: 4, fh: 3,
      fcolor: ROOM_COLORS[floorRooms.length % ROOM_COLORS.length]
    })
    setNewRoomName(''); setShowAddRoom(false)
  }

  const W = COLS * CELL
  const H = ROWS * CELL

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#F0EBE3' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#1F3A32' }}>🗺️ Floorplan</h3>
        <div className="flex items-center gap-2">
          {editMode && (
            <button onClick={() => setShowAddRoom(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: '#C9A86A', color: '#C9A86A' }}>
              + Room
            </button>
          )}
          {floorRooms.length === 0 && !editMode && (
            <button onClick={handleSeedDefaults} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F0F7F4', color: '#1F3A32' }}>
              Load default layout
            </button>
          )}
          <button
            onClick={() => { setEditMode(!editMode); setSelected(null); setPopup(null) }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: editMode ? '#1F3A32' : '#F0F7F4', color: editMode ? 'white' : '#1F3A32' }}
          >
            {editMode ? '✓ Done' : '✏️ Edit layout'}
          </button>
        </div>
      </div>

      {/* SVG floorplan */}
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', maxHeight: '340px', cursor: editMode ? 'crosshair' : 'default', display: 'block' }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Grid (edit mode only) */}
          {editMode && (
            <g opacity="0.15">
              {Array.from({ length: COLS + 1 }, (_, i) => (
                <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={H} stroke="#1F3A32" strokeWidth="0.5" />
              ))}
              {Array.from({ length: ROWS + 1 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * CELL} x2={W} y2={i * CELL} stroke="#1F3A32" strokeWidth="0.5" />
              ))}
            </g>
          )}

          {/* Background */}
          <rect x={0} y={0} width={W} height={H} fill="#F7F3EB" />

          {/* Rooms */}
          {floorRooms.map(room => {
            const x = (room.fx || 0) * CELL
            const y = (room.fy || 0) * CELL
            const w = (room.fw || 4) * CELL
            const h = (room.fh || 3) * CELL
            const roomItems = items.filter(i => i.roomId === room.id)
            const roomFinishes = finishes.filter(f => f.roomId === room.id)
            const isSelected = selected === room.id
            const isPopup = popup === room.id

            return (
              <g key={room.id}>
                {/* Room rect */}
                <rect
                  x={x + 2} y={y + 2} width={w - 4} height={h - 4}
                  rx={6} ry={6}
                  fill={room.fcolor || ROOM_COLORS[0]}
                  stroke={isSelected ? '#1F3A32' : '#C9A86A'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ cursor: editMode ? 'move' : 'pointer' }}
                  onMouseDown={e => onMouseDown(e, room.id, 'drag')}
                  onClick={() => handleRoomClick(room.id)}
                />

                {/* Room label */}
                <text
                  x={x + w / 2} y={y + h / 2 - (roomItems.length || roomFinishes.length ? 8 : 0)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={Math.min(13, w / room.name.length * 1.6)}
                  fontWeight="600" fill="#1F3A32"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {room.name}
                </text>

                {/* Item/finish count badges */}
                {(roomItems.length > 0 || roomFinishes.length > 0) && (
                  <text
                    x={x + w / 2} y={y + h / 2 + 10}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fill="#1F3A32" opacity={0.5}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {roomItems.length > 0 ? `📦 ${roomItems.length}` : ''}
                    {roomItems.length > 0 && roomFinishes.length > 0 ? '  ' : ''}
                    {roomFinishes.length > 0 ? `🎨 ${roomFinishes.length}` : ''}
                  </text>
                )}

                {/* Resize handle (edit mode) */}
                {editMode && isSelected && (
                  <rect
                    x={x + w - 10} y={y + h - 10}
                    width={10} height={10}
                    fill="#1F3A32" rx={2}
                    style={{ cursor: 'se-resize' }}
                    onMouseDown={e => onMouseDown(e, room.id, 'resize')}
                  />
                )}

                {/* Popup card (view mode) */}
                {isPopup && !editMode && (
                  <foreignObject x={Math.min(x, W - 180)} y={Math.max(0, y - 120)} width={180} height={120}>
                    <div
                      style={{
                        background: 'white',
                        border: '1px solid #E8E0D5',
                        borderRadius: 10,
                        padding: '10px 12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#1F3A32', marginBottom: 6 }}>{room.icon} {room.name}</div>
                      {roomItems.length > 0 && (
                        <button
                          onClick={() => onSelectRoom?.(room.id, 'inventory')}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px', borderRadius: 6, background: '#F0F7F4', color: '#1F3A32', fontWeight: 600, marginBottom: 4, cursor: 'pointer', border: 'none', fontSize: 11 }}
                        >
                          📦 {roomItems.length} item{roomItems.length !== 1 ? 's' : ''} →
                        </button>
                      )}
                      {roomFinishes.length > 0 && (
                        <button
                          onClick={() => onSelectRoom?.(room.id, 'finishes')}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px', borderRadius: 6, background: '#FFF8F0', color: '#92400E', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: 11 }}
                        >
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

          {/* Empty state */}
          {floorRooms.length === 0 && (
            <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#999">
              Tap "Load default layout" to get started
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      {floorRooms.length > 0 && !editMode && (
        <div className="px-5 py-2 text-xs opacity-50 border-t" style={{ borderColor: '#F0EBE3' }}>
          Tap a room to see its items and finishes
        </div>
      )}
      {editMode && (
        <div className="px-5 py-2 text-xs opacity-50 border-t" style={{ borderColor: '#F0EBE3' }}>
          Drag rooms to move · Drag ■ corner to resize
        </div>
      )}

      {/* Add room modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-xs" style={{ background: 'white' }}>
            <h3 className="font-semibold text-base mb-4" style={{ color: '#1F3A32' }}>Add Room</h3>
            <input
              placeholder="Room name"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddRoom()}
              className="w-full border rounded-xl px-4 py-2.5 text-sm mb-4"
              style={{ borderColor: '#E8E0D5' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddRoom(false)} className="flex-1 py-2 rounded-xl text-sm border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
              <button onClick={handleAddRoom} disabled={!newRoomName} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#1F3A32' }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
