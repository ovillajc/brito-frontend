ALTER TABLE public.workshop_work_orders
ADD COLUMN supervisor_name text,
ADD COLUMN supervisor_employee_id uuid REFERENCES public.employees(id);


-- Eliminar la Foreign Key (Asegúrate de que el nombre del constraint coincide)
ALTER TABLE public.workshop_work_orders 
DROP CONSTRAINT IF EXISTS workshop_work_orders_supervisor_profile_id_fkey;

-- Eliminar la columna vieja
ALTER TABLE public.workshop_work_orders 
DROP COLUMN IF EXISTS supervisor_profile_id;

-- Agregar las columnas nuevas
ALTER TABLE public.workshop_work_orders
ADD COLUMN supervisor_name text,
ADD COLUMN supervisor_employee_id uuid REFERENCES public.employees(id);


------

ALTER TABLE public.workshop_work_orders 
ADD COLUMN specialist_employee_id uuid;

ALTER TABLE public.workshop_work_orders
ADD CONSTRAINT workshop_work_orders_specialist_employee_id_fkey 
FOREIGN KEY (specialist_employee_id) REFERENCES public.employees(id);

NOTIFY pgrst, 'reload schema';

select * from maintenance_providers;


ALTER TABLE public.work_order_parts
  ADD COLUMN IF NOT EXISTS inventory_item_id uuid
    REFERENCES public.inventory_items(id);

CREATE INDEX IF NOT EXISTS idx_work_order_parts_inventory_item_id
  ON public.work_order_parts (inventory_item_id)
  WHERE inventory_item_id IS NOT NULL;
