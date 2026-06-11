# CrudDataTable: filtros tipo DataTables (sin dependencia)

## Propósito

Replica el comportamiento más común de DataTables (filtros rápidos por `select` + búsqueda global + ordenamiento) directamente en `CrudDataTable`, sin instalar la librería.

## Relaciones

- `CrudDataTable` renderiza el toolbar ([CrudDataTable.tsx](file:///Users/ovillajc/Documents/Desarrollo/projects/netus-devs/brito%20webapp/brito/src/core/presentation/components/organisms/CrudDataTable.tsx)).
- `DataTableToolbar` expone el botón `Filtros` y notifica al contenedor cuando el usuario lo presiona ([data-table-toolbar.tsx](file:///Users/ovillajc/Documents/Desarrollo/projects/netus-devs/brito%20webapp/brito/src/core/presentation/components/molecules/data-table-toolbar.tsx)).
- Los controles de filtros se muestran en un bloque superior desacoplado de las columnas, usando el estilo visual de Brito.

## Arquitectura (Clean Architecture)

- Capa: `presentation` (UI).  
- Alcance: `src/core/presentation/components/organisms/CrudDataTable.tsx`.

No introduce dependencias hacia `application` o `domain`. El filtrado es 100% client-side y opera sobre el arreglo `data` ya provisto al componente.

## Uso

### 1) Búsqueda global

Sigue funcionando con `searchFilter` (si se provee). La búsqueda global se combina con los filtros por columna.

### 2) Filtro tipo select (auto o explícito)

Configura la columna con:

```ts
filter: {
  type: 'select',
  options: [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' },
  ],
}
```

Opcionalmente, provee `getValue` si la celda es compleja o el valor no coincide con el texto renderizado.

Además, `CrudDataTable` puede inferir automáticamente un `select` cuando:

- El `id/header` contiene palabras típicas (ej. `status`, `estado`, `type`, `tipo`, etc.), o
- La columna tiene baja cardinalidad (pocos valores únicos) y valores cortos.

### 4) Ordenamiento

Click en el encabezado de una columna para ordenar asc/desc (al estilo DataTables). Para deshabilitarlo en una columna:

```ts
sortable: false
```

## Mantenimiento

- Si una columna no debe ser filtrable, setea `filter: false` en esa columna.
- Si quieres forzar un `select`, define `filter: { type: 'select', options: [...] }`.
- Si se requiere rendimiento con datasets muy grandes, prioriza usar `accessor`/`getValue` para evitar extraer texto desde `cell`.
