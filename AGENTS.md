# Standard Development Guide: agents.md

## 0. Seguridad: Archivos .env (Regla Estricta)

Queda **estrictamente prohibido** abrir, leer o analizar cualquier archivo cuyo nombre comience con `.env` (por ejemplo: `.env`, `.env.local`, `.env.production`, etc.) **sin permiso explícito del usuario** en el mensaje actual. Si se requiere información de variables de entorno, el usuario debe pegar únicamente los valores no sensibles o confirmar explícitamente el archivo a revisar.

Este documento define las reglas de oro para la construcción de código en este proyecto. Todo agente de IA o desarrollador debe adherirse a estas normas para garantizar la escalabilidad, mantenibilidad y reusabilidad del software.

---

## 1. Arquitectura del Sistema (Clean Architecture)

Se implementará **Clean Architecture** para desacoplar la lógica de negocio de los detalles de implementación (UI, Frameworks, DB).

### Estructura de Carpetas Clave:

Cada módulo funcional (`src/features/<module>`) debe contener las siguientes 4 capas:

1. **`domain`**: Entidades del negocio, interfaces de repositorios y modelos de datos puros. **No debe importar nada de las otras capas.**
2. **`application`**: Casos de uso (`Use Cases`). Aquí reside la orquestación de la lógica de negocio. Solo importa de `domain`.
3. **`infrastructure`**: Implementaciones concretas de los repositorios, llamadas a APIs, adaptadores y **mapeadores de datos (Mappers)**. Importa de `domain` y `application`.
4. **`presentation`**: Componentes de UI (organizados por Atomic Design), Stores de Zustand, hooks y lógica de vista. Importa de `application` y `domain`.

### Componentes compartidos (`src/core/`):

La lógica y los componentes transversales a múltiples features deben residir en `src/core/`, siguiendo la misma separación de capas:

* `src/core/presentation/components/ui/` — Componentes Shadcn/Atoms reutilizables.
* `src/core/presentation/components/organisms/` — Layout global (Header, Sidebar).
* `src/core/presentation/hooks/` — Hooks globales.
* `src/core/infrastructure/` — Utilidades compartidas (`cn`, http clients, etc.).
* `src/core/domain/` — Interfaces y tipos compartidos entre features.

### Dirección de Dependencias (Regla Estricta):

```
presentation → application → domain ← infrastructure
```

Ninguna capa puede importar de una capa superior. `domain` es el centro y no conoce a nadie.

---

## 2. TypeScript Estricto

El proyecto opera con TypeScript en modo estricto. Las siguientes reglas son **obligatorias**:

* **Prohibido `any`:** No se permite el uso de `any` bajo ninguna circunstancia. Usar `unknown` y aplicar narrowing cuando se desconozca el tipo.
* **Interfaces para contratos, Types para uniones:** Usar `interface` para definir la forma de objetos y contratos de repositorios. Usar `type` para uniones, intersecciones y tipos derivados.
* **Discriminated Unions para estados:** Los estados complejos (loading, success, error) deben modelarse como uniones discriminadas, no como múltiples booleanos.

```typescript
// ❌ Mal: booleanos sueltos
interface State {
  isLoading: boolean
  isError: boolean
  data: User | null
  error: string | null
}

// ✅ Bien: unión discriminada
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Failure }
```

* **Genéricos documentados:** Todo tipo genérico debe incluir un comentario JSDoc que explique cada parámetro de tipo.
* **Enums prohibidos:** Preferir `as const` objects o union types sobre `enum` de TypeScript, ya que los enums generan código JavaScript innecesario y tienen comportamientos inesperados.

```typescript
// ❌ Evitar
enum Status { Active, Inactive }

// ✅ Preferir
const STATUS = { Active: 'active', Inactive: 'inactive' } as const
type Status = typeof STATUS[keyof typeof STATUS]
```

---

## 3. Nomenclatura y Convenciones de Archivos

### Archivos:

