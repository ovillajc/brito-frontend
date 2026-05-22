# Reporte Detallado: Estrategia Offline First (PWA)

## 1. Visión General del Sistema

El sistema Brito ha sido dotado con capacidades **Offline First** para garantizar la continuidad operativa cuando los usuarios (especialmente operadores en ruta) pierdan la conexión a internet. 

Dado que la aplicación está construida con **Next.js 15 (App Router)** y **Supabase**, la mayor parte de la lógica (Server Components y Server Actions) reside y se ejecuta en el servidor. Esto significa que, sin red, las mutaciones (crear, editar, eliminar) fallan inherentemente. 

Para solucionar esto sin reescribir la arquitectura completa a cliente (Client-Side Rendering puro), se optó por una arquitectura híbrida basada en **Progressive Web App (PWA) + IndexedDB (Dexie.js) + Background Queue**.

### Alcance de la Estrategia Offline
- **Soportado (Offline):** Operaciones de creación (CREATE) y actualización (UPDATE) de formularios pesados (Ej. Gastos, Mantenimiento, Viajes). También la visualización temporal de estos registros locales.
- **Requiere Red (Online):** Lectura profunda de la base de datos (GET masivos), eliminación (DELETE) y Autenticación (Supabase Auth requiere validación JWT).
- **Archivos Pesados:** Soporte para guardar imágenes y PDFs (hasta 5MB) generados en modo offline y subirlos a **Cloudflare R2** al recuperar la conexión.

---

## 2. Tecnologías y Configuración de Paquetes

Para lograr esta arquitectura se instalaron y configuraron los siguientes paquetes:

1. **`dexie`**: Un wrapper robusto y con tipos nativos para `IndexedDB`. Se eligió porque permite manejar el almacenamiento estructurado en el navegador con un rendimiento superior a `localStorage` (limitado a strings de 5MB) y permite almacenar `ArrayBuffers` (archivos).
2. **`next-pwa`**: Plugin oficial/comunitario para Next.js que integra **Workbox** bajo el capó. Se encarga de generar el Service Worker y manejar el caché en tiempo de ejecución (Runtime Caching).

### Configuraciones Aplicadas

- **`next.config.ts`**: Se integró `withPWA` configurando estrategias de caché estrictas:
  - `CacheFirst` para fuentes y assets estáticos (se guardan y no vuelven a pedirse a menos que cambien).
  - `NetworkFirst` para las páginas HTML del dashboard (intenta obtener la versión más reciente del servidor, si falla por falta de red, muestra la versión en caché).
- **`public/manifest.json`**: Se creó el Web App Manifest para que los navegadores móviles reconozcan la app como instalable (Standalone mode), asignando los colores de la marca (Verde `#006d37`) y los iconos.
- **`app/layout.tsx`**: Se inyectaron las etiquetas `<meta name="theme-color">`, `<link rel="manifest">` y propiedades específicas para iOS (`apple-mobile-web-app-capable`), además de inyectar el **Shell de Conectividad**.

---

## 3. Arquitectura y Flujo de Datos

### A. Almacenamiento Local (`db.ts`)
Se definió un esquema en Dexie (`BritoDB`) con cuatro almacenes principales:
- `pendingMutations`: Cola FIFO (First-In, First-Out) que guarda la intención de una acción (ej. llamar a `createExpenseAction`) junto con su payload (datos del formulario).
- `pendingFiles`: Guarda temporalmente archivos (Tickets, Facturas) como `ArrayBuffer` vinculados a una mutación.
- `cachedCatalogs`: (En preparación) Para guardar listas estáticas (Operadores, Unidades) que permitan llenar selectores sin internet.
- `offlineRecords`: Guarda un "snapshot" de los datos insertados para mostrarlos visualmente en las tablas del usuario mientras la mutación sigue pendiente.

### B. El Ciclo de Vida Offline (El Hook `useOfflineForm`)
Cuando el usuario presiona "Guardar" en un formulario (ej. Registro de Gasto):
1. **Verificación de Red:** El hook consulta a Zustand (`useConnectivityStore`) si hay internet.
2. **Si hay Red (Online):** Envía la petición directamente al Server Action de Next.js (`expenses.actions.ts`).
3. **Si NO hay Red (Offline):** 
   - Transforma los archivos adjuntos en `ArrayBuffer` y los guarda en `pendingFiles`.
   - Modifica el payload reemplazando la URL del recibo por un identificador temporal (ej. `fileRef_12`).
   - Guarda el payload en `pendingMutations` y notifica al usuario que el registro se guardó localmente.

