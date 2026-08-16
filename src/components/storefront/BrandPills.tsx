'use client'

import React, { useMemo, useState, useRef, useEffect } from 'react'
import { X, Search, Trash } from 'lucide-react'

interface BrandPillsProps {
  brands: string[]
  selectedBrands: string[]
  onChange: (brands: string[]) => void
}

export const BrandPills: React.FC<BrandPillsProps> = ({ brands, selectedBrands, onChange }) => {
  const activeBrands = brands.filter(Boolean)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const suggestions = useMemo(() => {
    const lower = query.toLowerCase().trim()
    return activeBrands
      .filter((b) => !selectedBrands.includes(b))
      .filter((b) => (lower === '' ? true : b.toLowerCase().includes(lower)))
      .slice(0, 10)
  }, [activeBrands, query, selectedBrands])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!inputRef.current) return
      if (e.target instanceof Node && !inputRef.current.parentElement?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const addBrand = (b: string) => {
    onChange([...selectedBrands, b])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeBrand = (b: string) => {
    onChange(selectedBrands.filter((s) => s !== b))
    setOpen(false)
    inputRef.current?.focus()
  }

  const clearAll = () => {
    onChange([])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && query.trim() !== '' && suggestions.length > 0) {
      e.preventDefault()
      addBrand(suggestions[0])
    } else if (e.key === 'Backspace' && query === '' && selectedBrands.length > 0) {
      // remove last selected
      removeBrand(selectedBrands[selectedBrands.length - 1])
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="flex flex-wrap items-center gap-2 bg-white border border-outline-variant rounded-lg px-3 py-2">
            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
              >
                <span className="truncate max-w-[10rem]">{b}</span>
                <button
                  aria-label={`Remove ${b}`}
                  onClick={() => removeBrand(b)}
                  className="p-1 rounded-full hover:bg-primary/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex items-center flex-1 min-w-0 pr-2">
              <Search className="w-4 h-4 text-on-surface-variant mr-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="Search brands"
                className="flex-1 outline-none text-sm bg-transparent placeholder:text-on-surface-variant min-w-[9rem] truncate"
                aria-label="Search brands"
              />
            </div>
          </div>

          {open && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-outline-variant rounded-lg shadow-md max-h-56 overflow-auto py-1">
              {suggestions.map((s) => (
                <li key={s} className="px-3 py-2 hover:bg-surface-container-low cursor-pointer text-sm" onClick={() => addBrand(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-outline-variant hover:bg-surface-container-low flex-shrink-0"
          >
            <Trash className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
