import * as XLSX from 'xlsx'
import { ExcelImportRow, ExcelValidationResult, Product, Category } from '@/types'

export async function parseExcelFile(file: File): Promise<ExcelImportRow[]> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

  return rawRows.map((r) => ({
    sku: String(r.sku || r.SKU || '').trim(),
    product_name: String(r.product_name || r.name || r['Product Name'] || '').trim(),
    category: String(r.category || r.Category || '').trim(),
    brand: String(r.brand || r.Brand || '').trim(),
    strength: String(r.strength || r.Strength || '').trim(),
    form: String(r.form || r.Form || '').trim(),
    pack_count: String(r.pack_count || r['Pack Count'] || r.packCount || '').trim(),
    description: String(r.description || r.Description || '').trim(),
    status: (String(r.status || r.Status || 'active').toLowerCase().trim() === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
  }))
}

export function validateExcelRows(
  rows: ExcelImportRow[],
  existingProducts: Product[],
  existingCategories: Category[]
): ExcelValidationResult[] {
  const existingSkuMap = new Map<string, Product>()
  existingProducts.forEach((p) => existingSkuMap.set(p.sku.toLowerCase(), p))

  const validCategoryNames = new Set(existingCategories.map((c) => c.name.toLowerCase()))

  const seenSkusInFile = new Set<string>()

  return rows.map((row, idx) => {
    const rowNum = idx + 2 // 1-indexed header is row 1
    const errors: string[] = []

    if (!row.sku) {
      errors.push(`Row ${rowNum}: SKU is missing`)
    } else {
      const lowerSku = row.sku.toLowerCase()
      if (seenSkusInFile.has(lowerSku)) {
        errors.push(`Row ${rowNum}: Duplicate SKU "${row.sku}" found in spreadsheet`)
      } else {
        seenSkusInFile.add(lowerSku)
      }
    }

    if (!row.product_name) {
      errors.push(`Row ${rowNum}: Product Name is missing`)
    }

    if (!row.category) {
      errors.push(`Row ${rowNum}: Category is missing`)
    }

    if (!row.brand) {
      errors.push(`Row ${rowNum}: Brand is missing`)
    }

    if (!row.pack_count) {
      errors.push(`Row ${rowNum}: Pack count is missing`)
    }

    if (row.status !== 'active' && row.status !== 'inactive') {
      errors.push(`Row ${rowNum}: Invalid status "${row.status}" (must be 'active' or 'inactive')`)
    }

    const isUpdate = Boolean(row.sku && existingSkuMap.has(row.sku.toLowerCase()))

    return {
      rowIndex: rowNum,
      row,
      isValid: errors.length === 0,
      errors,
      isUpdate,
    }
  })
}
