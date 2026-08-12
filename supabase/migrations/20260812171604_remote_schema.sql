set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_maintenance_expense_kpis(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'expenseOverTime', (
      SELECT COALESCE(json_agg(json_build_object('date', d.month, 'total', d.total)), '[]'::json)
      FROM (
        SELECT to_char(wop.created_at, 'YYYY-MM') as month,
               SUM(wop.total) as total
        FROM work_order_parts wop
        WHERE (p_start_date IS NULL OR wop.created_at >= p_start_date)
          AND (p_end_date IS NULL OR wop.created_at <= p_end_date)
        GROUP BY 1
        ORDER BY 1
      ) d
    ),
    'expenseByUnit', (
      SELECT COALESCE(json_agg(json_build_object('unit', u.unit, 'total', u.total)), '[]'::json)
      FROM (
        SELECT COALESCE(ua.economic_number, tr.economic_number, ta.economic_number, 'Desconocida') as unit, 
               SUM(wop.total) as total
        FROM work_order_parts wop
        JOIN workshop_work_orders wwo ON wop.work_order_id = wwo.id
        JOIN workshop_stays ws ON wwo.stay_id = ws.id
        LEFT JOIN trips t ON ws.last_trip_id = t.id
        LEFT JOIN unit_assemblies ua ON t.unit_assembly_id = ua.id
        LEFT JOIN trucks tr ON ws.truck_id = tr.id
        LEFT JOIN trailers ta ON ws.trailer_id = ta.id
        WHERE (p_start_date IS NULL OR wop.created_at >= p_start_date)
          AND (p_end_date IS NULL OR wop.created_at <= p_end_date)
        GROUP BY 1
        ORDER BY total DESC
        LIMIT 10
      ) u
    ),
    'expenseByOperator', (
      SELECT COALESCE(json_agg(json_build_object('operator', o.operator, 'total', o.total)), '[]'::json)
      FROM (
        SELECT COALESCE(e.full_name, 'Sin Operador Asignado') as operator, 
               SUM(wop.total) as total
        FROM work_order_parts wop
        JOIN workshop_work_orders wwo ON wop.work_order_id = wwo.id
        JOIN workshop_stays ws ON wwo.stay_id = ws.id
        LEFT JOIN trips t ON ws.last_trip_id = t.id
        LEFT JOIN unit_assemblies ua ON t.unit_assembly_id = ua.id
        LEFT JOIN employees e ON ua.employee_id = e.id
        WHERE (p_start_date IS NULL OR wop.created_at >= p_start_date)
          AND (p_end_date IS NULL OR wop.created_at <= p_end_date)
        GROUP BY 1
        ORDER BY total DESC
        LIMIT 10
      ) o
    ),
    'expenseByClient', (
      SELECT COALESCE(json_agg(json_build_object('client', c.client, 'total', c.total)), '[]'::json)
      FROM (
        SELECT COALESCE(cl.trade_name, 'Sin Cliente') as client, 
               SUM(wop.total) as total
        FROM work_order_parts wop
        JOIN workshop_work_orders wwo ON wop.work_order_id = wwo.id
        JOIN workshop_stays ws ON wwo.stay_id = ws.id
        LEFT JOIN trips t ON ws.last_trip_id = t.id
        LEFT JOIN clients cl ON t.client_id = cl.id
        WHERE (p_start_date IS NULL OR wop.created_at >= p_start_date)
          AND (p_end_date IS NULL OR wop.created_at <= p_end_date)
        GROUP BY 1
        ORDER BY total DESC
        LIMIT 10
      ) c
    ),
    'expenseByPaidBy', (
      SELECT COALESCE(json_agg(json_build_object('paid_by', p.paid_by, 'total', p.total)), '[]'::json)
      FROM (
        SELECT COALESCE(wop.paid_by, 'Desconocido') as paid_by, 
               SUM(wop.total) as total
        FROM work_order_parts wop
        WHERE (p_start_date IS NULL OR wop.created_at >= p_start_date)
          AND (p_end_date IS NULL OR wop.created_at <= p_end_date)
        GROUP BY 1
        ORDER BY total DESC
      ) p
    )
  ) INTO result;
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_maintenance_general_kpis(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'staysByStatus', (
      SELECT COALESCE(json_agg(json_build_object('status', s.status, 'count', s.count)), '[]'::json)
      FROM (
        SELECT COALESCE(
          CASE 
            WHEN exited_at IS NOT NULL THEN 'completed'
            ELSE 'in_workshop'
          END, 'unknown'
        ) as status, count(*) as count
        FROM workshop_stays
        WHERE (p_start_date IS NULL OR entered_at >= p_start_date)
          AND (p_end_date IS NULL OR entered_at <= p_end_date)
        GROUP BY 1
      ) s
    ),
    'workOrdersByType', (
      SELECT COALESCE(json_agg(json_build_object('type', t.name, 'count', t.count)), '[]'::json)
      FROM (
        SELECT mt.name, count(*) as count
        FROM workshop_work_orders wwo
        JOIN maintenance_types mt ON wwo.maintenance_type_id = mt.id
        WHERE (p_start_date IS NULL OR wwo.started_at >= p_start_date)
          AND (p_end_date IS NULL OR wwo.started_at <= p_end_date)
        GROUP BY mt.name
      ) t
    ),
    'avgDaysInShop', (
      SELECT COALESCE(json_agg(json_build_object('date', d.month, 'avg_days', d.avg_days)), '[]'::json)
      FROM (
        SELECT to_char(entered_at, 'YYYY-MM') as month,
               AVG(EXTRACT(EPOCH FROM (COALESCE(exited_at, now()) - entered_at))/86400)::numeric(10,2) as avg_days
        FROM workshop_stays
        WHERE (p_start_date IS NULL OR entered_at >= p_start_date)
          AND (p_end_date IS NULL OR entered_at <= p_end_date)
        GROUP BY 1
        ORDER BY 1
      ) d
    ),
    'topUnitsByStays', (
      SELECT COALESCE(json_agg(json_build_object('unit', u.unit, 'count', u.count)), '[]'::json)
      FROM (
        SELECT COALESCE(tr.economic_number, ta.economic_number, 'Desconocida') as unit, count(*) as count
        FROM workshop_stays ws
        LEFT JOIN trucks tr ON ws.truck_id = tr.id
        LEFT JOIN trailers ta ON ws.trailer_id = ta.id
        WHERE (p_start_date IS NULL OR ws.entered_at >= p_start_date)
          AND (p_end_date IS NULL OR ws.entered_at <= p_end_date)
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 5
      ) u
    )
  ) INTO result;
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_set_workshop_stay_sequential_and_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  next_seq INTEGER;
  date_prefix TEXT;
BEGIN
  -- Calcula el siguiente número: MAX del campo (ignorando NULLs) + 1
  -- Si no hay registros o todos son NULL, empieza desde 1
  SELECT COALESCE(MAX(sequential_number), 0) + 1
  INTO next_seq
  FROM public.workshop_stays
  WHERE sequential_number IS NOT NULL;

  -- Prefijo de fecha usando la hora de México
  date_prefix := TO_CHAR(NEW.entered_at AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD');

  -- Asignar valores auto-generados
  NEW.sequential_number := next_seq;
  NEW.folio := date_prefix || '-TALLER-' || next_seq::TEXT;

  RETURN NEW;
END;
$function$
;


