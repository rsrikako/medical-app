import { supabase } from './client'
import { Product, Category, StoreSettings } from '@/types'
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../firebase/mockData'

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

// PRODUCTS API
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (data) {
      const products = data.map(row => ({
        id: row.id,
        sku: row.sku,
        name: row.name,
        categoryId: row.category_id,
        categoryName: row.category_name,
        brand: row.brand,
        packCount: row.pack_count,
        strength: row.strength,
        form: row.form,
        description: row.description,
        imageUrl: row.image_url,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) as Product[]
      setStoredLocalData(LOCAL_PRODUCTS_KEY, products)
      return products
    }
  } catch (err) {
    console.warn('Supabase getProducts fallback to local:', err)
  }
  return getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
}

export async function getProductById(id: string): Promise<Product | null> {
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
        categoryName: data.category_name,
        brand: data.brand,
        packCount: data.pack_count,
        strength: data.strength,
        form: data.form,
        description: data.description,
        imageUrl: data.image_url,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Product
    }
  } catch (err) {
    console.warn('Supabase getProductById fallback to local:', err)
  }
  const products = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
  return products.find(p => p.id === id) || null
}

export async function saveProduct(product: Partial<Product> & { sku: string; name: string }): Promise<Product> {
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
      console.warn('Supabase update fallback:', err)
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
        .insert({
          id,
          ...dbData,
          created_at: now,
        })

      if (error) throw error
    } catch (err) {
      console.warn('Supabase insert fallback:', err)
    }
  }

  // Update local cache
  const localProducts = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
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
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (err) {
    console.warn('Supabase delete fallback:', err)
  }
  const localProducts = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
  const updated = localProducts.filter(p => p.id !== id)
  setStoredLocalData(LOCAL_PRODUCTS_KEY, updated)
}

// CATEGORIES API
export async function getCategories(): Promise<Category[]> {
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
  } catch (err) {
    console.warn('Supabase getCategories fallback:', err)
  }
  return getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES)
}

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<Category> {
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
      console.warn('Supabase update category fallback:', err)
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
      console.warn('Supabase insert category fallback:', err)
    }
  }

  const localCategories = getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES)
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
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (err) {
    console.warn('Supabase delete category fallback:', err)
  }
  const localCategories = getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES)
  const updated = localCategories.filter(c => c.id !== id)
  setStoredLocalData(LOCAL_CATEGORIES_KEY, updated)
}

// SETTINGS API
export async function getStoreSettings(): Promise<StoreSettings> {
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
  } catch (err) {
    console.warn('Supabase getStoreSettings fallback:', err)
  }
  return getStoredLocalData<StoreSettings>(LOCAL_SETTINGS_KEY, INITIAL_SETTINGS)
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
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
  } catch (err) {
    console.warn('Supabase saveStoreSettings fallback:', err)
  }

  setStoredLocalData(LOCAL_SETTINGS_KEY, settings)
  return settings
}

// FILE UPLOAD API
export async function uploadProductImage(file: File): Promise<string> {
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
    console.warn('Supabase Storage upload failed, creating base64 data URL fallback:', err)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}
