/**
 * @fileoverview Sidebar lateral del dashboard.
 * Implementa navegación colapsable con branding, módulos y usuario.
 * Diseño inspirado en petro-flow adaptado a los tokens de Brito.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Truck,
  Navigation,
  Users,
  FileText,
  Package,
  Settings,
  HelpCircle,
  Building,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'

import { useSidebar } from '@/src/core/presentation/context/SidebarContext'

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: LucideIcon
  href: string
}

const MAIN_MODULES: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Recursos Humanos', icon: Briefcase, href: '/hr' },
  { label: 'Flotilla', icon: Truck, href: '/fleet' },
  { label: 'Viajes', icon: Navigation, href: '/trips' },
  { label: 'Inventario', icon: Package, href: '/inventory' },
  { label: 'Directorio', icon: Users, href: '/directory' },
  { label: 'Facturación', icon: FileText, href: '/billing' },
  { label: 'Logística', icon: Package, href: '/logistics' },
]

const ADMIN_MODULES: NavItem[] = [
  { label: 'Usuarios', icon: Users, href: '/users' },
  { label: 'Compañías', icon: Building, href: '/companies' },
]

const SYSTEM_ITEMS: NavItem[] = [
  { label: 'Configuración', icon: Settings, href: '/settings' },
  { label: 'Soporte', icon: HelpCircle, href: '/support' },
]

// ─── AppSidebar Component ────────────────────────────────────────────────────

/**
 * Sidebar principal del dashboard con navegación colapsable.
 * Soporta expand/collapse con transición suave.
 */
export function AppSidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'sticky top-0 z-20 flex h-svh flex-col border-r border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-[width] duration-200 ease-linear',
        isCollapsed ? 'w-14' : 'w-64',
      )}
    >
      {/* Header / Logo */}
      <div className={cn('flex items-center border-b border-stone-100 dark:border-zinc-800 h-14 shrink-0', isCollapsed ? 'justify-center px-2' : 'px-4 gap-3')}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-8 rounded-lg bg-[#1a5c3a] text-white font-headline font-bold text-[10px] shrink-0">
            SB
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-on-surface dark:text-zinc-100 font-headline truncate">
                Sociedad Brito
              </span>
              <span className="text-[10px] text-on-surface-variant dark:text-zinc-500 truncate">
                Logística & Suministro
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* Modules */}
        {!isCollapsed && (
          <p className="px-2 mb-2 text-[10px] tracking-[0.2em] uppercase text-on-surface-variant font-medium">
            Módulos
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {MAIN_MODULES.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all',
                    isActive
                      ? 'bg-[#1a5c3a]/5 dark:bg-[#2ecc71]/10 text-[#1a5c3a] dark:text-[#2ecc71] font-bold'
                      : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100',
                    isCollapsed && 'justify-center px-2',
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>


        {/* Separator */}
        <div className="mx-2 my-3 h-px bg-outline-variant/20 dark:bg-zinc-700/50" />

        {/* Admin */}
        {!isCollapsed && (
          <p className="px-2 mb-2 text-[10px] tracking-[0.2em] uppercase text-on-surface-variant dark:text-zinc-500 font-medium">
            Administración
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {ADMIN_MODULES.map((item) => {
            const isActive = pathname === item.href
            return (
             <li key={item.href}>
              <Link 
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all',
                  isActive
                    ? 'bg-[#1a5c3a]/5 text-[#1a5c3a] font-bold'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900',
                    isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="size-4 shrink-0 pointer-events-none" />
                {!isCollapsed && <span className="truncate pointer-events-none">{item.label}</span>}
              </Link>
             </li>
            )
          })}
        </ul>

        {/* Separator */}
        <div className="mx-2 my-3 h-px bg-outline-variant/20" />

        {/* System */}
        {!isCollapsed && (
          <p className="px-2 mb-2 text-[10px] tracking-[0.2em] uppercase text-on-surface-variant font-medium">
            Sistema
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {SYSTEM_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all',
                    isActive
                      ? 'bg-[#1a5c3a]/5 text-[#1a5c3a] font-bold'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900',
                    isCollapsed && 'justify-center px-2',
                  )}
                >
                  <item.icon className="size-4 shrink-0 pointer-events-none" />
                  {!isCollapsed && <span className="truncate pointer-events-none">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer / User */}
      <div className="border-t border-stone-100 dark:border-zinc-800 p-3">

        {/* User */}
        <div className={cn('flex items-center gap-3 rounded-xl p-2 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-stone-100 dark:hover:border-zinc-700', isCollapsed && 'justify-center')}>
          <div className="flex items-center justify-center size-8 rounded-full bg-[#1a5c3a]/10 text-[#1a5c3a] text-xs font-bold shrink-0">
            TB
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-bold text-stone-900 dark:text-zinc-100 truncate tracking-tight">
                Transportes Brito
              </span>
              <span className="text-[11px] text-stone-500 dark:text-zinc-500 font-medium truncate">
                Administrador
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
