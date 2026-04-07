# Documentación Técnica: Módulo Dashboard

## Introducción
El módulo Dashboard proporciona una vista consolidada de las métricas clave (KPIs) operativas y financieras, así como acceso rápido a los módulos del sistema y actividad reciente. Ha sido rediseñado para ofrecer una navegación plana ("flat layout") que mejora la visibilidad de los datos críticos.

## Arquitectura de Capas (Clean Architecture)

### 1. Domain (Dominio)
Localización: `src/features/dashboard/domain/`
- **Entities**: `KPIEntity` define la estructura de una métrica, incluyendo su valor, tendencia, unidad y metadatos visuales (iconos, colores).
- **Repositories**: `IDashboardRepository` define el contrato para obtener datos operativos y financieros.

### 2. Application (Aplicación)
Localización: `src/features/dashboard/application/`
- **Use Cases**:
  - `GetOperativeKPIsUseCase`: Orquesta la obtención de métricas de flota, viajes y alertas.
  - `GetFinancialKPIsUseCase`: Orquesta la obtención de ingresos, gastos y márgenes.
- **Pattern Either**: Implementado para asegurar un manejo de errores robusto y explícito en la UI.

### 3. Infrastructure (Infraestructura)
Localización: `src/features/dashboard/infrastructure/`
- **Repositories**: `MockDashboardRepository` ofrece una implementación con datos simulados para desarrollo y testing sin dependencias de backend activo.

### 4. Presentation (Presentación)
Localización: `src/features/dashboard/presentation/`
- **Store**: `useDashboardStore` (Zustand) gestiona el estado de las KPIs, estados de carga y errores de forma global para el feature.
- **Hooks**: `useDashboard` centraliza la lógica de inicialización y actualización de datos al montar el componente.
- **Components**:
  - `KPICard`: Átomo para mostrar métricas individuales con soporte para tendencias.
  - `DashboardKPICards`: Organismo que agrupa las tarjetas de métricas por categoría.
  - `DashboardModuleCards`: Enlaces rápidos a otros módulos funcionales.
  - `DashboardActivity`: Timeline de eventos recientes y estadísticas rápidas.

## Flujo de Datos
1. El componente `DashboardContainer` invoca el hook `useDashboard`.
2. `useDashboard` dispara las acciones del `useDashboardStore`.
3. El store ejecuta los `UseCases` (inyectando el repositorio).
4. El repositorio devuelve un `Either`. 
5. El store actualiza el estado y la UI se re-renderiza con los nuevos datos o el estado de error.

## Diseño y UX
- **Responsive**: Ajuste dinámico de columnas para móvil, tablet y escritorio.
- **Feedback Visual**: Implementación de estados de carga y manejo de errores amigable.
- **Consistency**: Uso estricto de los tokens de diseño (colores, tipografía) definidos en el sistema de diseño central.
