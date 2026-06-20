'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/src/core/infrastructure/utils/cn'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  icon?: React.ElementType
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const selectedIndex = options.findIndex((opt) => opt.value === value)
    if (selectedIndex !== -1 && refs.current[selectedIndex] && containerRef.current) {
      const selectedEl = refs.current[selectedIndex]!
      setIndicatorStyle({
        left: selectedEl.offsetLeft,
        width: selectedEl.offsetWidth,
        opacity: 1,
      })
    }
  }, [value, options])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex items-center p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-xl border border-stone-200 dark:border-zinc-700',
        className
      )}
    >
      <div
        className="absolute top-1 bottom-1 rounded-[10px] bg-white dark:bg-zinc-900 shadow-xs transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) border border-stone-200/50 dark:border-zinc-700/50"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
      {options.map((option, index) => {
        const Icon = option.icon
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors duration-300 rounded-[10px] whitespace-nowrap',
              isSelected
                ? 'text-[#1a5c3a] dark:text-primary-container'
                : 'text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            {Icon && <Icon className="size-4" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
