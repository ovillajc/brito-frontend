-- 1. Eliminar la restricción de llave foránea existente hacia la tabla de empleados (si existiese)
ALTER TABLE public.workshop_work_orders 
  DROP CONSTRAINT IF EXISTS workshop_work_orders_specialist_employee_id_fkey;

-- 2. Renombrar la columna y cambiar el tipo de dato a texto libre (text/varchar)
ALTER TABLE public.workshop_work_orders 
  RENAME COLUMN specialist_employee_id TO specialist_name;

ALTER TABLE public.workshop_work_orders 
  ALTER COLUMN specialist_name TYPE text USING specialist_name::text;
