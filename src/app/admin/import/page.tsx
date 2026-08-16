'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateExcelTemplate } from '@/lib/excel/template'
import { parseExcelFile, validateExcelRows } from '@/lib/excel/importer'
import { getProducts, getCategories, deleteProduct } from '@/lib/supabase/services'
import { ExcelValidationResult, Product, Category } from '@/types'
import { 
  Download, Upload, FileSpreadsheet, AlertTriangle, 
  CheckCircle2, XCircle, RefreshCw, ArrowRight, ShieldCheck, Trash2 
} from 'lucide-react'

export default function AdminImportPage() {
  const router = useRouter()
  const [existingProducts, setExistingProducts] = useState<Product[]>([])
  const [existingCategories, setExistingCategories] = useState<Category[]>([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)

  const [validationResults, setValidationResults] = useState<ExcelValidationResult[]>([])
  const [importCompleted, setImportCompleted] = useState(false)
  const [importedStats, setImportedStats] = useState({ created: 0, updated: 0, deleted: 0 })

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()])
        setExistingProducts(prods)
        setExistingCategories(cats)
      } catch (err) {
        console.error('Failed to load existing catalog for validation:', err)
      } finally {
        setLoadingInitial(false)
      }
    }
    loadCatalog()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setSelectedFile(file)
    setParsing(true)
    setImportCompleted(false)

    try {
      const rows = await parseExcelFile(file)
      const results = validateExcelRows(rows, existingProducts, existingCategories)
      setValidationResults(results)
    } catch (err) {
      alert('Failed to parse Excel file. Please ensure it is a valid .xlsx file.')
    } finally {
      setParsing(false)
    }
  }

  const validRows = validationResults.filter((r) => r.isValid)
  const invalidRows = validationResults.filter((r) => !r.isValid)
  const createCount = validRows.filter((r) => !r.isUpdate).length
  const updateCount = validRows.filter((r) => r.isUpdate).length

  // Find existing products that are NOT present in the valid uploaded rows (by SKU)
  const validFileSkus = new Set(validRows.map((r) => r.row.sku.toLowerCase()))
  const missingProductsToDelete = existingProducts.filter(
    (p) => !validFileSkus.has(p.sku.toLowerCase())
  )

  const handleExecuteImport = async () => {
    if (validRows.length === 0) return
    setImporting(true)

    let created = 0
    let updated = 0
    let deleted = 0

    try {
      // 1. Prepare payload and send to server-side upsert endpoint
      const payload = validRows.map((res) => {
        const row = res.row
        const matchedCategory = existingCategories.find(
          (c) => c.name.toLowerCase() === row.category.toLowerCase()
        )
        const categoryId = matchedCategory ? matchedCategory.id : (existingCategories[0]?.id || 'cat-1')
        const categoryName = matchedCategory ? matchedCategory.name : row.category

        const existingProd = existingProducts.find((p) => p.sku.toLowerCase() === row.sku.toLowerCase())

        return {
          id: existingProd ? existingProd.id : undefined,
          sku: row.sku,
          name: row.product_name,
          category_id: categoryId,
          category_name: categoryName,
          brand: row.brand,
          strength: row.strength || '',
          form: row.form || 'Tablet',
          pack_count: row.pack_count,
          mrp: row.mrp,
          description: row.description || '',
          status: row.status,
        }
      })

      // POST payload to server endpoint which performs chunked upsert with onConflict: 'sku'
      const resp = await fetch('/api/admin/upsert-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.error || `Upload failed with status ${resp.status}`)
      }

      const result = await resp.json()

      // Use client-side counts for created/updated estimates
      created = createCount
      updated = updateCount


      // 2. Process Delete for missing products
      for (const prodToDelete of missingProductsToDelete) {
        await deleteProduct(prodToDelete.id)
        deleted++
      }

      setImportedStats({ created, updated, deleted })
      setImportCompleted(true)
    } catch (err) {
      alert('An error occurred during bulk import write.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Bulk Excel Product Import</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Download template, validate inventory rows, and execute bulk creation or updates matching SKUs
        </p>
      </div>

      {/* Action Banner Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Template Box */}
        <div className="clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-on-surface text-base mb-1">Download Excel Template</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Get the pre-formatted spreadsheet template containing required column headers: <code className="font-mono text-primary bg-surface-container px-1 py-0.5 rounded">sku, product_name, category, brand, strength, form, pack_count, description, status</code>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => generateExcelTemplate([], [], 'medical_catalog_import_template.xlsx')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container text-primary font-bold text-xs rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Template (.xlsx)</span>
            </button>
            <button
              onClick={() => generateExcelTemplate(existingProducts, existingCategories, 'medical_catalog_current_products.xlsx')}
              disabled={loadingInitial || existingProducts.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Download Current Catalog (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Upload Excel Box */}
        <div className="clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-on-surface text-base mb-1">Upload Product Spreadsheet</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Select your filled `.xlsx` file to automatically validate SKUs, check duplicate entries, and preview changes.
            </p>
          </div>
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-lg hover:bg-teal-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{parsing ? 'Parsing File...' : 'Select Excel File'}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Completion Success View */}
      {importCompleted && (
        <div className="clinical-card p-8 bg-teal-50 border-2 border-teal-300 text-teal-900 text-center">
          <CheckCircle2 className="w-16 h-16 text-teal-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Excel Import & Sync Completed Successfully!</h2>
          <p className="text-xs text-teal-800 mb-6">
            Processed batch writes: <strong className="font-mono">{importedStats.created} Created</strong>, <strong className="font-mono">{importedStats.updated} Updated</strong>, <strong className="font-mono">{importedStats.deleted} Deleted (Missing from file)</strong>.
          </p>
          <button
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-lg hover:bg-teal-800"
          >
            <span>View Updated Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview & Validation Report */}
      {validationResults.length > 0 && !importCompleted && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="clinical-card p-4">
              <span className="text-[11px] font-bold text-outline uppercase block">Total Rows</span>
              <span className="text-2xl font-bold font-mono text-on-surface">{validationResults.length}</span>
            </div>
            <div className="clinical-card p-4 border-l-4 border-teal-500">
              <span className="text-[11px] font-bold text-teal-700 uppercase block">Valid Rows</span>
              <span className="text-2xl font-bold font-mono text-teal-700">{validRows.length}</span>
            </div>
            <div className="clinical-card p-4 border-l-4 border-primary">
              <span className="text-[11px] font-bold text-primary uppercase block">To Create / Update</span>
              <span className="text-sm font-mono text-on-surface font-semibold block mt-1">
                {createCount} New / {updateCount} Update
              </span>
            </div>
            <div className="clinical-card p-4 border-l-4 border-amber-500">
              <span className="text-[11px] font-bold text-amber-700 uppercase block">To Delete (Missing)</span>
              <span className="text-2xl font-bold font-mono text-amber-700">{missingProductsToDelete.length}</span>
            </div>
            <div className="clinical-card p-4 border-l-4 border-error">
              <span className="text-[11px] font-bold text-error uppercase block">Invalid Errors</span>
              <span className="text-2xl font-bold font-mono text-error">{invalidRows.length}</span>
            </div>
          </div>

          {/* Missing Products Warning Banner */}
          {missingProductsToDelete.length > 0 && (
            <div className="clinical-card p-4 border-l-4 border-amber-500 bg-amber-50/60 flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  {missingProductsToDelete.length} existing product(s) in catalog are missing from this spreadsheet
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Confirming import will sync your catalog by deleting these missing items: {' '}
                  <span className="font-mono font-semibold">
                    {missingProductsToDelete.map((p) => `${p.sku} (${p.name})`).join(', ')}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Invalid Rows Errors Inspection */}
          {invalidRows.length > 0 && (
            <div className="clinical-card p-6 border-l-4 border-error bg-red-50/50">
              <h3 className="text-sm font-bold text-error flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Spreadsheet Validation Errors ({invalidRows.length} rows require correction)</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-on-surface font-mono">
                {invalidRows.map((inv) => (
                  <li key={inv.rowIndex} className="bg-white p-2 rounded border border-red-200 text-error">
                    {inv.errors.join(' • ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Rows Table */}
          <div className="clinical-card overflow-hidden">
            <div className="p-4 border-b border-surface-container flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">Row Validation Inspection Preview</h3>
              {validRows.length > 0 && (
                <button
                  onClick={handleExecuteImport}
                  disabled={importing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                    <span>{importing ? 'Processing Batch Write...' : `Confirm and Import ${validRows.length} Product${validRows.length === 1 ? '' : 's'}`}</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container text-[11px] font-bold text-outline uppercase tracking-wider">
                    <th className="py-2.5 px-4">Row</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Brand</th>
                    <th className="py-2.5 px-4">Action Type</th>
                    <th className="py-2.5 px-4">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-xs">
                  {validationResults.map((res) => (
                    <tr key={res.rowIndex} className={res.isValid ? 'hover:bg-surface-container-low/50' : 'bg-red-50/30'}>
                      <td className="py-2 px-4 font-mono text-outline">{res.rowIndex}</td>
                      <td className="py-2 px-4 font-mono font-bold text-on-surface">{res.row.sku || '—'}</td>
                      <td className="py-2 px-4 font-semibold text-on-surface truncate max-w-xs">{res.row.product_name || '—'}</td>
                      <td className="py-2 px-4 text-on-surface-variant">{res.row.category || '—'}</td>
                      <td className="py-2 px-4 text-primary font-medium">{res.row.brand || '—'}</td>
                      <td className="py-2 px-4">
                        {res.isValid ? (
                          <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${res.isUpdate ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
                            {res.isUpdate ? 'Update' : 'Create'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-500">Skip</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {res.isValid ? (
                          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-error font-semibold text-xs">
                            <XCircle className="w-3.5 h-3.5" /> Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
