import { getSupabaseClient } from './client'
import { Product, Category, StoreSettings } from '@/types'

const LOCAL_PRODUCTS_KEY = 'pharmdirect_products_v1'
const LOCAL_CATEGORIES_KEY = 'pharmdirect_categories_v1'
const LOCAL_SETTINGS_KEY = 'pharmdirect_settings_v1'

// Helper to seed localStorage if empty
function getStoredLocalData<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData
  try {
    const item = localStorage.getItem(key)
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialData))
      return initialData
    }
    return JSON.parse(item) as T
  } catch (e) {
    return initialData
  }
}

function setStoredLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to update localStorage cache:', e)
  }
}

function getSupabaseOrThrow() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error('Supabase client is unavailable')
  }
  return supabase
}

// PRODUCTS API
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseOrThrow()

  try {
    // Paginated fetch: some Supabase/PostgREST setups cap rows per request (commonly 1000).
    const pageSize = parseInt(process.env.PRODUCTS_PAGE_SIZE || '1000', 10)
    let from = 0
    const allRows: any[] = []

    while (true) {
      const to = from + pageSize - 1
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      if (!data || data.length === 0) break

      allRows.push(...data)
      if (data.length < pageSize) break
      from += pageSize
    }

    const products = allRows.map(row => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      categoryId: row.category_id,
      categoryName: row.category_name || 'N/A',
      brand: row.brand,
      packCount: row.pack_count,
      strength: row.strength,
      form: row.form,
      mrp: row.mrp,
      salePrice: row.sale_price ?? row.salePrice ?? undefined,
      description: row.description,
      imageUrl: row.image_url,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) as Product[]

    setStoredLocalData(LOCAL_PRODUCTS_KEY, products)
    return products
  } catch (err) {
    console.error('Supabase getProducts failed:', err)
    throw err
  }
}

// Return the count of products. If `status` is provided, count only that status.
export async function getProductsCount(status?: 'active' | 'inactive'): Promise<number> {
  const supabase = getSupabaseOrThrow()

  try {
    let query = supabase.from('products').select('*', { count: 'exact', head: true })
    if (status) query = query.eq('status', status)

    const { count, error } = await query
    if (error) throw error
    return typeof count === 'number' ? count : 0
  } catch (err) {
    console.error('Supabase getProductsCount failed:', err)
    throw err
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseOrThrow()

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (data) {
        return {
        id: data.id,
        sku: data.sku,
        name: data.name,
        categoryId: data.category_id,
        categoryName: data.category_name || 'N/A',
        brand: data.brand,
        packCount: data.pack_count,
        strength: data.strength,
        form: data.form,
          mrp: data.mrp,
          salePrice: data.sale_price ?? data.salePrice ?? undefined,
        description: data.description,
        imageUrl: data.image_url,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Product
    }
    return null
  } catch (err) {
    console.error('Supabase getProductById failed:', err)
    throw err
  }
}

export async function saveProduct(product: Partial<Product> & { sku: string; name: string }): Promise<Product> {
  const supabase = getSupabaseOrThrow()
  const now = new Date().toISOString()
  let savedProduct: Product

  const dbData = {
    sku: product.sku,
    name: product.name,
    category_id: product.categoryId,
    category_name: product.categoryName,
    brand: product.brand || '',
    pack_count: product.packCount,
    strength: product.strength,
    form: product.form,
    mrp: product.mrp,
    sale_price: product.salePrice,
    description: product.description,
    image_url: product.imageUrl,
    status: product.status || 'active',
    updated_at: now,
  }

  if (product.id) {
    // Update existing
    savedProduct = {
      ...product,
      id: product.id,
      updatedAt: now,
    } as Product

    try {
      const { error } = await supabase
        .from('products')
        .update(dbData)
        .eq('id', product.id)

      if (error) throw error
    } catch (err) {
      console.error('Supabase update product failed:', err)
      throw err
    }
  } else {
    // Create new
    const id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
    savedProduct = {
      ...product,
      id,
      status: product.status || 'active',
      createdAt: now,
      updatedAt: now,
    } as Product

    try {
      const { error } = await supabase
        .from('products')
        .upsert({
          id,
          ...dbData,
          created_at: now,
        }, { onConflict: 'sku' })

      if (error) throw error
    } catch (err) {
      console.error('Supabase upsert product failed:', err)
      throw err
    }
  }

  // Update local cache
  const localProducts = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, [] as Product[])
  const existingIdx = localProducts.findIndex(p => p.id === savedProduct.id || p.sku === savedProduct.sku)
  if (existingIdx >= 0) {
    localProducts[existingIdx] = savedProduct
  } else {
    localProducts.unshift(savedProduct)
  }
  setStoredLocalData(LOCAL_PRODUCTS_KEY, localProducts)

  return savedProduct
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseOrThrow()

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('Supabase delete product failed:', err)
    throw err
  }
  const localProducts = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, [] as Product[])
  const updated = localProducts.filter(p => p.id !== id)
  setStoredLocalData(LOCAL_PRODUCTS_KEY, updated)
}

