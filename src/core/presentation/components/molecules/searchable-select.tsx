'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  error?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  disabled = false,
  isLoading = false,
  className,
  error = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filteredOptions = useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(lower))
  }, [options, search])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearch('')
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006d37]/30 transition-colors",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          error ? "border-red-500 focus:ring-red-500/30" : ""
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-stone-500")}>
          {isLoading ? 'Cargando...' : selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="size-4 opacity-50 ml-2 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center px-3 border-b border-stone-100 dark:border-zinc-700">
            <Search className="size-4 text-stone-400 shrink-0" />
            <input
              autoFocus
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm p-3 placeholder:text-stone-400 dark:text-zinc-100"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="p-3 text-sm text-center text-stone-500">No se encontraron resultados.</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-stone-50 dark:hover:bg-zinc-700/50 flex items-center justify-between",
                    value === option.value ? "bg-stone-50 dark:bg-zinc-700/50 font-medium text-[#1a5c3a] dark:text-emerald-400" : "text-stone-700 dark:text-zinc-300"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check className="size-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
