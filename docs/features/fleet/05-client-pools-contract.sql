-- ==========================================
-- FEATURE: Client Pools (Pools de Clientes)
-- DESCRIPTION: Permite agrupar unidades armadas por pool de cliente.
-- ==========================================

-- 1. Crear tabla de Pools
CREATE TABLE IF NOT EXISTS public.client_pools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_pools_pkey PRIMARY KEY (id),
  CONSTRAINT client_pools_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- 2. Habilitar RLS
ALTER TABLE public.client_pools ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (Simples para desarrollo)
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.client_pools
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Agregar columna a unit_assemblies
-- Nota: Usamos DO block para evitar errores si la columna ya existe
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.unit_assemblies'::regclass AND attname = 'client_pool_id') THEN
    ALTER TABLE public.unit_assemblies ADD COLUMN client_pool_id uuid REFERENCES public.client_pools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_pools_updated_at
    BEFORE UPDATE ON public.client_pools
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- ROLLBACK SCRIPT
-- ==========================================
/*
ALTER TABLE public.unit_assemblies DROP COLUMN IF EXISTS client_pool_id;
DROP TABLE IF EXISTS public.client_pools;
*/
