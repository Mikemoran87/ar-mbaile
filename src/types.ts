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
  createdAt: string
}
