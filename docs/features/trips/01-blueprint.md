# Módulo de Viajes — Blueprint

## Descripción

El módulo de **Viajes** es el núcleo operativo del sistema. Gestiona el ciclo de vida completo de cada viaje: desde el despacho hasta la liquidación, incluyendo:

1. **Control de viaje general** (monitorista)
2. **Rendimientos de combustible** (Base Combustible V3)
3. **Datos específicos por cliente** (Walmart, etc.)
4. **Registro de cargas de diésel** (guardia/supervisor)

---

## Arquitectura

Sigue Clean Architecture en 4 capas dentro de `src/features/trips/`:

```
domain/
  entities/
    trip-entity.ts          — Entidad principal de viaje
    fuel-metrics-entity.ts  — Inputs y campos calculados de combustible
    walmart-trip-entity.ts  — Datos específicos Walmart (tiendas DETTE, STR/DHD)
  repositories/
    i-fuel-metrics-repository.ts
    i-walmart-trip-repository.ts

application/
  GetTripFuelMetrics.ts  — Calcula TODOS los campos derivados de la Base Combustible V3
  SaveFuelMetrics.ts     — Guarda inputs del monitorista
  RegisterFuelLoad.ts    — Registra carga del guardia
  SaveWalmartTripData.ts — Guarda datos del coordinador Walmart

infrastructure/
  mappers/
    FuelMetricsMapper.ts   — DB Row → Domain Entity (fuel_loads, trip_fuel_metrics, trucks, trailers)
    WalmartTripMapper.ts   — DB Row → Domain Entity (walmart_trip_data, walmart_stores)
  repositories/
    SupabaseFuelMetricsRepository.ts
    SupabaseWalmartRepository.ts

presentation/
  actions/
    fuel-metrics.actions.ts  — Server Actions (mutaciones)
  hooks/
    use-trips.ts             — Hook de lista/summary de viajes
    use-fuel-metrics.ts      — Hooks TanStack Query para métricas + mutaciones
  components/
    pages/
      TripsDashboardPage.tsx
      TripsListPage.tsx
      FuelMetricsPage.tsx   — Base Combustible V3 (Admin/Monitorista)
      FuelLoadPage.tsx      — Vista simplificada del Guardia
    organisms/
      FuelLoadForm.tsx      — Formulario del Guardia (folio, litros, precio)
      FuelMetricsForm.tsx   — Formulario del Monitorista (km, remolques)
```

---

## Tablas de Base de Datos

### Tablas modificadas
| Tabla | Columnas agregadas |
|---|---|
| `trips` | `monitored_by`, `fuel_load_date`, `trip_number_client`, `last_scan`, `observations`, `linked_trip_id`, `trip_leg` |
| `fuel_loads` | `supervised_by`, `liters_r1`, `hours_r1`, `liters_r2`, `hours_r2` |

### Tablas nuevas
| Tabla | Propósito |
|---|---|
| `trip_fuel_metrics` | Inputs reales de rendimiento por viaje (km, horas R1/R2, litros R1/R2) |
| `trip_client_entries` | Registro de qué cliente tiene datos custom para un viaje |
| `walmart_stores` | Catálogo de tiendas DETTE de Walmart |
| `walmart_trip_data` | Datos específicos de Walmart por viaje (STR/DHD, carta porte, DETTE log) |

---

## Campos Calculados (Use Case — nunca en DB)

Todos los cálculos de rendimiento viven en `GetTripFuelMetrics.ts`:

| Campo | Fórmula |
|---|---|
| `km_traveled` | `km_final - km_initial` |
| `liters_theoretical_engine` | `km_traveled / truck.theoretical_yield` |
| `real_yield_engine` | `km_traveled / liters_engine` |
| `savings_excess_engine` | `liters_engine - liters_theoretical_engine` |
| `liters_theoretical_r1` | `hours_r1 * trailer.ss_refrigerated_yield` |
| `real_yield_r1` | `liters_real_r1 / hours_r1` |
| `savings_excess_r1` | `liters_real_r1 - liters_theoretical_r1` |
| *(igual para R2)* | |
| `total_diesel_cost` | `(liters_engine + r1 + r2) * price_per_liter` |
| `total_savings_excess` | `exceso_motor + exceso_r1 + exceso_r2` |
| `preinvoice_variance` | `total_km_preinvoice - km_traveled` |

---

## Modelo de Roles

| Rol | Rutas | Acciones |
|---|---|---|
| **Administrador** | `/trips`, `/trips/list`, `/trips/fuel`, `/trips/fuel/load` | CRUD completo |
| **Monitorista** | `/trips/list`, `/trips/fuel` | Crear viaje, ingresar km/litros remolques |
| **Coordinador** | `/trips/list` (tab cliente) | Ingresar datos Walmart/cliente |
| **Guardia/Supervisor** | `/trips/fuel/load` | Solo registrar ticket + litros |

---

## STR / DHD (Walmart)

Los viajes de reparto (STR) y regreso vacío (DHD) son **trips separados en BD** enlazados por `trips.linked_trip_id`. En la bitácora Excel del cliente aparecen como un solo renglón.

El coordinador registra ambos legs en `walmart_trip_data` del viaje STR; el viaje DHD tiene su propio registro con `trip_leg = 'DHD'`.

---

## Extensibilidad (Futuros Clientes)

Para agregar un nuevo cliente (ej. Pemex):
1. Crear tabla `pemex_trip_data` con sus columnas específicas
2. Crear `PemexTripMapper.ts` e `ISupabasePemexRepository.ts`
3. Registrar en `trip_client_entries` con `client_table_key = 'pemex_trip_data'`
4. Crear `PemexTripForm.tsx` en organisms
5. No modificar ninguna tabla existente
