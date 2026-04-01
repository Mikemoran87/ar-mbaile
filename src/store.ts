import { useState, useCallback } from 'react'
import type { Home, Room, Item, InsurancePolicy, MaintenanceLog } from './types'

const KEY_HOMES = 'armbaile_homes'
const KEY_ROOMS = 'armbaile_rooms'
const KEY_ITEMS = 'armbaile_items'
const KEY_POLICIES = 'armbaile_policies'
const KEY_MAINTENANCE = 'armbaile_maintenance'

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function useStore() {
  const [homes, setHomes] = useState<Home[]>(() => load(KEY_HOMES))
  const [rooms, setRooms] = useState<Room[]>(() => load(KEY_ROOMS))
  const [items, setItems] = useState<Item[]>(() => load(KEY_ITEMS))
  const [policies, setPolicies] = useState<InsurancePolicy[]>(() => load(KEY_POLICIES))
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>(() => load(KEY_MAINTENANCE))

  const addHome = useCallback((h: Home) => {
    setHomes(prev => { const n = [...prev, h]; save(KEY_HOMES, n); return n })
  }, [])

  const addRoom = useCallback((r: Room) => {
    setRooms(prev => { const n = [...prev, r]; save(KEY_ROOMS, n); return n })
  }, [])

  const addItem = useCallback((item: Item) => {
    setItems(prev => { const n = [...prev, item]; save(KEY_ITEMS, n); return n })
  }, [])

  const updateItem = useCallback((item: Item) => {
    setItems(prev => { const n = prev.map(i => i.id === item.id ? item : i); save(KEY_ITEMS, n); return n })
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems(prev => { const n = prev.filter(i => i.id !== id); save(KEY_ITEMS, n); return n })
  }, [])

  const addPolicy = useCallback((p: InsurancePolicy) => {
    setPolicies(prev => { const n = [...prev, p]; save(KEY_POLICIES, n); return n })
  }, [])

  const addMaintenance = useCallback((m: MaintenanceLog) => {
    setMaintenance(prev => { const n = [...prev, m]; save(KEY_MAINTENANCE, n); return n })
  }, [])

  return { homes, rooms, items, policies, maintenance, addHome, addRoom, addItem, updateItem, deleteItem, addPolicy, addMaintenance }
}
