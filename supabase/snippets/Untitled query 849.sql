-- Agrega el campo de saldo previo al settlement
ALTER TABLE public.operator_settlements
  ADD COLUMN IF NOT EXISTS previous_balance numeric(12,2) NOT NULL DEFAULT 0;

-- Ejecuta esto en Supabase para ver la definición de la vista
SELECT pg_get_viewdef('operator_settlement_kpis'::regclass, true);
