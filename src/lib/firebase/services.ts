import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './config'
import { Product, Category, StoreSettings } from '@/types'
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from './mockData'

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
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
      setStoredLocalData(LOCAL_PRODUCTS_KEY, products)
      return products
    }
  } catch (err) {
    console.warn('Firestore getProducts fallback to local:', err)
  }
  return getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    }
  } catch (err) {
    console.warn('Firestore getProductById fallback to local:', err)
  }
  const products = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
  return products.find(p => p.id === id) || null
}

export async function saveProduct(product: Partial<Product> & { sku: string; name: string }): Promise<Product> {
  const now = new Date().toISOString()
  let savedProduct: Product

  if (product.id) {
    // Update existing
    savedProduct = {
      ...product,
      id: product.id,
      updatedAt: now,
    } as Product

    try {
      const docRef = doc(db, 'products', product.id)
      await updateDoc(docRef, savedProduct as unknown as { [x: string]: any })
    } catch (err) {
      console.warn('Firestore updateDoc fallback:', err)
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
      await setDoc(doc(db, 'products', id), savedProduct)
    } catch (err) {
      console.warn('Firestore setDoc fallback:', err)
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
    await deleteDoc(doc(db, 'products', id))
  } catch (err) {
    console.warn('Firestore deleteDoc fallback:', err)
  }
  const localProducts = getStoredLocalData<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS)
  const updated = localProducts.filter(p => p.id !== id)
  setStoredLocalData(LOCAL_PRODUCTS_KEY, updated)
}

// CATEGORIES API
export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
      setStoredLocalData(LOCAL_CATEGORIES_KEY, categories)
      return categories
    }
  } catch (err) {
    console.warn('Firestore getCategories fallback:', err)
  }
  return getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES)
}

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<Category> {
  const now = new Date().toISOString()
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  let savedCategory: Category

  if (category.id) {
    savedCategory = {
      ...category,
      id: category.id,
      slug,
      updatedAt: now,
    } as Category

    try {
      await updateDoc(doc(db, 'categories', category.id), savedCategory as unknown as { [x: string]: any })
    } catch (err) {
      console.warn('Firestore updateDoc category fallback:', err)
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
      await setDoc(doc(db, 'categories', id), savedCategory)
    } catch (err) {
      console.warn('Firestore setDoc category fallback:', err)
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
    await deleteDoc(doc(db, 'categories', id))
  } catch (err) {
    console.warn('Firestore deleteDoc category fallback:', err)
  }
  const localCategories = getStoredLocalData<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES)
  const updated = localCategories.filter(c => c.id !== id)
  setStoredLocalData(LOCAL_CATEGORIES_KEY, updated)
}

// STORE SETTINGS API
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, 'settings', 'store')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data() as StoreSettings
      setStoredLocalData(LOCAL_SETTINGS_KEY, data)
      return data
    }
  } catch (err) {
    console.warn('Firestore getStoreSettings fallback:', err)
  }
  return getStoredLocalData<StoreSettings>(LOCAL_SETTINGS_KEY, INITIAL_SETTINGS)
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'store'), settings)
  } catch (err) {
    console.warn('Firestore saveStoreSettings fallback:', err)
  }
  setStoredLocalData(LOCAL_SETTINGS_KEY, settings)
}

// PRODUCT IMAGE UPLOAD
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileRef = ref(storage, `product-images/${Date.now()}_${file.name}`)
    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  } catch (err) {
    console.warn('Firebase Storage upload failed, creating base64 data URL fallback:', err)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}
