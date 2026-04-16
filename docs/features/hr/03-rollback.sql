-- ==========================================
-- SCRIPT DE ROLLBACK: Módulo HR
-- Módulo: Gestión de Recursos Humanos
-- Descripción: Limpia las tablas, tipos y columnas creadas en 02-schema.sql
-- ==========================================

-- 1. Eliminar Índices
DROP INDEX IF EXISTS public.idx_hr_attendance_employee;
DROP INDEX IF EXISTS public.idx_hr_attendance_date;
DROP INDEX IF EXISTS public.idx_hr_applicants_stage;

-- 2. Eliminar Tablas Nuevas
DROP TABLE IF EXISTS public.hr_attendance CASCADE;
DROP TABLE IF EXISTS public.hr_applicants CASCADE;

-- 3. Eliminar ENUMs Nuevos
DROP TYPE IF EXISTS public.hr_incident_type CASCADE;
DROP TYPE IF EXISTS public.ats_stage CASCADE;

-- 4. Revertir cambios en tabla existente (employees)
ALTER TABLE public.employees 
  DROP COLUMN IF EXISTS curp,
  DROP COLUMN IF EXISTS contact_phone,
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS birth_date,
  DROP COLUMN IF EXISTS emergency_contact_name,
  DROP COLUMN IF EXISTS emergency_contact_phone,
  DROP COLUMN IF EXISTS blood_type,
  DROP COLUMN IF EXISTS medical_notes;