| Tipo                 | Convención                                   | Ejemplo                 |
| -------------------- | -------------------------------------------- | ----------------------- |
| Componentes React    | `PascalCase.tsx`                             | `UnitHeader.tsx`        |
| Hooks                | `use-kebab-case.ts`                          | `use-tracking-store.ts` |
| Utilidades / helpers | `kebab-case.ts`                              | `date-formatter.ts`     |
| Tipos / Interfaces   | `kebab-case.ts` o agrupados en `entities.ts` | `trip-entity.ts`        |
| Use Cases            | `PascalCase.ts`                              | `GetActiveTrip.ts`      |
| Stores Zustand       | `store.ts` dentro de `presentation/`         | `store.ts`              |
| Tests                | `*.test.ts` / `*.test.tsx` junto al archivo  | `UnitHeader.test.tsx`   |

### Variables y Funciones:

* **Variables y funciones:** `camelCase`.
* **Componentes React:** `PascalCase`.
* **Constantes globales:** `UPPER_SNAKE_CASE`.
* **Tipos e interfaces:** `PascalCase` (ej. `TripEntity`, `IUserRepository`).
* **Prefijo `I` para interfaces de repositorio:** `IOrderRepository`, `ITrackingDatasource`.

---

## 4. Gestión de Estado y Flujo de Datos

Para mantener un flujo de datos predecible y reactivo:

* **Zustand como gestor global:** Se utilizará Zustand para crear stores de estado por feature. Cada store actúa como punto de entrada único para invocar los `Use Cases`.
* **TanStack Query (React Query) para datos del servidor:** Para todo data fetching que involucre caché, revalidación, paginación o polling, usar TanStack Query en lugar de `useEffect` + `useState` manual. Zustand se reserva para estado de UI y estado derivado del cliente.
* **RxJS solo cuando sea estrictamente necesario:** RxJS se usará exclusivamente para flujos de datos complejos que no puedan resolverse con Zustand o TanStack Query (ej. WebSockets con transformaciones complejas, debounce combinado con múltiples streams). **No es la herramienta por defecto.**
* **Exposición al Front:** El estado de Zustand expone los datos procesados por los Use Cases directamente a los componentes de la capa de presentación.

### Regla Anti-Prop-Drilling:

Si un prop se pasa a través de más de **2 niveles** de componentes, debe migrarse a un Context provider o al store de Zustand del feature correspondiente.

### Selectores Granulares en Zustand (Obligatorio para Rendimiento):

> [!IMPORTANT]
> Queda **estrictamente prohibido** desestructurar el store completo de Zustand. Todo componente debe suscribirse **exclusivamente a la pieza del estado que necesita** usando selectores atómicos. Hacerlo evita re-renderizados masivos que congelan el navegador.

```typescript
// ❌ MALA PRÁCTICA: Provoca re-renderizados de toda la página si *cualquier cosa* en el store cambia.
const { operators, fetchOperators } = useStore()

// ✅ BUENA PRÁCTICA: El componente solo se re-renderiza si cambia `operators`.
const operators = useStore((state) => state.operators)
const fetchOperators = useStore((state) => state.fetchOperators)
```

---

## 5. Regla de Oro: Next.js First (App Router)

**Descripción:** Se debe priorizar el uso de **React Server Components (RSC)** por defecto. Los **Client Components** (`'use client'`) solo se marcarán cuando exista interactividad (hooks como `useState`, `useEffect`, event handlers) o dependencias del navegador.

### Lineamientos de Implementación:

* **Data Fetching en el Servidor:** Los `Use Cases` que no dependan de interacciones de usuario deben ejecutarse directamente en Server Components usando `async/await` nativo. No envolver en `useEffect` lo que puede resolverse en el servidor.
* **Server Actions para Mutaciones:** Toda operación de escritura (crear, actualizar, eliminar) debe implementarse como **Server Action** (`'use server'`), no como un endpoint API manual, a menos que sea consumido por un cliente externo.
* **Composición de Componentes:** Mantener las hojas del árbol de componentes como Client Components y los nodos raíz/contenedores como Server Components. Los Client Components **no pueden importar** Server Components directamente; deben recibirlos como `children` o `props` de tipo `ReactNode`.
* **Streaming y Suspense:** Cada segmento de ruta debe definir un `loading.tsx` que sirva como Suspense boundary. Los componentes con data fetching independiente deben envolverse en `<Suspense fallback={<Skeleton />}>` para habilitar streaming.

