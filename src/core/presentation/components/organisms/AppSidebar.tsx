/**
 * @fileoverview Sidebar lateral del dashboard.
 * Implementa navegación colapsable con branding, módulos y usuario.
 * Diseño inspirado en petro-flow adaptado a los tokens de Brito.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard,
  Truck,
  Navigation,
  Users,
  FileText,
  Package,
  Fuel,
  Wallet,
  Wrench,
  ShieldCheck,
  Settings,
  HelpCircle,
  Building,
  Briefcase,
  LogOut,
  User as UserIcon,
  ChevronUp,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'

import { useSidebar } from '@/src/core/presentation/context/SidebarContext'
import { useLogout } from '@/src/features/auth/presentation/hooks/use-logout'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import type { AuthUserEntity } from '@/src/features/auth/domain/entities/auth-user.entity'


// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  requiredPermission?: string
  requiredPermissions?: string[]
}

const MAIN_MODULES: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Recursos Humanos', icon: Briefcase, href: '/hr' },
  { label: 'Flotilla', icon: Truck, href: '/fleet', requiredPermission: 'fleet:view' },
  {
    label: 'Viajes',
    icon: Navigation,
    href: '/trips',
    requiredPermissions: ['trips:view_all', 'trips:manage_all', 'trips:view_walmart', 'trips:manage_walmart', 'trips:manage_logistica'],
  },
  { label: 'QHSE', icon: ShieldCheck, href: '/qhse', requiredPermission: 'qhse:view' },
  { label: 'Combustible', icon: Fuel, href: '/fuel', requiredPermission: 'fuel:view' },
  { label: 'Mantenimiento', icon: Wrench, href: '/maintenance', requiredPermission: 'maintenance:view' },
  { label: 'Gastos', icon: Wallet, href: '/expenses', requiredPermissions: ['expenses:manage', 'expenses:create', 'expenses:view'] },
  { label: 'Inventario', icon: Package, href: '/inventory', requiredPermission: 'inventory:view' },
  { label: 'Directorio', icon: Users, href: '/directory' },
  { label: 'Facturación', icon: FileText, href: '/billing', requiredPermission: 'billing:view' },
  { label: 'Logística', icon: Package, href: '/logistics', requiredPermission: 'trips:view_all' },
  { label: 'Tracking', icon: Navigation, href: '/tracking', requiredPermissions: ['tracking:manage', 'trips:view_all'] },
]

const ADMIN_MODULES: NavItem[] = [
  { label: 'BI Gerencial', icon: BarChart3, href: '/bi', requiredPermission: 'view_all' },
  { label: 'Usuarios', icon: Users, href: '/users', requiredPermission: 'all_access' },
  { label: 'Compañías', icon: Building, href: '/companies', requiredPermission: 'all_access' },
]

const SYSTEM_ITEMS: NavItem[] = [
  { label: 'Configuración', icon: Settings, href: '/settings', requiredPermission: 'all_access' },
  { label: 'Soporte', icon: HelpCircle, href: '/support' },
]


/**
 * Sidebar principal del dashboard con navegación colapsable.
 * Soporta expand/collapse con transición suave.
 */
// ─── AppSidebar Component ────────────────────────────────────────────────────

interface AppSidebarProps {
  initialUser?: AuthUserEntity | null
}

