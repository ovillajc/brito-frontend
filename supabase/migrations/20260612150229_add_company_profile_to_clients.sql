drop view if exists "public"."workshop_stays_kpis";

alter table "public"."clients" add column "company_profile_id" uuid;

alter table "public"."clients" add constraint "clients_company_profile_id_fkey" FOREIGN KEY (company_profile_id) REFERENCES public.company_profile(id) ON DELETE SET NULL not valid;

alter table "public"."clients" validate constraint "clients_company_profile_id_fkey";

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



