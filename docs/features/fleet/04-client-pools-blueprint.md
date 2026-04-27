# Blueprint: Pools de Clientes (Fleet Pools)

## 1. Descripción General
El sub-módulo de **Client Pools** es una extensión de la gestión de flotilla que permite organizar las "Unidades Armadas" en grupos lógicos dedicados a clientes específicos. Un pool representa una flota cautiva o asignada permanentemente a la operación de un cliente.

## 2. Objetivos
- Permitir la creación de múltiples "pools" o agrupaciones por cliente.
- Proporcionar una interfaz de matriz para la asignación masiva de unidades a estos pools.
- Facilitar la visualización de la disponibilidad de la flota por segmento de cliente.

## 3. Arquitectura (Clean Architecture)

### Capa de Dominio (Domain)
- **Entidad**: `ClientPoolEntity`
  - `id`: uuid
  - `name`: string (Nombre del pool, ej: "Flota Walmart Escobedo")
  - `clientId`: uuid (Relación con la tabla `clients`)
  - `description`: string (opcional)
  - `unitsCount`: number (dato derivado)
- **Repositorio**: `IClientPoolRepository`
  - Métodos estándar CRUD + `assignUnits(poolId, unitIds)`.

### Capa de Aplicación (Application)
- **Casos de Uso**:
  - `GetClientPools`: Obtener pools (opcionalmente filtrados por cliente).
  - `CreateClientPool`: Registrar un nuevo pool.
  - `UpdateClientPool`: Editar metadatos del pool.
  - `AssignUnitsToPool`: Lógica para vincular unidades armadas a un pool.

### Capa de Infraestructura (Infrastructure)
- **Base de Datos**: 
  - Nueva tabla `client_pools`.
  - Actualización de `unit_assemblies` para incluir `client_pool_id` (FK a `client_pools`).
- **Mappers**: `ClientPoolMapper` para transformar DTOs de Supabase.

### Capa de Presentación (Presentation)
- **Ruta**: `app/(dashboard)/fleet/pools/page.tsx`
- **Componentes**:
  - `PoolsTable`: Lista de pools existentes.
  - `PoolAssignmentMatrix`: Interfaz tipo matriz para gestionar la relación entre unidades y pools.
  - `PoolWizard`: Modal para creación/edición de pools.

## 4. Diseño de Base de Datos (Contract)

```sql
-- Tabla de Pools
CREATE TABLE public.client_pools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_pools_pkey PRIMARY KEY (id),
  CONSTRAINT client_pools_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Relación en Unidades Armadas (Actualización)
ALTER TABLE public.unit_assemblies 
ADD COLUMN client_pool_id uuid REFERENCES public.client_pools(id) ON DELETE SET NULL;
```

## 5. Diseño Visual y UX
- **Vista de Matriz**: Una tabla donde las filas son las Unidades Armadas y las columnas son los Pools del cliente seleccionado. Permite marcar con un check la pertenencia de la unidad al pool.
- **Validaciones**: Una unidad armada solo puede pertenecer a un pool a la vez (relación 1:N). Al asignar a un nuevo pool, se desvincula del anterior automáticamente.