export function AppSidebar({ initialUser }: AppSidebarProps) {
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()
  const { handleLogout } = useLogout()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser ?? initialUser ?? null

  const hasPermission = (permission: string) => {
    if (!user) return false
    if (user.permissions.includes('all_access')) return true
    if (permission && user.permissions.includes('view_all') && permission.includes('view')) return true
    return permission ? user.permissions.includes(permission) : false
  }

  const isMonitoringRole = user?.roles.some(r => r.name === 'monitoreo')
  const isWalmartCoordinatorRole = user?.roles.some(r => r.name === 'coordinador_walmart')
  const isFinanceSupportRole = user?.roles.some(r => r.name === 'apoyo_finanzas_full')
  const isExpenseControllerRole = user?.roles.some(r => r.name === 'controlador_gastos')
  const isQhseSupervisorRole = user?.roles.some(r => r.name === 'supervisor_qhse')
  const isLogisticsRestrictedRole = user?.roles.some(r =>
    r.name === 'jefe_logistica' ||
    r.name === 'jefe_logisitica' ||
    r.name === 'auxiliar_logistica' ||
    r.name === 'auxiliar_logisitica'
  )
  const isWalmartOpsManagerRole = user?.roles.some(
    r => r.name === 'gerente_operaciones_walmart' || r.name === 'gerente operaciones walmart'
  )
  const isSuperUser = user?.permissions.includes('all_access') || user?.permissions.includes('view_all')
  const isRestrictedMonitoring = isMonitoringRole && !isSuperUser
  const isRestrictedWalmartCoordinator =
    !!isWalmartCoordinatorRole &&
    !isSuperUser &&
    !hasPermission('trips:view_all') &&
    !hasPermission('trips:manage_all')
  const isRestrictedWalmartOpsManager = !!isWalmartOpsManagerRole && !isSuperUser
  const isRestrictedExpenseController = !!isExpenseControllerRole && !isSuperUser
  const isRestrictedLogisticsBoss = !!isLogisticsRestrictedRole && !isSuperUser
  const isRestrictedQhseSupervisor = !!isQhseSupervisorRole && !isSuperUser

  const homeHref =
    isRestrictedMonitoring || isRestrictedWalmartCoordinator || isRestrictedLogisticsBoss || isRestrictedQhseSupervisor
      ? '/trips/list'
      : (isRestrictedExpenseController ? '/expenses' : '/dashboard')
  const tripsHref = isRestrictedWalmartCoordinator
    ? '/trips/list'
    : (isRestrictedLogisticsBoss ? '/trips/list' : ((isFinanceSupportRole || isRestrictedExpenseController) ? '/trips/fuel/load' : '/trips'))

  const filteredMainModules = MAIN_MODULES.filter(item => {
    if (isRestrictedQhseSupervisor && !['/trips', '/qhse'].includes(item.href)) return false
    if (isRestrictedLogisticsBoss && item.href !== '/trips') return false
    if (isRestrictedExpenseController && !['/expenses', '/trips'].includes(item.href)) return false
    if (isRestrictedMonitoring && !item.href.startsWith('/trips')) return false
    if (isRestrictedWalmartCoordinator && !item.href.startsWith('/trips')) return false
    if (isRestrictedWalmartOpsManager && ['/inventory', '/fuel'].includes(item.href)) return false
    if (isFinanceSupportRole && item.href === '/trips') return true
    if (isRestrictedExpenseController && item.href === '/trips') return true
    if (isRestrictedLogisticsBoss && item.href === '/trips') return true
    if (item.requiredPermissions?.length) return item.requiredPermissions.some(hasPermission)
    return !item.requiredPermission || hasPermission(item.requiredPermission)
  })

  const filteredAdminModules = ADMIN_MODULES.filter(item => {
    if (isRestrictedMonitoring || isRestrictedWalmartCoordinator || isRestrictedLogisticsBoss || isRestrictedQhseSupervisor) return false
    if (isRestrictedWalmartOpsManager && item.href === '/bi') return false
    return !item.requiredPermission || hasPermission(item.requiredPermission)
  })

  const filteredSystemItems = SYSTEM_ITEMS.filter(item => {
    if (isRestrictedMonitoring || isRestrictedWalmartCoordinator || isRestrictedLogisticsBoss || isRestrictedQhseSupervisor) return false
    return !item.requiredPermission || hasPermission(item.requiredPermission)
  })

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    // Redirect monitoring users if they are not in trips/profile
    if (isRestrictedMonitoring && 
        !pathname.startsWith('/trips') && 
        !pathname.startsWith('/profile')
    ) {
      window.location.href = '/trips'
    }

    if (isRestrictedWalmartCoordinator && 
        !pathname.startsWith('/trips') && 
        !pathname.startsWith('/profile')
    ) {
      window.location.href = '/trips/list'
    }

    if (
      isRestrictedExpenseController &&
      !pathname.startsWith('/expenses') &&
      !pathname.startsWith('/trips/fuel/load') &&
      !pathname.startsWith('/profile')
    ) {
      window.location.href = '/expenses'
    }

    if (
      isRestrictedLogisticsBoss &&
      !pathname.startsWith('/trips/list') &&
      !pathname.startsWith('/profile')
    ) {
      window.location.href = '/trips/list'
    }

    if (
      isRestrictedQhseSupervisor &&
      !pathname.startsWith('/trips') &&
      !pathname.startsWith('/qhse') &&
      !pathname.startsWith('/profile')
    ) {
      window.location.href = '/trips/list'
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isRestrictedMonitoring, isRestrictedWalmartCoordinator, isRestrictedExpenseController, isRestrictedLogisticsBoss, isRestrictedQhseSupervisor, pathname])

  return (
    <aside
      className={cn(
        'sticky top-0 z-20 flex h-svh flex-col border-r border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-[width] duration-200 ease-linear',
        isCollapsed ? 'w-14' : 'w-64',
      )}
    >
      {/* Header / Logo */}
      <div className={cn('flex items-center border-b border-stone-100 dark:border-zinc-800 h-14 shrink-0', isCollapsed ? 'justify-center px-2' : 'px-4 gap-3')}>
        <Link href={homeHref} className="flex items-center gap-3 min-w-0">
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
          {filteredMainModules.map((item) => {
            const href = item.href === '/trips' ? tripsHref : item.href
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href)) ||
              (item.href === '/trips' && pathname.startsWith('/trips'))

            return (
              <li key={href}>
                <Link
                  href={href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all',
                    isActive
                      ? 'bg-[#1a5c3a]/5 dark:bg-primary-container/10 text-[#1a5c3a] dark:text-primary-container font-bold'
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
          {filteredAdminModules.map((item) => {
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
          {filteredSystemItems.map((item) => {
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
      <div className="border-t border-stone-100 dark:border-zinc-800 p-3 relative" ref={menuRef}>
        
        {/* Profile Dropdown Menu */}
        {isProfileMenuOpen && (
          <div className={cn(
            "absolute z-50 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden py-1 animate-in fade-in duration-200",
            isCollapsed 
              ? "left-full ml-4 bottom-0 w-48 slide-in-from-left-2" 
              : "bottom-full left-3 right-3 mb-2 slide-in-from-bottom-2"
          )}>
            <Link 
              href="/profile" 
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <UserIcon className="size-4" />
              <span>Mi Perfil</span>
            </Link>
            <button 
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              onClick={() => {
                setIsProfileMenuOpen(false)
                handleLogout()
              }}
            >
              <LogOut className="size-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* User Trigger */}
        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={cn(
            'flex items-center gap-3 rounded-xl p-2 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border hover:border-stone-100 dark:hover:border-zinc-700 select-none', 
            isCollapsed && 'justify-center',
            isProfileMenuOpen ? 'bg-stone-50 dark:bg-zinc-800 border-stone-100 dark:border-zinc-700' : 'border-transparent'
          )}
        >
          <div className="flex items-center justify-center size-8 rounded-full bg-[#1a5c3a]/10 text-[#1a5c3a] text-xs font-bold shrink-0">
            {user?.fullName?.substring(0, 2).toUpperCase() || 'UB'}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-stone-900 dark:text-zinc-100 truncate tracking-tight">
                  {user?.fullName || 'Usuario Brito'}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-zinc-500 font-medium truncate">
                  {user?.roles[0]?.name.replace(/_/g, ' ') || 'Sin Rol'}
                </span>
              </div>
              <ChevronUp className={cn("size-4 text-stone-400 dark:text-zinc-500 transition-transform duration-200", isProfileMenuOpen && "rotate-180")} />
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
