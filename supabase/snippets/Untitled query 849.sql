-- 1. Agregar la bandera a las cargas de combustible para saber si vaciaron el tanque
ALTER TABLE public.fuel_loads 
ADD COLUMN is_base_tank_depleted BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.fuel_loads.is_base_tank_depleted IS 'Indica si esta carga agotó por completo el tanque base. Sirve para detectar litros extra y cuadrar el inventario a cero.';

-- 2. Agregar un campo de notas a los movimientos del tanque para justificar los ajustes
ALTER TABLE public.fuel_tank_movements 
ADD COLUMN notes TEXT;

COMMENT ON COLUMN public.fuel_tank_movements.notes IS 'Almacena la justificación del movimiento. Útil para identificar los ajustes automáticos generados por litros extra al agotar el tanque.';