// CATEGORIES API
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseOrThrow()

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    if (error) throw error
    if (data) {
      const categories = data.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        displayOrder: row.display_order,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) as Category[]
      setStoredLocalData(LOCAL_CATEGORIES_KEY, categories)
      return categories
    }
    return []
  } catch (err) {
    console.error('Supabase getCategories failed:', err)
    throw err
  }
}

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<Category> {
  const supabase = getSupabaseOrThrow()
  const now = new Date().toISOString()
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  let savedCategory: Category

  const dbData = {
    name: category.name,
    slug,
    display_order: category.displayOrder || 99,
    status: category.status || 'active',
    updated_at: now,
  }

  if (category.id) {
    savedCategory = {
      ...category,
      id: category.id,
      slug,
      updatedAt: now,
    } as Category

    try {
      const { error } = await supabase
        .from('categories')
        .update(dbData)
        .eq('id', category.id)

      if (error) throw error
    } catch (err) {
      console.error('Supabase update category failed:', err)
      throw err
    }
  } else {
    const id = 'cat-' + Date.now()
    savedCategory = {
      ...category,
      id,
      slug,
      displayOrder: category.displayOrder || 99,
      status: category.status || 'active',
      createdAt: now,
      updatedAt: now,
    } as Category

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          id,
          ...dbData,
          created_at: now,
        })

      if (error) throw error
    } catch (err) {
      console.error('Supabase insert category failed:', err)
      throw err
    }
  }

  const localCategories = getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, [] as Category[])
  const idx = localCategories.findIndex(c => c.id === savedCategory.id)
  if (idx >= 0) {
    localCategories[idx] = savedCategory
  } else {
    localCategories.push(savedCategory)
  }
  setStoredLocalData(LOCAL_CATEGORIES_KEY, localCategories)

  return savedCategory
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseOrThrow()

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('Supabase delete category failed:', err)
    throw err
  }
  const localCategories = getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, [] as Category[])
  const updated = localCategories.filter(c => c.id !== id)
  setStoredLocalData(LOCAL_CATEGORIES_KEY, updated)
}

// SETTINGS API
export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabaseOrThrow()

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (data) {
      return {
        businessName: data.business_name,
        whatsappNumber: data.whatsapp_number,
        contactPhone: data.contact_phone,
        logoUrl: data.logo_url,
      } as StoreSettings
    }
    throw new Error('No store settings found in Supabase')
  } catch (err) {
    console.error('Supabase getStoreSettings failed:', err)
    throw err
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  const supabase = getSupabaseOrThrow()
  const dbData = {
    business_name: settings.businessName,
    whatsapp_number: settings.whatsappNumber,
    contact_phone: settings.contactPhone,
    logo_url: settings.logoUrl,
    updated_at: new Date().toISOString(),
  }

  try {
    const { error, data } = await supabase
      .from('store_settings')
      .upsert({
        id: 'default',
        ...dbData,
      })
      .select()
      .single()

    if (error) throw error
    if (data) {
      const result = {
        businessName: data.business_name,
        whatsappNumber: data.whatsapp_number,
        contactPhone: data.contact_phone,
        logoUrl: data.logo_url,
      } as StoreSettings
      setStoredLocalData(LOCAL_SETTINGS_KEY, result)
      return result
    }
    throw new Error('Supabase did not return store settings data')
  } catch (err) {
    console.error('Supabase saveStoreSettings failed:', err)
    throw err
  }
}

// FILE UPLOAD API
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabaseOrThrow()

  try {
    const fileName = `product-images/${Date.now()}_${file.name}`
    const { error, data } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get the public URL
    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicData?.publicUrl || ''
  } catch (err) {
    console.error('Supabase Storage upload failed:', err)
    throw err
  }
}
