-- 1. Eliminar la restricción de llave foránea existente hacia la tabla de empleados (si existiese)
ALTER TABLE public.workshop_work_orders 
  DROP CONSTRAINT IF EXISTS workshop_work_orders_specialist_employee_id_fkey;

-- 2. Renombrar la columna y cambiar el tipo de dato a texto libre (text/varchar)
ALTER TABLE public.workshop_work_orders 
  RENAME COLUMN specialist_employee_id TO specialist_name;

ALTER TABLE public.workshop_work_orders 
  ALTER COLUMN specialist_name TYPE text USING specialist_name::text;

-- Migration: Auto-generación de sequential_number y folio en workshop_stays
-- Ejecutar en Supabase SQL Editor o como migración manual
-- Zona horaria: America/Mexico_City

-- 1. Función que calcula el siguiente número secuencial y construye el folio
CREATE OR REPLACE FUNCTION fn_set_workshop_stay_sequential_and_folio()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INTEGER;
  date_prefix TEXT;
BEGIN
  -- Calcular el siguiente número secuencial (MAX + 1, rellena el final si se borró el último)
  SELECT COALESCE(MAX(sequential_number), 0) + 1
  INTO next_seq
  FROM public.workshop_stays;

  -- Prefijo de fecha usando la fecha de ingreso en hora de México
  date_prefix := TO_CHAR(NEW.entered_at AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD');

  -- Asignar valores auto-generados
  NEW.sequential_number := next_seq;
  NEW.folio := date_prefix || '-TALLER-' || next_seq::TEXT;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger BEFORE INSERT (se ejecuta antes de insertar, para poder modificar NEW)
DROP TRIGGER IF EXISTS trg_workshop_stay_sequential ON public.workshop_stays;

CREATE TRIGGER trg_workshop_stay_sequential
BEFORE INSERT ON public.workshop_stays
FOR EACH ROW
EXECUTE FUNCTION fn_set_workshop_stay_sequential_and_folio();


-- 1. Quitamos la restricción de llave foránea para poder poner cualquier texto
ALTER TABLE public.work_order_parts DROP CONSTRAINT IF EXISTS work_order_parts_paid_by_fkey;

-- 2. Cambiamos el tipo de dato de la columna de UUID a TEXT
ALTER TABLE public.work_order_parts ALTER COLUMN paid_by TYPE text;
