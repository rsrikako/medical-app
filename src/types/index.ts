export interface Product {
  id: string
  sku: string
  name: string
  categoryId: string
  categoryName: string
  brand: string
  packCount: string // e.g. "10 Tablets", "20 Tablets"
  strength?: string // e.g. "500mg"
  form?: string // e.g. "Tablet", "Capsule", "Syrup"
  mrp?: number // Maximum Retail Price
  salePrice?: number // Sale price for e-commerce display
  description?: string
  imageUrl?: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  displayOrder: number
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface StoreSettings {
  businessName: string
  whatsappNumber: string // e.g. "919876543210"
  contactPhone: string
  logoUrl?: string
}

export interface CartItem {
  productId: string
  sku: string
  name: string
  brand: string
  strength?: string
  packCount: string
  mrp?: number
  salePrice?: number
  quantity: number
  imageUrl?: string
}

export interface CheckoutDetails {
  customerName: string
  contactPerson: string
  phone: string
  deliveryAddress?: string
  gstNumber?: string
  notes?: string
}

export interface ExcelImportRow {
  sku: string
  product_name: string
  category: string
  brand: string
  strength?: string
  form?: string
  pack_count: string
  mrp?: number
  salePrice?: number
  description?: string
  status: 'active' | 'inactive'
}

export interface ExcelValidationResult {
  rowIndex: number
  row: ExcelImportRow
  isValid: boolean
  errors: string[]
  isUpdate: boolean
}
