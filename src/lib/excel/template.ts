import * as XLSX from 'xlsx'
import type { Product, Category } from '@/types'

function buildExportRows(products: Product[] = [], categories: Category[] = []) {
  const categoryNameMap = new Map(categories.map((category) => [category.id, category.name]))

  if (products.length > 0) {
    return products.map((product) => ({
      sku: product.sku,
      product_name: product.name,
      category: product.categoryName || categoryNameMap.get(product.categoryId) || 'N/A',
      brand: product.brand || '',
      strength: product.strength || '',
      form: product.form || '',
      pack_count: product.packCount || '',
      mrp: product.mrp ?? '',
      salePrice: product.salePrice ?? '',
      description: product.description || '',
      status: product.status || 'active',
    }))
  }

  return [
    {
      sku: 'PCM500-10',
      product_name: 'Paracetamol 500mg',
      category: 'Tablets',
      brand: 'ABC Pharma',
      strength: '500mg',
      form: 'Tablet',
      pack_count: '10 Tablets',
      mrp: 45.00,
      salePrice: 40.00,
      description: 'Pain relief tablet',
      status: 'active',
    },
    {
      sku: 'PCM500-20',
      product_name: 'Paracetamol 500mg',
      category: 'Tablets',
      brand: 'ABC Pharma',
      strength: '500mg',
      form: 'Tablet',
      pack_count: '20 Tablets',
      mrp: 85.00,
      salePrice: 75.00,
      description: 'Pain relief tablet',
      status: 'active',
    },
    {
      sku: 'AMX250-10',
      product_name: 'Amoxicillin 250mg',
      category: 'Capsules',
      brand: 'XYZ Pharma',
      strength: '250mg',
      form: 'Capsule',
      pack_count: '10 Capsules',
      mrp: 120.00,
      salePrice: 99.00,
      description: 'Antibiotic capsules',
      status: 'active',
    },
  ]
}

export function generateExcelTemplate(products: Product[] = [], categories: Category[] = [], filename = 'medical_catalog_import_template.xlsx'): void {
  const rows = buildExportRows(products, categories)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductCatalog')

  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 30 },
    { wch: 10 },
  ]

  XLSX.writeFile(workbook, filename)
}
