-- ==========================================
-- SCRIPT DE ESQUEMA: Módulo HR
-- Módulo: Gestión de Recursos Humanos
-- Descripción: Tablas base para asistencia y reclutamiento (ATS). 
-- Integración con tablas existentes: employees y departments.
-- ==========================================

-- 1. Actualización de tabla existente: Empleados (Expediente Médico y Digital)
-- NOTA: La tabla `employees` y `departments` ya existen en la BD.
-- employees ya cuenta con `department_id`, `is_operator`, `is_active`, `hire_date`.
ALTER TABLE public.employees 
  ADD COLUMN IF NOT EXISTS curp text UNIQUE,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS blood_type text,
  ADD COLUMN IF NOT EXISTS medical_notes text;

-- Los documentos digitales (contrato, identificación, etc.) se gestionarán 
-- mediante la tabla existente `public.documents` referenciando `employee_id`.

-- 2. Tabla de Reclutamiento ATS (Aplicantes)
CREATE TYPE public.ats_stage AS ENUM ('postulado', 'entrevista', 'prueba_tecnica', 'oferta', 'contratado', 'rechazado');

CREATE TABLE IF NOT EXISTS public.hr_applicants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  expected_role text NOT NULL,
  department_id uuid REFERENCES public.departments(id), -- Área para la que aplica
  is_operator_role boolean DEFAULT false, -- Si aplica para rol operativo
  stage ats_stage NOT NULL DEFAULT 'postulado',
  phone_number text,
  email text,
  resume_url text,
  
  board_order int DEFAULT 0, -- Orden específico dentro de la columna Kanban
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Pre-Nómina e Asistencia / Incidencias
CREATE TYPE public.hr_incident_type AS ENUM ('asistencia', 'falta', 'retardo', 'vacaciones', 'incapacidad', 'permiso_sin_sueldo');

CREATE TABLE IF NOT EXISTS public.hr_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  incident_date date NOT NULL,
  incident_type hr_incident_type NOT NULL DEFAULT 'asistencia',
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, incident_date)
);

-- Indices de Performance
CREATE INDEX IF NOT EXISTS idx_hr_applicants_stage ON public.hr_applicants(stage);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_date ON public.hr_attendance(incident_date);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_employee ON public.hr_attendance(employee_id);
