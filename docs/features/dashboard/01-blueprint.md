# Feature: Dashboard

## Overview
The Dashboard is the central hub of the system, providing real-time visibility into key performance indicators (KPIs) and serving as the entry point for various management modules.

## Goals
- Provide a summary of **Operative KPIs** (efficiency, performance).
- Provide a summary of **Financial KPIs** (costs, revenue).
- Establish a modular architecture that easily integrates:
  - Fleet management (Flotilla).
  - Trip tracking (Viajes).
  - Commercial communication (Directorio Comercial).

## Architecture (Clean Architecture)

### 1. Domain Layer (`src/features/dashboard/domain`)
- **Entities**: 
  - `KPIEntity`: Generic structure for KPIs.
  - `OperativeKPI`: Specific data for operations.
  - `FinancialKPI`: Specific data for finance.
- **Repositories**: 
  - `IDashboardRepository`: Interface for fetching KPI data.

### 2. Application Layer (`src/features/dashboard/application`)
- **Use Cases**:
  - `GetOperativeKPIsUseCase`: Fetches and processes operative metrics.
  - `GetFinancialKPIsUseCase`: Fetches and processes financial metrics.

### 3. Infrastructure Layer (`src/features/dashboard/infrastructure`)
- **Repositories**:
  - `SupabaseDashboardRepository`: Implementation using Supabase Client.
- **Mappers**:
  - `KPIMapper`: Transforms database records to domain entities.

### 4. Presentation Layer (`src/features/dashboard/presentation`)
- **Components**:
  - **Atoms**: `KPICard`, `Badge`, `Skeleton`.
  - **Molecules**: `KPIChart` (for future), `KPIStatistic`.
  - **Organisms**: `OperativeDashboard`, `FinancialDashboard`.
- **State Management**:
  - `useDashboardStore` (Zustand): Local UI state and cached data.
- **Hooks**:
  - `useDashboardKPIs`: Custom hook connecting TanStack Query with Use Cases.

## Data Schema (Proposed)
No specific tables exist yet for aggregated KPIs. We will derive these from existing/future tables (`trips`, `service_orders`, `fleet`). For now, we will mock the data or create a view if necessary.

## Route
- `/dashboard`: Main entry point.

## UI/UX Design
- **Rich Aesthetics**: Vibrant colors for metrics (green for growth, blue for operations).
- **Responsive Layout**: CSS Grid for metric cards.
- **Skeletons**: Implement during data fetching.
