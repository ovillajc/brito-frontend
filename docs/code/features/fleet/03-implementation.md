# Implementación Módulo de Flotilla (Fleet) - Refactor UI

## 1. Patrón Arquitectónico (Clean Architecture & Atomic Design)

### Next.js Router como Envoltorios (Wrappers)
Con el fin de desacoplar completamente la interfaz de usuario de las restricciones nativas de enrutamiento del marco de trabajo (Next.js App Router), las siguientes páginas (pages) se modificaron para actuar exclusivamente como `wrappers` importando las verdaderas páginas desde la carpeta `src/features`:

- `app/(dashboard)/fleet/page.tsx`
- `app/(dashboard)/fleet/operators/page.tsx`
- `app/(dashboard)/fleet/tractors/page.tsx`
- `app/(dashboard)/fleet/trailers/page.tsx`
- `app/(dashboard)/fleet/units/page.tsx`

La lógica, el renderizado de la UI y la conexión con el estado se han trasladado a: 
`src/features/fleet/presentation/components/pages/*`

### Extracción de Átomos y Moléculas Repetidos
Varias secciones como los listados de tractores, remolques y operadores utilizaban componentes complejos idénticos (`<table>`, `<thead>`, `Toolbar de Filtros`).
Aplicando los principios definidos en `AGENTS.md`:

1. **`Table` (Atoms)**: Extracción en `src/core/presentation/components/ui/table.tsx` para proporcionar una API unificada (`Table`, `TableBody`, `TableCell`, `TableRow`, etc.), manteniendo todos los estilos definidos para estandarizar *Surface Containers* y bordes.
2. **`DataTableToolbar` (Molecule)**: Extracción de la herramienta de barra de búsqueda y filtros en `src/core/presentation/components/molecules/data-table-toolbar.tsx`.

## 2. Refactorización de Modales de Flotilla y Cards
La gestión de unidades armadas ("Nuevo Armado") ya no navega hacia otra ruta independiente con pérdida de contexto, sino que utiliza una interfaz modular renderizada condicionalmente utilizando `UnitAssemblyModal`. Además, la lógica visual de las "Tarjetas de Unidades Activas" en `UnitsPage` fue aislada a `UnitCard` en `src/features/fleet/presentation/components/organisms/`.

## 3. Pruebas Unitarias (Tests)
Todos los componentes de página recién abstraidos (`OperatorsPage`, `FleetPage`, etc.) cuentan con sus respectivas pruebas unitarias con **Vitest**.
Ubicación de Tests: `test/features/fleet/presentation/components/pages/*.test.tsx`.

**Estrategia:**
No se testea el funcionamiento del mock de Supabase, sino cómo el componente reacciona mediante los custom hooks expuestos en `use-fleet.ts`. Se evalúa:
1. Renderizado Condicional del Loading Skeleton.
2. Renderizado Completo y parsing de los Data Structures según los Mock objects.

---
**Fecha de finalización de Fase UI**: 7 de Abril de 2026.