### Convenciones de Archivos del App Router:

Cada segmento de ruta (`app/(group)/feature/`) debe incluir, según aplique:

| Archivo         | Propósito                                                  |
| --------------- | ---------------------------------------------------------- |
| `page.tsx`      | Server Component puro. Orquesta Use Cases e inyecta datos. |
| `layout.tsx`    | Layout persistente del segmento.                           |
| `loading.tsx`   | Skeleton/Suspense boundary automática.                     |
| `error.tsx`     | Error boundary del segmento (debe ser `'use client'`).     |
| `not-found.tsx` | Página 404 del segmento.                                   |

### Optimización de Recursos (Obligatorio):

* `next/image` (`<Image />`) para optimización automática de imágenes.
* `next/link` (`<Link />`) para prefetching de rutas.
* `next/font` para gestión de tipografías sin CLS (Cumulative Layout Shift).

### SEO y Metadatos:

Cada `page.tsx` debe exportar un objeto `metadata` (estático) o una función `generateMetadata` (dinámica) para definir `title`, `description` y `openGraph` desde la capa de `domain`.

### Interacción con Zustand (Hydration):

> [!IMPORTANT]
> Dado que Zustand vive en el cliente, los datos obtenidos en el servidor deben ser pasados al Store mediante un patrón de **Hydration**. No se debe forzar un componente a ser `'use client'` solo para obtener datos que Next.js puede resolver en el servidor.

---

## 6. Caching y Revalidación

* **`fetch` nativo con opciones de caché:** Para llamadas desde Server Components, usar la API extendida de `fetch` con `next: { revalidate: N }` o `next: { tags: ['tag'] }`.
* **`revalidatePath` / `revalidateTag`:** Tras mutaciones (Server Actions), invocar estas funciones para invalidar el caché de las rutas afectadas.
* **No cachear datos sensibles:** Cualquier dato que dependa de la sesión del usuario o sea privado debe usar `cache: 'no-store'`.

---

## 7. Reglas de React (Código Limpio)

### `useEffect` — Uso Restringido:

> [!CAUTION]
> `useEffect` es la fuente #1 de bugs en React moderno. Antes de escribir un `useEffect`, pregúntate:

1. **¿Puedo calcularlo durante el render?** → Usa una variable derivada o `useMemo`.
2. **¿Puedo obtenerlo en el servidor?** → Usa un Server Component o Server Action.
3. **¿Puedo manejarlo con un event handler?** → Hazlo en el `onClick`, `onSubmit`, etc.
4. **¿Es una suscripción a un sistema externo?** → Este es el caso legítimo para `useEffect`.

### Composición sobre Herencia:

Nunca extender componentes. Siempre componer usando `children`, render props o hooks.

### Hooks Custom Obligatorios:

Si un patrón de `useState` + `useEffect` (o cualquier combinación de hooks) se repite en **2 o más componentes**, debe extraerse a un hook custom reutilizable en:

* `src/features/<feature>/presentation/hooks/` si es específico del feature.
* `src/core/presentation/hooks/` si es transversal.

### Keys Estables:

Nunca usar el índice del array como `key` en listas renderizadas. Usar siempre un identificador único de la entidad.

### Memoización Consciente:

* Usar `React.memo()` solo cuando un componente recibe las mismas props frecuentemente y su render es costoso. No aplicar por defecto.
* Usar `useMemo` para cálculos derivados costosos, no para valores triviales.
* Usar `useCallback` solo cuando se pasa una función como prop a un componente memoizado.

---

## 8. Interfaz de Usuario (UI) y UX

### Atomic Design:

Los componentes deben organizarse en niveles de complejidad:

| Nivel         | Ubicación                                                   | Ejemplo                         |
| ------------- | ----------------------------------------------------------- | ------------------------------- |
| **Atoms**     | `src/core/presentation/components/ui/`                      | `Button`, `Badge`, `Input`      |
| **Molecules** | `src/core/presentation/components/molecules/` o feature     | `SearchBar`, `DateRangePicker`  |
| **Organisms** | `src/features/<feature>/presentation/components/organisms/` | `UnitHeader`, `TripTimeline`    |
| **Pages**     | `src/features/<feature>/presentation/pages/`                | `TrackingPage`, `DashboardPage` |

