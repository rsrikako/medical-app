import * as XLSX from 'xlsx'

export function generateExcelTemplate(): void {
  const sampleData = [
    {
      sku: 'PCM500-10',
      product_name: 'Paracetamol 500mg',
      category: 'Tablets',
      brand: 'ABC Pharma',
      strength: '500mg',
      form: 'Tablet',
      pack_count: '10 Tablets',
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
      description: 'Antibiotic capsules',
      status: 'active',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductCatalogTemplate')

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 15 }, // sku
    { wch: 25 }, // product_name
    { wch: 15 }, // category
    { wch: 20 }, // brand
    { wch: 12 }, // strength
    { wch: 12 }, // form
    { wch: 15 }, // pack_count
    { wch: 30 }, // description
    { wch: 10 }, // status
  ]

  XLSX.writeFile(workbook, 'medical_catalog_import_template.xlsx')
}
