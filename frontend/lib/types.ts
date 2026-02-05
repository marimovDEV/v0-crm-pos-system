// Mahsulot modeli
export interface Product {
  id: string
  barcode: string
  name: string
  category: string
  unit: string // dona, kg, metr
  buyPrice: number
  sellPrice: number
  minStock: number
  currentStock: number
  supplier: string
  createdAt: string
}

// Xodim modeli
export interface User {
  id: string
  pin: string
  name: string
  role: "super-admin" | "admin" | "kassir" | "omborchi"
  avatar?: string
  createdAt: string
}

// Savdo cheki modeli
export interface CartItem {
  productId: string
  quantity: number
  discount: number // summa yoki %
}

export interface Sale {
  id: string
  date: string
  items: CartItem[]
  totalAmount: number
  discountAmount: number
  paidAmount: number
  paymentMethod: "cash" | "card" | "transfer" | "debt"
  userId: string
  debtAmount: number
  customerId?: string
}

// Qarzdorlik modeli
export interface Debt {
  id: string
  customerId: string
  customerName: string // Added for display
  amount: number
  dueDate: string
  paidAmount: number
  status: "active" | "paid" | "overdue"
  createdAt: string
}

// Inventarizatsiya modeli
export interface Inventory {
  id: string
  productId: string
  quantity: number
  timestamp: string
  notes?: string
}
