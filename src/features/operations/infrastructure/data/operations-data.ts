/**
 * @fileoverview Datos de categorías y operaciones por cliente.
 * Actúa como la fuente de datos estática (sin API) hasta que se requiera persistencia.
 */

import type {
  OperationCategoryEntity,
  ClientOperationEntity,
  CategoryOperationEntity,
} from '@/src/features/operations/domain/entities/operation-category.entity'

export const OPERATION_CATEGORIES: OperationCategoryEntity[] = [
  {
    id: 'clientes',
    label: 'Por Cliente',
    description: 'Operaciones organizadas por cuenta cliente',
    icon: 'Building2',
    color: 'text-[#1a5c3a]',
    bgColor: 'bg-[#1a5c3a]/8',
  },
  {
    id: 'logistica',
    label: 'Logística',
    description: 'Rutas, cargas y despachos',
    icon: 'Route',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'administracion',
    label: 'Administración',
    description: 'Documentos, contratos y facturación operativa',
    icon: 'ClipboardList',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'recursos',
    label: 'Recursos',
    description: 'Personal, unidades y equipos asignados',
    icon: 'Users2',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
]

export const CLIENT_OPERATIONS: ClientOperationEntity[] = [
  {
    id: 'walmart',
    name: 'Walmart',
    description: 'Operaciones de distribución y logística para la cuenta Walmart de México',
    href: '/operations/clients/walmart',
    tag: 'Activo',
    color: 'text-[#0071CE]',
    bgColor: 'bg-[#0071CE]/8',
    borderColor: 'border-[#0071CE]/20',
  },
]

export const LOGISTICS_OPERATIONS: CategoryOperationEntity[] = [
  { id: 'routes', label: 'Rutas Activas', description: 'Visualización de rutas en operación', href: '/trips', icon: 'Map', badge: 'Ver viajes' },
  { id: 'dispatch', label: 'Despachos', description: 'Control de salidas y llegadas', href: '/trips', icon: 'PackageCheck' },
]

export const ADMIN_OPERATIONS: CategoryOperationEntity[] = [
  { id: 'billing', label: 'Facturación', description: 'Facturas y comprobantes de operación', href: '/billing', icon: 'FileText' },
  { id: 'expenses', label: 'Gastos Operativos', description: 'Registro de gastos por operación', href: '/expenses', icon: 'Wallet' },
]

export const RESOURCES_OPERATIONS: CategoryOperationEntity[] = [
  { id: 'operators', label: 'Operadores', description: 'Choferes asignados por cliente', href: '/hr', icon: 'UserCheck' },
  { id: 'fleet', label: 'Flotilla', description: 'Unidades asignadas por operación', href: '/fleet', icon: 'Truck' },
]
