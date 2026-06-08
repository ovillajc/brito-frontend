-- 1. Crear función que asegura un ajuste abierto para el operador al asignarle dinero
CREATE OR REPLACE FUNCTION public.fn_ensure_open_operator_settlement()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si ya hay un ajuste abierto para el operador del adelanto creado
  IF NOT EXISTS (
    SELECT 1
    FROM public.operator_settlements
    WHERE operator_id = NEW.operator_id
      AND status = 'open'
  ) THEN
    -- Si no hay ninguno abierto, creamos un ajuste nuevo
    INSERT INTO public.operator_settlements (operator_id, status, opened_at)
    VALUES (NEW.operator_id, 'open', NEW.assigned_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger asociado a la inserción de nuevos adelantos
CREATE TRIGGER trg_ensure_open_operator_settlement
  AFTER INSERT ON public.expense_advances
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_ensure_open_operator_settlement();
