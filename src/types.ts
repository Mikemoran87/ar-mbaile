export interface Home {
  id: string
  name: string
  address: string
  description: string
  coverEmoji: string
  createdAt: string
}

export interface Room {
  id: string
  homeId: string
  name: string
  icon: string
}

export interface Item {
  id: string
  homeId: string
  roomId: string
  name: string
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  purchasePrice: string
  warrantyExpiry: string
  category: string
  notes: string
  tags: string[]
  hasReceipt: boolean
  hasManual: boolean
  isHighValue: boolean
  isSentimental: boolean
  needsMaintenance: boolean
  insuranceLinked: boolean
  receiptData?: string
  receiptName?: string
  productUrl?: string
  createdAt: string
}

export interface InsurancePolicy {
  id: string
  homeId: string
  type: string
  provider: string
  policyNumber: string
  renewalDate: string
  premium: string
  notes: string
  createdAt: string
}

export interface MaintenanceLog {
  id: string
  homeId: string
  itemId?: string
  title: string
  category: string
  date: string
  cost: string
  notes: string
  nextDueDate: string
  productUrl?: string
  createdAt: string
}

export interface Finish {
  id: string
  homeId: string
  roomId: string
  type: 'Paint' | 'Tiles' | 'Flooring' | 'Worktop' | 'Ironmongery' | 'Wallpaper' | 'Other'
  name: string
  brand: string
  colourCode: string
  colourName: string
  finish: string
  supplier: string
  productCode: string
  batchNumber: string
  quantityBought: string
  quantityLeftover: string
  notes: string
  productUrl?: string
  photoData?: string
  photoName?: string
  createdAt: string
}

export interface Renovation {
  id: string
  homeId: string
  title: string
  description: string
  status: 'Planning' | 'In Progress' | 'Complete' | 'On Hold'
  startDate: string
  endDate: string
  budget: string
  actualCost: string
  contractor: string
  notes: string
  createdAt: string
}

export interface Tradesperson {
  id: string
  homeId: string
  name: string
  trade: string
  phone: string
  email: string
  website: string
  lastUsed: string
  rating: number
  notes: string
  createdAt: string
}