### Carga Asíncrona (Skeletons):

Todo componente que dependa de un proceso `async` debe implementar un **Skeleton Screen** que replique la estructura visual del contenido final. **No se permiten spinners genéricos** si el layout es predecible.

### Accesibilidad (a11y) Obligatoria:

* Todo elemento interactivo debe ser navegable por teclado (`tabIndex`, `onKeyDown`).
* Imágenes deben incluir `alt` descriptivo.
* Los formularios deben usar `<label>` asociados y atributos `aria-*` cuando sea necesario.
* Los colores deben cumplir con un ratio de contraste mínimo de **4.5:1** (WCAG AA).
* Los modales y drawers deben atrapar el foco y restaurarlo al cerrar.

---

## 9. Manejo de Formularios

* **React Hook Form + Zod:** Para TODO formulario del sistema, utilizar **React Hook Form** como gestor de estado del formulario y **Zod** como librería de validación de esquemas.
* **Schemas compartidos:** Los schemas de validación Zod deben definirse en `domain/` o `application/` del feature correspondiente para que puedan reutilizarse entre cliente y servidor (Server Actions).
* **Feedback inmediato:** Los errores de validación deben mostrarse inline junto al campo correspondiente, no en un toast genérico.

```typescript
// ✅ Ejemplo: Schema Zod en domain
import { z } from 'zod'

export const createTripSchema = z.object({
  origin: z.string().min(1, 'El origen es requerido'),
  destination: z.string().min(1, 'El destino es requerido'),
  operatorId: z.string().uuid('ID de operador inválido'),
  scheduledDate: z.date({ required_error: 'Fecha requerida' }),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
```

---

## 10. Capa de Mapeo Obligatoria (Data Mapper)

**Regla:** Toda respuesta de `infrastructure` debe pasar por un **Mapper** antes de llegar al `domain`.

* **Razón:** Si la API cambia un campo `user_id` a `uid`, solo cambias el Mapper y tu lógica de negocio permanece intacta.
* **Ubicación:** Los mappers residen en `infrastructure/mappers/`.

```typescript
// ✅ Ejemplo: Mapper en infrastructure
export class TripMapper {
  static toDomain(raw: TripApiResponse): TripEntity {
    return {
      id: raw.trip_id,
      origin: raw.origin_city,
      destination: raw.destination_city,
      status: raw.current_status as TripStatus,
      createdAt: new Date(raw.created_at),
    }
  }

  static toApi(entity: CreateTripInput): CreateTripApiPayload {
    return {
      origin_city: entity.origin,
      destination_city: entity.destination,
      operator_id: entity.operatorId,
    }
  }
}
```

---

## 11. Error Handling Unificado (Either Pattern)

**Regla:** Los Use Cases **nunca** deben lanzar excepciones (`throw`). Deben devolver un objeto de tipo `Either<Failure, Success>`.

* **Razón:** Obliga al desarrollador a manejar el escenario de error de forma explícita en la UI, evitando bloqueos inesperados.

```typescript
// ✅ Tipo Either en domain
export type Either<L, R> = { ok: false; error: L } | { ok: true; data: R }

export type Failure = {
  code: string
  message: string
  statusCode?: number
}

// ✅ Uso en un Use Case
export async function GetActiveTripUseCase(
  repo: ITripRepository,
  tripId: string
): Promise<Either<Failure, TripEntity>> {
  try {
    const trip = await repo.findById(tripId)
    if (!trip) {
      return { ok: false, error: { code: 'NOT_FOUND', message: 'Viaje no encontrado' } }
    }
    return { ok: true, data: trip }
  } catch (err) {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error interno del servidor' } }
  }
}

// ✅ Consumo en presentación
const result = await GetActiveTripUseCase(repo, tripId)
if (!result.ok) {
  showErrorToast(result.error.message)
  return
}
const trip = result.data // TypeScript sabe que es TripEntity aquí
```

---

## 12. Rendimiento

