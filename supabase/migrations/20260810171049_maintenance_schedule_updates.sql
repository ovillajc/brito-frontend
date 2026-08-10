alter table "public"."work_order_parts" drop constraint "work_order_parts_paid_by_fkey";

drop view if exists "public"."workshop_stays_kpis";

alter table "public"."work_order_parts" alter column "paid_by" set data type text using "paid_by"::text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fn_set_workshop_stay_sequential_and_folio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_seq INTEGER;
  date_prefix TEXT;
BEGIN
  -- Calcular el siguiente número secuencial (MAX + 1, ignorando NULLs).
  -- Si no hay registros con sequential_number, comienza desde 1.
  SELECT COALESCE(MAX(sequential_number), 0) + 1
  INTO next_seq
  FROM public.workshop_stays
  WHERE sequential_number IS NOT NULL;

  -- Prefijo de fecha usando la fecha de ingreso en hora de México
  date_prefix := TO_CHAR(NEW.entered_at AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD');

  -- Asignar valores auto-generados
  NEW.sequential_number := next_seq;
  NEW.folio := date_prefix || '-TALLER-' || next_seq::TEXT;

  RETURN NEW;
END;
$function$
;

create or replace view "public"."workshop_stays_kpis" as  SELECT s.id,
    s.folio,
    s.vehicle_type,
    COALESCE(t.economic_number, tr.economic_number, '—'::text) AS unit_label,
    s.entered_at,
    s.exited_at,
    s.reason,
    (floor((EXTRACT(epoch FROM (COALESCE(s.exited_at, now()) - s.entered_at)) / 86400.0)))::integer AS days_in_shop,
    COALESCE(sum(p.total), (0)::numeric) AS total_cost,
        CASE
            WHEN (s.exited_at IS NULL) THEN 'open'::text
            ELSE 'closed'::text
        END AS status
   FROM ((((public.workshop_stays s
     LEFT JOIN public.trucks t ON ((t.id = s.truck_id)))
     LEFT JOIN public.trailers tr ON ((tr.id = s.trailer_id)))
     LEFT JOIN public.workshop_work_orders w ON ((w.stay_id = s.id)))
     LEFT JOIN public.work_order_parts p ON ((p.work_order_id = w.id)))
  GROUP BY s.id, s.folio, s.vehicle_type, t.economic_number, tr.economic_number, s.entered_at, s.exited_at, s.reason;


CREATE TRIGGER trg_workshop_stay_sequential BEFORE INSERT ON public.workshop_stays FOR EACH ROW EXECUTE FUNCTION public.fn_set_workshop_stay_sequential_and_folio();


