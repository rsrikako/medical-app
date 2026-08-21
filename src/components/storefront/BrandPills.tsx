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
          <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-md border border-white/80 rounded-md px-3 py-2 shadow-sm overflow-hidden">
            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-bold shadow-xs backdrop-blur-md"
              >
                <span className="truncate max-w-[6rem] sm:max-w-[10rem]">{b}</span>
                <button
                  aria-label={`Remove ${b}`}
                  onClick={() => removeBrand(b)}
                  className="p-0.5 rounded-md hover:bg-primary/20 text-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex items-center flex-1 min-w-0 pr-2">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
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
                className="flex-1 outline-none text-sm bg-transparent placeholder:text-slate-400 min-w-0 pr-8 truncate font-medium"
                aria-label="Search brands"
              />
            </div>
          </div>

          {open && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-xl shadow-xl max-h-56 overflow-auto py-1.5">
              {suggestions.map((s) => (
                <li
                  key={s}
                  className="px-3.5 py-2 hover:bg-primary/10 hover:text-primary cursor-pointer text-sm font-medium transition-colors"
                  onPointerDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addBrand(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/80 border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs flex-shrink-0 transition-colors"
          >
            <Trash className="w-3.5 h-3.5 text-slate-500" />
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

