drop view if exists "public"."workshop_stays_kpis";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_trips_for_fuel_load(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(id uuid, folio text, trip_number bigint, status text, origin text, destination text, departure_date timestamp with time zone, unit_assembly_id uuid, unit_economic_number text, operator_name text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.folio,
        t.trip_number,
        t.status::text,
        t.origin,
        t.destination,
        t.departure_date,
        t.unit_assembly_id,
        ua.economic_number AS unit_economic_number,
        e.full_name AS operator_name
    FROM trips t
    LEFT JOIN unit_assemblies ua ON t.unit_assembly_id = ua.id
    LEFT JOIN employees e ON ua.employee_id = e.id
    WHERE t.departure_date >= p_start_date 
      AND t.departure_date <= p_end_date
    ORDER BY t.departure_date DESC;
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