### C. El Motor de Sincronización (`sync-engine.ts`)
Cuando el navegador recupera la conexión, el `ConnectivityProvider` dispara automáticamente el `SyncEngine`:
1. **Fase de Archivos (R2):** Revisa si hay `pendingFiles`. Si los hay, los sube mediante `uploadFileToR2Action`. R2 devuelve la URL pública final (`https://pub-xxxx.r2.dev/ticket.png`). Se actualiza el registro en IndexedDB con esta URL real.
2. **Fase de Mutaciones (Supabase):** Procesa la cola de `pendingMutations` de más antigua a más reciente.
   - Lee el payload pendiente.
   - Reemplaza cualquier token temporal (ej. `fileRef_12`) con la URL final de R2 que se obtuvo en el paso anterior.
   - Delega la ejecución a un **Dispatcher** (`actionDispatcher`), que básicamente enruta la acción guardada (`'createExpenseAction'`) hacia el archivo físico de Server Actions y lo ejecuta con el payload enriquecido.
3. **Fase de Limpieza:** Si el Server Action responde con éxito (`{ ok: true }`), el SyncEngine elimina la mutación, los archivos temporales y marca el registro local como sincronizado. Si falla, aumenta el contador de reintentos e informa al usuario.

---

## 4. Código Modificado y Roles de Componentes

| Archivo | Rol y Responsabilidad |
|---------|-----------------------|
| `offline-queue.ts` | Repositorio local. Contiene las funciones puras para interactuar con Dexie (`enqueueMutation`, `enqueueFile`, etc.). Abstrae la complejidad de IndexedDB del resto de la app. |
| `use-connectivity-store.ts` | Estado global (Zustand) que mantiene el estatus actual de la red (`online`, `offline`, `syncing`), cuenta cuántos registros faltan por sincronizar y provee una bandera para bloquear nuevos envíos mientras se sincroniza (`isSubmitBlocked`). |
| `ConnectivityProvider.tsx` | El cerebro de eventos. Se monta en la raíz y escucha `window.addEventListener('online')`. Orquesta los toasts (notificaciones UI) y delega el trabajo pesado al `SyncEngine`. Contiene el `actionDispatcher` central. |
| `ConnectivityBanner.tsx` | UI. Una pequeña barra superior persistente que indica el estado actual (Ej. "🔴 Sin conexión - 3 registros guardados localmente" o "🟢 Sincronizando..."). |
| `use-offline-form.ts` | El hook que deben consumir los desarrolladores al construir nuevos formularios. Centraliza la validación de archivos pesados y encola tanto la mutación como la metadata local. |

### Integración de Prueba (Caso: `ExpenseForm.tsx`)
Para probar y validar la arquitectura, se modificó el componente `ExpenseForm.tsx`:
- Se cambió la invocación directa a `createExpense.mutateAsync` por el uso de `executeOffline`.
- Se protegió la **Edición** (`updateExpense`), obligando a que solo ocurra con internet (para prevenir conflictos de sobrescritura).
- La **Creación** fluye de forma transparente. Si el usuario está offline, el modal se cierra y el `ConnectivityBanner` actualiza su contador.

---

## 5. Guía de Implementación para Otros Módulos

Para dotar de capacidades offline a un nuevo módulo (Por ejemplo, **Viajes (Trips)**):

1. En el formulario correspondiente (`TripForm.tsx`), importa y configura el hook `useOfflineForm`:
   ```typescript
   const { execute: executeOffline, isLoading } = useOfflineForm<CreateTripInput, TripEntity>({
     module: 'trips',
     actionName: 'createTripAction',
     displayLabel: 'Nuevo Viaje',
     onlineAction: createTripAction,
     // pendingFiles: [{ fieldName: 'evidenceUrl', ... }] (Si requiere archivos)
   })
   ```
2. Reemplaza el llamado `submit` por `executeOffline(data, displayData)`.
3. Ve a `ConnectivityProvider.tsx` y registra la acción en el `actionDispatcher`:
   ```typescript
   case 'createTripAction': {
     const { createTripAction } = await import('@/src/features/trips/presentation/actions/trips.actions')
     return createTripAction(payload as Parameters<typeof createTripAction>[0])
   }
   ```
4. ¡Listo! El módulo ahora cuenta con soporte Offline completo y subida en segundo plano.

---

## 6. Siguientes Pasos Recomendados (Roadmap)
- **Caché Estático de Catálogos:** Utilizar el almacén `cachedCatalogs` de Dexie para guardar listas como `operators` o `measurement_units` al hacer el fetch inicial, de modo que los dropdowns en los formularios funcionen perfectamente sin internet.
- **Vista de "Registros Pendientes":** Crear una pantalla (Ej. `/dashboard/offline-sync`) donde el usuario pueda ver un listado detallado de qué transacciones están atrapadas en el dispositivo local y poder eliminarlas si decide cancelar la acción antes de que vuelva la red.
- **Resolución de Conflictos:** Por ahora, el sistema utiliza "Last-Write-Wins" al sincronizar. En el futuro, si se habilita la edición offline, se requerirá manejar conflictos (versionado).
