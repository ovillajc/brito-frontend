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
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  { label: 'Flotilla', icon: Truck, href: '/fleet' },
  { label: 'Viajes', icon: Navigation, href: '/dashboard/trips' },
  { label: 'Directorio', icon: Users, href: '/dashboard/directory' },
  { label: 'Facturación', icon: FileText, href: '/dashboard/billing' },
  { label: 'Logística', icon: Package, href: '/dashboard/logistics' },
]

const ADMIN_MODULES: NavItem[] = [
  { label: 'Usuarios', icon: Users, href: '/dashboard/users' },
  { label: 'Compañías', icon: Building, href: '/dashboard/companies' },
]

const SYSTEM_ITEMS: NavItem[] = [
  { label: 'Configuración', icon: Settings, href: '/dashboard/settings' },
  { label: 'Soporte', icon: HelpCircle, href: '/dashboard/soporte' },
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
        'sticky top-0 z-20 flex h-svh flex-col border-r border-outline-variant/30 bg-surface-container-lowest transition-[width] duration-200 ease-linear',
        isCollapsed ? 'w-14' : 'w-64',
      )}
    >
      {/* Header / Logo */}
      <div className={cn('flex items-center border-b border-outline-variant/20 h-14 shrink-0', isCollapsed ? 'justify-center px-2' : 'px-4 gap-3')}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-on-primary font-headline font-bold text-sm shrink-0">
            SB
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-on-surface font-headline truncate">
                Sociedad Brito
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
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
        <div className="mx-2 my-3 h-px bg-outline-variant/20" />

        {/* Admin */}
        {!isCollapsed && (
          <p className="px-2 mb-2 text-[10px] tracking-[0.2em] uppercase text-on-surface-variant font-medium">
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
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
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
      <div className="border-t border-outline-variant/20 p-2">

        {/* User */}
        <div className={cn('flex items-center gap-3 rounded-lg p-2 mt-1', isCollapsed && 'justify-center')}>
          <div className="flex items-center justify-center size-8 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-bold shrink-0">
            AD
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-on-surface truncate">
                Admin Brito
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                Administrador
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
