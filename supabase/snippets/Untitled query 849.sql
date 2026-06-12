-- 1. Agregar la columna company_profile_id a la tabla clients
ALTER TABLE public.clients 
ADD COLUMN company_profile_id uuid;

-- 2. Crear la llave foránea que liga al cliente con su respectiva compañía
ALTER TABLE public.clients 
ADD CONSTRAINT clients_company_profile_id_fkey 
FOREIGN KEY (company_profile_id) 
REFERENCES public.company_profile (id) 
ON DELETE SET NULL;
