'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  LayoutDashboard,
  Receipt,
  Route,
  HandCoins,
  Truck,
  Activity,
  Package,
  Layers,
  Users,
  Briefcase,
  UserPlus,
  Clock,
  History,
  Calculator,
  ShieldCheck,
} from 'lucide-react'

export type ModuleNavItem = {
  name: string
  href: string
  iconKey: keyof typeof ICONS
}

interface ModuleNavTabsProps {
  items: ModuleNavItem[]
}

const ICONS = {
  LayoutDashboard,
  Receipt,
  Route,
  HandCoins,
  Truck,
  Activity,
  Package,
  Layers,
  Users,
  Briefcase,
  UserPlus,
  Clock,
  History,
  Calculator,
  ShieldCheck,
} as const

function getActiveHref(pathname: string, items: ModuleNavItem[]): string | null {
  let best: ModuleNavItem | null = null

  for (const item of items) {
    const isExact = pathname === item.href
    const isNested = pathname.startsWith(`${item.href}/`)
    if (!isExact && !isNested) continue

    if (!best || item.href.length > best.href.length) {
      best = item
    }
  }

  return best?.href ?? null
}

export function ModuleNavTabs({ items }: ModuleNavTabsProps) {
  const pathname = usePathname()

  const activeHref = useMemo(() => getActiveHref(pathname, items), [pathname, items])

  return (
    <nav className="flex items-center gap-1 border-b border-outline-variant/30">
      {items.map((item) => {
        const isActive = item.href === activeHref
        const Icon = ICONS[item.iconKey]
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative rounded-t-lg',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
            )}
          >
            <Icon className="size-4" />
            {item.name}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </Link>
        )
      })}
    </nav>
  )
}