### Estrategia de "Barrel Files" Limitada:

* **Problema:** En Next.js, el uso excesivo de archivos `index.ts` (barrels) puede arruinar el *Tree Shaking*, haciendo que el bundle de cliente sea más pesado.
* **Regla:** Evitar barrel exports en la capa de `presentation`. Importar directamente desde el archivo del componente.

### Lazy Loading de Componentes Pesados:

Los componentes que contengan librerías pesadas (gráficos, mapas, editores de texto) deben cargarse con `next/dynamic` y `ssr: false` cuando no necesiten renderizarse en el servidor.

```typescript
import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(
  () => import('@/src/features/tracking/presentation/components/organisms/InteractiveRouteMap').then(mod => mod.InteractiveRouteMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)
```

---

## 13. Estándares de Código y Documentación

* **JSDoc Obligatorio:** Cada bloque importante (funciones exportadas, interfaces, Use Cases, hooks custom) debe incluir comentarios JSDoc describiendo parámetros, retornos y una breve explicación. Los componentes de UI simples no requieren JSDoc si su tipado es autoexplicativo.
* **Documentación de Features (`docs/code/`):** Por cada nueva implementación o modificación, es OBLIGATORIO crear o actualizar un archivo `.md` en la carpeta `docs/code/<feature>/`. Este archivo debe detallar el propósito del código ("por qué"), cómo se relaciona con otros componentes y cómo encaja en la Clean Architecture del módulo.
* **Patrones de Diseño:** Se priorizará el uso de *Dependency Injection*, *Factory* y *Observer* según sea necesario.
* **Reusabilidad:** Antes de escribir un componente o lógica, evaluar si ya existe algo similar o si puede ser un Hook o componente genérico.
* **Composición sobre Herencia:** Siempre. Sin excepciones en React.

---

## 14. Pruebas Unitarias Obligatorias

**Regla:** Todo nuevo código escrito o modificación al existente DEBE incluir sus respectivas pruebas unitarias. Estas pruebas se organizarán por feature siguiendo la Clean Architecture y se guardarán exclusivamente en la carpeta raíz `test/`.

### Estrategia de Testing:

| Capa             | Qué testear                                       | Herramienta              |
| ---------------- | ------------------------------------------------- | ------------------------ |
| `domain`         | Entidades, validaciones, lógica pura              | Vitest                   |
| `application`    | Use Cases con repos mockeados                     | Vitest                   |
| `infrastructure` | Mappers, transformaciones de datos                | Vitest                   |
| `presentation`   | Renderizado condicional, interacciones de usuario | Vitest + Testing Library |

### Definition of Done:

No se considerará terminada ninguna tarea si el código no está respaldado por pruebas que cubran:

* **Happy path** — El flujo exitoso esperado.
* **Error path** — Qué ocurre cuando falla el repositorio, la validación, etc.
* **Edge cases** — Listas vacías, valores nulos, límites de paginación.

---

## 15. Ejemplo de Implementación Completo (Template)

```typescript
/**
 * @fileoverview Use Case para obtener el perfil de un usuario.
 * Sigue las reglas de Clean Architecture definidas en AGENTS.md.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { UserEntity } from '../domain/entities'
import type { IUserRepository } from '../domain/repositories'

/**
 * Caso de uso para obtener el perfil de usuario.
 * Aplica la lógica de negocio necesaria antes de entregar los datos.
 *
 * @param userRepository - Implementación del repositorio inyectada (DI).
 * @param userId - Identificador único del usuario.
 * @returns Either con Failure o UserEntity.
 */
export async function GetUserProfileUseCase(
  userRepository: IUserRepository,
  userId: string
): Promise<Either<Failure, UserEntity>> {
  try {
    const user = await userRepository.findById(userId)

    if (!user) {
      return {
        ok: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' },
      }
    }

    // Lógica de negocio: verificar que el perfil esté completo
    if (!user.email || !user.name) {
      return {
        ok: false,
        error: { code: 'INCOMPLETE_PROFILE', message: 'Perfil incompleto' },
      }
    }

    return { ok: true, data: user }
  } catch {
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: 'Error inesperado al obtener perfil' },
    }
  }
}
```