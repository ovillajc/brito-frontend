'use client'

import React, { useMemo } from 'react'
import { cn } from '@/src/core/infrastructure/utils/cn'

interface DateTimePicker24hProps {
  value: string // Expects YYYY-MM-DDTHH:mm
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

export function DateTimePicker24h({ value, onChange, disabled, error, className }: DateTimePicker24hProps) {
  const { datePart, hourPart, minutePart } = useMemo(() => {
    if (!value) return { datePart: '', hourPart: '00', minutePart: '00' }
    
    // Asume que el valor viene en formato YYYY-MM-DDTHH:mm
    const [date, time] = value.split('T')
    if (!time) return { datePart: date || '', hourPart: '00', minutePart: '00' }
    
    const [h, m] = time.split(':')
    return { datePart: date, hourPart: h || '00', minutePart: m || '00' }
  }, [value])

  const getTodayDateString = () => {
    const d = new Date()
    const tzOffset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0]
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (!newDate) {
      onChange('')
      return
    }
    const newDateTime = `${newDate}T${hourPart}:${minutePart}`
    onChange(newDateTime)
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDateTime = `${datePart || getTodayDateString()}T${e.target.value}:${minutePart}`
    onChange(newDateTime)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDateTime = `${datePart || getTodayDateString()}T${hourPart}:${e.target.value}`
    onChange(newDateTime)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const baseInputClass = cn(
    "h-10 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006d37]/30",
    disabled && "opacity-50 cursor-not-allowed",
    error && "border-red-500 focus-visible:ring-red-500/30"
  )

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      <input
        type="date"
        value={datePart}
        onChange={handleDateChange}
        disabled={disabled}
        className={cn(baseInputClass, "flex-2 min-w-[130px]")}
      />
      <div className="flex items-center gap-1 flex-1 min-w-[110px]">
        <select
          value={hourPart}
          onChange={handleHourChange}
          disabled={disabled || !datePart}
          className={cn(baseInputClass, "px-2 flex-1")}
        >
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="text-stone-500 font-bold">:</span>
        <select
          value={minutePart}
          onChange={handleMinuteChange}
          disabled={disabled || !datePart}
          className={cn(baseInputClass, "px-2 flex-1")}
        >
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  )
}
