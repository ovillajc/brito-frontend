drop view if exists "public"."workshop_stays_kpis";


  create table "public"."operator_settlements" (
    "id" uuid not null default gen_random_uuid(),
    "operator_id" uuid not null,
    "settled_by" uuid,
    "notes" text,
    "receipt_url" text,
    "status" text not null default 'open'::text,
    "opened_at" timestamp with time zone not null default now(),
    "closed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."operator_settlements" enable row level security;

alter table "public"."expenses" add column "settlement_id" uuid;

CREATE INDEX idx_expenses_settlement_id ON public.expenses USING btree (settlement_id);

CREATE INDEX idx_operator_settlements_operator_id ON public.operator_settlements USING btree (operator_id);

CREATE INDEX idx_operator_settlements_status ON public.operator_settlements USING btree (status);

CREATE UNIQUE INDEX operator_settlements_pkey ON public.operator_settlements USING btree (id);

alter table "public"."operator_settlements" add constraint "operator_settlements_pkey" PRIMARY KEY using index "operator_settlements_pkey";

alter table "public"."expenses" add constraint "expenses_settlement_id_fkey" FOREIGN KEY (settlement_id) REFERENCES public.operator_settlements(id) ON DELETE SET NULL not valid;

alter table "public"."expenses" validate constraint "expenses_settlement_id_fkey";

alter table "public"."operator_settlements" add constraint "operator_settlements_operator_id_fkey" FOREIGN KEY (operator_id) REFERENCES public.employees(id) not valid;

alter table "public"."operator_settlements" validate constraint "operator_settlements_operator_id_fkey";

alter table "public"."operator_settlements" add constraint "operator_settlements_settled_by_fkey" FOREIGN KEY (settled_by) REFERENCES public.profiles(id) not valid;

alter table "public"."operator_settlements" validate constraint "operator_settlements_settled_by_fkey";

alter table "public"."operator_settlements" add constraint "operator_settlements_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text]))) not valid;

alter table "public"."operator_settlements" validate constraint "operator_settlements_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fn_ensure_open_operator_settlement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

create or replace view "public"."operator_settlement_kpis" as  SELECT os.id AS settlement_id,
    os.operator_id,
    emp.full_name AS operator_name,
    os.status,
    os.notes,
    os.receipt_url,
    os.opened_at,
    os.closed_at,
    os.created_at,
    COALESCE(( SELECT sum(ea.amount) AS sum
           FROM public.expense_advances ea
          WHERE ((ea.operator_id = os.operator_id) AND (ea.assigned_at >= os.opened_at) AND ((os.closed_at IS NULL) OR (ea.assigned_at <= os.closed_at)))), (0)::numeric) AS assigned_amount,
    COALESCE(( SELECT sum(exp.amount) AS sum
           FROM public.expenses exp
          WHERE (exp.settlement_id = os.id)), (0)::numeric) AS spent_amount,
    (COALESCE(( SELECT sum(ea.amount) AS sum
           FROM public.expense_advances ea
          WHERE ((ea.operator_id = os.operator_id) AND (ea.assigned_at >= os.opened_at) AND ((os.closed_at IS NULL) OR (ea.assigned_at <= os.closed_at)))), (0)::numeric) - COALESCE(( SELECT sum(exp.amount) AS sum
           FROM public.expenses exp
          WHERE (exp.settlement_id = os.id)), (0)::numeric)) AS balance_amount,
    (os.status = 'closed'::text) AS is_settled,
    ( SELECT count(*) AS count
           FROM public.expenses exp
          WHERE (exp.settlement_id = os.id)) AS expense_count,
    ( SELECT count(*) AS count
           FROM public.expense_advances ea
          WHERE ((ea.operator_id = os.operator_id) AND (ea.assigned_at >= os.opened_at) AND ((os.closed_at IS NULL) OR (ea.assigned_at <= os.closed_at)))) AS advance_count
   FROM (public.operator_settlements os
     JOIN public.employees emp ON ((emp.id = os.operator_id)));


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


grant delete on table "public"."operator_settlements" to "anon";

grant insert on table "public"."operator_settlements" to "anon";

grant references on table "public"."operator_settlements" to "anon";

grant select on table "public"."operator_settlements" to "anon";

grant trigger on table "public"."operator_settlements" to "anon";

grant truncate on table "public"."operator_settlements" to "anon";

grant update on table "public"."operator_settlements" to "anon";

grant delete on table "public"."operator_settlements" to "authenticated";

grant insert on table "public"."operator_settlements" to "authenticated";

grant references on table "public"."operator_settlements" to "authenticated";

grant select on table "public"."operator_settlements" to "authenticated";

grant trigger on table "public"."operator_settlements" to "authenticated";

grant truncate on table "public"."operator_settlements" to "authenticated";

grant update on table "public"."operator_settlements" to "authenticated";

grant delete on table "public"."operator_settlements" to "service_role";

grant insert on table "public"."operator_settlements" to "service_role";

grant references on table "public"."operator_settlements" to "service_role";

grant select on table "public"."operator_settlements" to "service_role";

grant trigger on table "public"."operator_settlements" to "service_role";

grant truncate on table "public"."operator_settlements" to "service_role";

grant update on table "public"."operator_settlements" to "service_role";


  create policy "Permitir delete a usuarios autenticados en operator_settlements"
  on "public"."operator_settlements"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Permitir insert a usuarios autenticados en operator_settlements"
  on "public"."operator_settlements"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Permitir select a usuarios autenticados en operator_settlements"
  on "public"."operator_settlements"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Permitir update a usuarios autenticados en operator_settlements"
  on "public"."operator_settlements"
  as permissive
  for update
  to authenticated
using (true)
with check (true);


CREATE TRIGGER trg_ensure_open_operator_settlement AFTER INSERT ON public.expense_advances FOR EACH ROW EXECUTE FUNCTION public.fn_ensure_open_operator_settlement();


