# Módulo de Recursos Humanos (HR) - Blueprint

## 1. Propósito y Alcance
Proveer un sistema centralizado de Gestión de Recursos Humanos (HR) para el ERP de la Sociedad Brito, integrado nativamente con Supabase y renderizado vía Next.js Server Components.
Reemplaza cualquier sistema obsoleto/separado y consolida:
1. Panel Directivo (KPIs).
2. Expediente Médico y Digital (Altas de Empleados con Distinción Operativa/Admon).
3. Reclutamiento ATS (Tablero Kanban).
4. Gestión Pre-Nómina y Asistencia (Incidencias).

## 2. Modelado de Dominio (Entidades Core)

* **`Employee`**: Empleado registrado de la empresa.
  * Relativo a un `Department` (Área de Organización).
  * Bandera crítica `role_type` (Operativo vs Administrativo).
* **`Applicant`**: Candidato en el ATS. Atado a un estado (Postulado, Entrevista, Contratado).
* **`Attendance`**: Registro de entrada/salida o incidencia (Falta, Retardo, Vacaciones).

## 3. Arquitectura Clean & Dependencias

```text
src/features/hr/
├── domain/            # Zod Schemas (EmployeeSchema), Interfaces (IEmployeeRepository)
├── application/       # UseCases: CreateEmployee, MoveApplicant, GetHrKpis
├── infrastructure/    # EmployeeRepositoryImpl (usa @supabase/ssr), Mappers
└── presentation/      # Atomic UI (ApplicantCard, EmployeeDataTable, HrDashboard)
```

## 4. UI/UX (Estilo Horizon)
- Interfaces ultra-blancas (`bg-white`) sobre fondos neutros (`bg-stone-50`).
- Tarjetas planas sin sombras agresivas, bordes `border-stone-200`.
- Énfasis tipográfico para tablas y KPIs (Data-centric).
- Estados atómicos manejados con Zustand (si aplica UI temporal) o Server State puro (Server components).
