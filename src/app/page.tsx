'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import { ProductCard } from '@/components/storefront/ProductCard'
import { BrandPills } from '@/components/storefront/BrandPills'
import { getPaginatedProducts, getStorefrontBrands, getCategories, getStoreSettings } from '@/lib/supabase/services'
import { Product, Category, StoreSettings } from '@/types'
import { PackageX, Loader2 } from 'lucide-react'

const DEFAULT_PAGE_SIZE = 500

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    businessName: process.env.NEXT_PUBLIC_STORE_NAME || '',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  })

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)

  const observerTarget = useRef<HTMLDivElement | null>(null)

  // Reset search / brands
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleBrandsChange = (newBrands: string[]) => {
    setSelectedBrands(newBrands)
  }

  // Load static meta (brands list, categories, settings) once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [bList, cats, stg] = await Promise.all([
          getStorefrontBrands(),
          getCategories(),
          getStoreSettings(),
        ])
        setBrands(bList)
        setCategories(cats)
        if (stg) setSettings(stg)
      } catch (err) {
        console.error('Failed to load metadata:', err)
      }
    }
    loadMeta()
  }, [])

  // Initial load when search or brands change
  useEffect(() => {
    let isCancelled = false
    async function fetchInitial() {
      setLoadingInitial(true)
      setCurrentPage(1)
      try {
        const res = await getPaginatedProducts({
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          search: searchQuery,
          brands: selectedBrands,
          sortBy: 'name',
          sortOrder: 'asc',
          status: 'active',
        })
        if (!isCancelled) {
          setProducts(res.products)
          setTotalCount(res.totalCount)
          setTotalPages(res.totalPages)
        }
      } catch (err) {
        console.error('Failed to load initial storefront products:', err)
      } finally {
        if (!isCancelled) setLoadingInitial(false)
      }
    }
    fetchInitial()
    return () => {
      isCancelled = true
    }
  }, [searchQuery, selectedBrands])

  // Load next page function for infinite scroll
  const loadNextPage = useCallback(async () => {
    if (loadingMore || loadingInitial || currentPage >= totalPages) return
    setLoadingMore(true)
    const nextPage = currentPage + 1
    try {
      const res = await getPaginatedProducts({
        page: nextPage,
        pageSize: DEFAULT_PAGE_SIZE,
        search: searchQuery,
        brands: selectedBrands,
        sortBy: 'name',
        sortOrder: 'asc',
        status: 'active',
      })
      setProducts((prev) => [...prev, ...res.products])
      setCurrentPage(nextPage)
      setTotalCount(res.totalCount)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Failed to load more products:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, totalPages, loadingMore, loadingInitial, searchQuery, selectedBrands])

  // Set up IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const target = observerTarget.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    )

    observer.observe(target)
    return () => {
      observer.unobserve(target)
    }
  }, [loadNextPage])

  const loadedCount = products.length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        businessName={settings.businessName}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Catalog Header and Brand Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-on-surface">Product Catalog</h2>
              <p className="text-xs text-on-surface-variant">
                {loadingInitial
                  ? 'Loading products...'
                  : totalCount === 0
                  ? 'No items'
                  : `Loaded ${loadedCount} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
              </p>
            </div>
          </div>

          {/* Brands Filter */}
          <div className="mt-3">
            <BrandPills brands={brands} selectedBrands={selectedBrands} onChange={handleBrandsChange} />
          </div>
        </div>

        {/* Product Grid / Loading / Empty States */}
        {loadingInitial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="clinical-card h-80 animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-40 bg-surface-container rounded-lg mb-4"></div>
                <div className="h-4 bg-surface-container rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-surface-container rounded w-1/2 mb-4"></div>
                <div className="h-9 bg-surface-container rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Infinite Scroll Sentinel Target & Loader */}
            <div ref={observerTarget} className="py-8 flex justify-center items-center w-full">
              {loadingMore ? (
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more products...</span>
                </div>
              ) : currentPage < totalPages ? (
                <p className="text-xs text-on-surface-variant">Scroll down for more products</p>
              ) : (
                <p className="text-xs text-on-surface-variant font-medium">
                  All {totalCount} products loaded
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="clinical-card p-12 text-center max-w-md mx-auto my-12">
            <PackageX className="w-16 h-16 text-outline mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-base font-bold text-on-surface mb-2">No Products Found</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              {searchQuery || selectedBrands.length > 0
                ? 'No products matched your search or brand filters. Try clearing your filters.'
                : 'No products are currently available.'}
            </p>
            {(searchQuery || selectedBrands.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedBrands([])
                }}
                className="px-4 py-2 bg-surface-container text-primary rounded-lg text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}


