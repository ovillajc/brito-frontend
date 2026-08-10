-- ==============================================================================
-- 1. Habilitar RLS en las tablas (si no está habilitado, esto lo activa)
-- ==============================================================================
ALTER TABLE public.maintenance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_units ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Eliminar las políticas previas si ya existen para evitar conflictos
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated users to read maintenance_types" ON public.maintenance_types;
DROP POLICY IF EXISTS "Allow authenticated users to read maintenance_services" ON public.maintenance_services;
DROP POLICY IF EXISTS "Allow authenticated users to read maintenance_providers" ON public.maintenance_providers;
DROP POLICY IF EXISTS "Allow authenticated users to read measurement_units" ON public.measurement_units;

-- ==============================================================================
-- 3. Crear las nuevas políticas para permitir SELECT solo a usuarios autenticados
-- ==============================================================================

-- Política para maintenance_types
CREATE POLICY "Allow authenticated users to read maintenance_types" 
ON public.maintenance_types 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para maintenance_services
CREATE POLICY "Allow authenticated users to read maintenance_services" 
ON public.maintenance_services 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para maintenance_providers
CREATE POLICY "Allow authenticated users to read maintenance_providers" 
ON public.maintenance_providers 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para measurement_units
CREATE POLICY "Allow authenticated users to read measurement_units" 
ON public.measurement_units 
FOR SELECT 
TO authenticated 
USING (true);

