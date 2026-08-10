drop policy "Full access for authenticated users" on "public"."inventory_items";

drop policy "Full access for authenticated users" on "public"."inventory_movements";

drop policy "mechanical_categories_auth_all" on "public"."mechanical_categories";

drop policy "mechanical_categories_authenticated_all" on "public"."mechanical_categories";

revoke delete on table "public"."mechanical_categories" from "anon";

revoke insert on table "public"."mechanical_categories" from "anon";

revoke references on table "public"."mechanical_categories" from "anon";

revoke select on table "public"."mechanical_categories" from "anon";

revoke trigger on table "public"."mechanical_categories" from "anon";

revoke truncate on table "public"."mechanical_categories" from "anon";

revoke update on table "public"."mechanical_categories" from "anon";

revoke delete on table "public"."mechanical_categories" from "authenticated";

revoke insert on table "public"."mechanical_categories" from "authenticated";

revoke references on table "public"."mechanical_categories" from "authenticated";

revoke select on table "public"."mechanical_categories" from "authenticated";

revoke trigger on table "public"."mechanical_categories" from "authenticated";

revoke truncate on table "public"."mechanical_categories" from "authenticated";

revoke update on table "public"."mechanical_categories" from "authenticated";

revoke delete on table "public"."mechanical_categories" from "service_role";

revoke insert on table "public"."mechanical_categories" from "service_role";

revoke references on table "public"."mechanical_categories" from "service_role";

revoke select on table "public"."mechanical_categories" from "service_role";

revoke trigger on table "public"."mechanical_categories" from "service_role";

revoke truncate on table "public"."mechanical_categories" from "service_role";

revoke update on table "public"."mechanical_categories" from "service_role";

alter table "public"."inventory_movements" drop constraint "check_inventory_reference";

alter table "public"."mechanical_categories" drop constraint "mechanical_categories_name_key";

alter table "public"."trailers" drop constraint "trailers_serial_number_key";

alter table "public"."trucks" drop constraint "trucks_serial_number_key";

alter table "public"."workshop_work_orders" drop constraint "workshop_work_orders_mechanical_category_id_fkey";

alter table "public"."workshop_work_orders" drop constraint "workshop_work_orders_supervisor_profile_id_fkey";

alter table "public"."inventory_movements" drop constraint "inventory_movements_expense_id_fkey";

alter table "public"."inventory_movements" drop constraint "inventory_movements_item_id_fkey";

alter table "public"."inventory_movements" drop constraint "inventory_movements_maintenance_id_fkey";

alter table "public"."inventory_movements" drop constraint "inventory_movements_trip_id_fkey";

drop view if exists "public"."workshop_stays_kpis";

alter table "public"."mechanical_categories" drop constraint "mechanical_categories_pkey";

drop index if exists "public"."idx_inventory_expense_id";

drop index if exists "public"."idx_inventory_item_id";

drop index if exists "public"."idx_inventory_maintenance_id";

drop index if exists "public"."mechanical_categories_name_key";

drop index if exists "public"."mechanical_categories_pkey";

drop index if exists "public"."trailers_serial_number_key";

drop index if exists "public"."trucks_serial_number_key";

drop table "public"."mechanical_categories";


  create table "public"."maintenance_services" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "maintenance_type_id" uuid not null,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."maintenance_services" enable row level security;


  create table "public"."vehicle_components" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "vehicle_system_id" uuid not null,
    "description" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."vehicle_components" enable row level security;


  create table "public"."vehicle_systems" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."vehicle_systems" enable row level security;


  create table "public"."work_order_issues" (
    "id" uuid not null default gen_random_uuid(),
    "work_order_id" uuid not null,
    "vehicle_component_id" uuid not null,
    "reported_issue" text,
    "mechanic_notes" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."work_order_issues" enable row level security;

alter table "public"."inventory_movements" alter column "movement_type" set data type text using "movement_type"::text;

alter table "public"."inventory_movements" alter column "total_cost" set data type numeric using "total_cost"::numeric;

alter table "public"."inventory_movements" alter column "unit_cost" set data type numeric using "unit_cost"::numeric;

alter table "public"."work_order_parts" add column "is_internal_supply" boolean default false;

alter table "public"."work_order_parts" add column "notes" text;

alter table "public"."work_order_parts" add column "paid_by" uuid;

alter table "public"."workshop_stays" add column "km_last_service" numeric;

alter table "public"."workshop_stays" add column "last_trip_start_date" timestamp with time zone;

alter table "public"."workshop_stays" add column "notes" text;

alter table "public"."workshop_stays" add column "received_by_profile_id" uuid;

alter table "public"."workshop_stays" add column "sequential_number" integer;

alter table "public"."workshop_work_orders" drop column "mechanical_category_id";

alter table "public"."workshop_work_orders" drop column "supervisor_profile_id";

alter table "public"."workshop_work_orders" add column "failure_location" text;

alter table "public"."workshop_work_orders" add column "location_type" text default 'BASE'::text;

alter table "public"."workshop_work_orders" add column "maintenance_service_id" uuid;

alter table "public"."workshop_work_orders" add column "specialist_name" text;

alter table "public"."workshop_work_orders" add column "supervisor_employee_id" uuid;

alter table "public"."workshop_work_orders" add column "supervisor_name" text;

alter table "public"."workshop_work_orders" add column "vehicle_activity_at_failure" text;

CREATE INDEX idx_work_order_parts_inventory_item_id ON public.work_order_parts USING btree (inventory_item_id) WHERE (inventory_item_id IS NOT NULL);

CREATE UNIQUE INDEX maintenance_services_pkey ON public.maintenance_services USING btree (id);

CREATE UNIQUE INDEX uq_maintenance_services_name_type ON public.maintenance_services USING btree (name, maintenance_type_id);

CREATE UNIQUE INDEX uq_vehicle_component_name_system ON public.vehicle_components USING btree (name, vehicle_system_id);

CREATE UNIQUE INDEX vehicle_components_pkey ON public.vehicle_components USING btree (id);

CREATE UNIQUE INDEX vehicle_systems_name_key ON public.vehicle_systems USING btree (name);

CREATE UNIQUE INDEX vehicle_systems_pkey ON public.vehicle_systems USING btree (id);

CREATE UNIQUE INDEX work_order_issues_pkey ON public.work_order_issues USING btree (id);

alter table "public"."maintenance_services" add constraint "maintenance_services_pkey" PRIMARY KEY using index "maintenance_services_pkey";

alter table "public"."vehicle_components" add constraint "vehicle_components_pkey" PRIMARY KEY using index "vehicle_components_pkey";

alter table "public"."vehicle_systems" add constraint "vehicle_systems_pkey" PRIMARY KEY using index "vehicle_systems_pkey";

alter table "public"."work_order_issues" add constraint "work_order_issues_pkey" PRIMARY KEY using index "work_order_issues_pkey";

alter table "public"."maintenance_services" add constraint "maintenance_services_maintenance_type_id_fkey" FOREIGN KEY (maintenance_type_id) REFERENCES public.maintenance_types(id) ON DELETE RESTRICT not valid;

alter table "public"."maintenance_services" validate constraint "maintenance_services_maintenance_type_id_fkey";

alter table "public"."maintenance_services" add constraint "uq_maintenance_services_name_type" UNIQUE using index "uq_maintenance_services_name_type";

alter table "public"."vehicle_components" add constraint "uq_vehicle_component_name_system" UNIQUE using index "uq_vehicle_component_name_system";

alter table "public"."vehicle_components" add constraint "vehicle_components_vehicle_system_id_fkey" FOREIGN KEY (vehicle_system_id) REFERENCES public.vehicle_systems(id) ON DELETE RESTRICT not valid;

alter table "public"."vehicle_components" validate constraint "vehicle_components_vehicle_system_id_fkey";

alter table "public"."vehicle_systems" add constraint "vehicle_systems_name_key" UNIQUE using index "vehicle_systems_name_key";

alter table "public"."work_order_issues" add constraint "work_order_issues_vehicle_component_id_fkey" FOREIGN KEY (vehicle_component_id) REFERENCES public.vehicle_components(id) ON DELETE RESTRICT not valid;

alter table "public"."work_order_issues" validate constraint "work_order_issues_vehicle_component_id_fkey";

alter table "public"."work_order_issues" add constraint "work_order_issues_work_order_id_fkey" FOREIGN KEY (work_order_id) REFERENCES public.workshop_work_orders(id) ON DELETE CASCADE not valid;

alter table "public"."work_order_issues" validate constraint "work_order_issues_work_order_id_fkey";

alter table "public"."work_order_parts" add constraint "work_order_parts_paid_by_fkey" FOREIGN KEY (paid_by) REFERENCES public.profiles(id) not valid;

alter table "public"."work_order_parts" validate constraint "work_order_parts_paid_by_fkey";

alter table "public"."workshop_stays" add constraint "workshop_stays_received_by_profile_id_fkey" FOREIGN KEY (received_by_profile_id) REFERENCES public.profiles(id) not valid;

alter table "public"."workshop_stays" validate constraint "workshop_stays_received_by_profile_id_fkey";

alter table "public"."workshop_work_orders" add constraint "workshop_work_orders_maintenance_service_id_fkey" FOREIGN KEY (maintenance_service_id) REFERENCES public.maintenance_services(id) not valid;

alter table "public"."workshop_work_orders" validate constraint "workshop_work_orders_maintenance_service_id_fkey";

alter table "public"."workshop_work_orders" add constraint "workshop_work_orders_supervisor_employee_id_fkey" FOREIGN KEY (supervisor_employee_id) REFERENCES public.employees(id) not valid;

alter table "public"."workshop_work_orders" validate constraint "workshop_work_orders_supervisor_employee_id_fkey";

alter table "public"."inventory_movements" add constraint "inventory_movements_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES public.expenses(id) not valid;

alter table "public"."inventory_movements" validate constraint "inventory_movements_expense_id_fkey";

alter table "public"."inventory_movements" add constraint "inventory_movements_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) not valid;

alter table "public"."inventory_movements" validate constraint "inventory_movements_item_id_fkey";

alter table "public"."inventory_movements" add constraint "inventory_movements_maintenance_id_fkey" FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_records(id) not valid;

alter table "public"."inventory_movements" validate constraint "inventory_movements_maintenance_id_fkey";

alter table "public"."inventory_movements" add constraint "inventory_movements_trip_id_fkey" FOREIGN KEY (trip_id) REFERENCES public.trips(id) not valid;

alter table "public"."inventory_movements" validate constraint "inventory_movements_trip_id_fkey";

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


grant delete on table "public"."maintenance_services" to "anon";

grant insert on table "public"."maintenance_services" to "anon";

grant references on table "public"."maintenance_services" to "anon";

grant select on table "public"."maintenance_services" to "anon";

grant trigger on table "public"."maintenance_services" to "anon";

grant truncate on table "public"."maintenance_services" to "anon";

grant update on table "public"."maintenance_services" to "anon";

grant delete on table "public"."maintenance_services" to "authenticated";

grant insert on table "public"."maintenance_services" to "authenticated";

grant references on table "public"."maintenance_services" to "authenticated";

grant select on table "public"."maintenance_services" to "authenticated";

grant trigger on table "public"."maintenance_services" to "authenticated";

grant truncate on table "public"."maintenance_services" to "authenticated";

grant update on table "public"."maintenance_services" to "authenticated";

grant delete on table "public"."maintenance_services" to "service_role";

grant insert on table "public"."maintenance_services" to "service_role";

grant references on table "public"."maintenance_services" to "service_role";

grant select on table "public"."maintenance_services" to "service_role";

grant trigger on table "public"."maintenance_services" to "service_role";

grant truncate on table "public"."maintenance_services" to "service_role";

grant update on table "public"."maintenance_services" to "service_role";

grant delete on table "public"."vehicle_components" to "anon";

grant insert on table "public"."vehicle_components" to "anon";

grant references on table "public"."vehicle_components" to "anon";

grant select on table "public"."vehicle_components" to "anon";

grant trigger on table "public"."vehicle_components" to "anon";

grant truncate on table "public"."vehicle_components" to "anon";

grant update on table "public"."vehicle_components" to "anon";

grant delete on table "public"."vehicle_components" to "authenticated";

grant insert on table "public"."vehicle_components" to "authenticated";

grant references on table "public"."vehicle_components" to "authenticated";

grant select on table "public"."vehicle_components" to "authenticated";

grant trigger on table "public"."vehicle_components" to "authenticated";

grant truncate on table "public"."vehicle_components" to "authenticated";

grant update on table "public"."vehicle_components" to "authenticated";

grant delete on table "public"."vehicle_components" to "service_role";

grant insert on table "public"."vehicle_components" to "service_role";

grant references on table "public"."vehicle_components" to "service_role";

grant select on table "public"."vehicle_components" to "service_role";

grant trigger on table "public"."vehicle_components" to "service_role";

grant truncate on table "public"."vehicle_components" to "service_role";

grant update on table "public"."vehicle_components" to "service_role";

grant delete on table "public"."vehicle_systems" to "anon";

grant insert on table "public"."vehicle_systems" to "anon";

grant references on table "public"."vehicle_systems" to "anon";

grant select on table "public"."vehicle_systems" to "anon";

grant trigger on table "public"."vehicle_systems" to "anon";

grant truncate on table "public"."vehicle_systems" to "anon";

grant update on table "public"."vehicle_systems" to "anon";

grant delete on table "public"."vehicle_systems" to "authenticated";

grant insert on table "public"."vehicle_systems" to "authenticated";

grant references on table "public"."vehicle_systems" to "authenticated";

grant select on table "public"."vehicle_systems" to "authenticated";

grant trigger on table "public"."vehicle_systems" to "authenticated";

grant truncate on table "public"."vehicle_systems" to "authenticated";

grant update on table "public"."vehicle_systems" to "authenticated";

grant delete on table "public"."vehicle_systems" to "service_role";

grant insert on table "public"."vehicle_systems" to "service_role";

grant references on table "public"."vehicle_systems" to "service_role";

grant select on table "public"."vehicle_systems" to "service_role";

grant trigger on table "public"."vehicle_systems" to "service_role";

grant truncate on table "public"."vehicle_systems" to "service_role";

grant update on table "public"."vehicle_systems" to "service_role";

grant delete on table "public"."work_order_issues" to "anon";

grant insert on table "public"."work_order_issues" to "anon";

grant references on table "public"."work_order_issues" to "anon";

grant select on table "public"."work_order_issues" to "anon";

grant trigger on table "public"."work_order_issues" to "anon";

grant truncate on table "public"."work_order_issues" to "anon";

grant update on table "public"."work_order_issues" to "anon";

grant delete on table "public"."work_order_issues" to "authenticated";

grant insert on table "public"."work_order_issues" to "authenticated";

grant references on table "public"."work_order_issues" to "authenticated";

grant select on table "public"."work_order_issues" to "authenticated";

grant trigger on table "public"."work_order_issues" to "authenticated";

grant truncate on table "public"."work_order_issues" to "authenticated";

grant update on table "public"."work_order_issues" to "authenticated";

grant delete on table "public"."work_order_issues" to "service_role";

grant insert on table "public"."work_order_issues" to "service_role";

grant references on table "public"."work_order_issues" to "service_role";

grant select on table "public"."work_order_issues" to "service_role";

grant trigger on table "public"."work_order_issues" to "service_role";

grant truncate on table "public"."work_order_issues" to "service_role";

grant update on table "public"."work_order_issues" to "service_role";


  create policy "Allow authenticated users to read maintenance_providers"
  on "public"."maintenance_providers"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated users to read maintenance_services"
  on "public"."maintenance_services"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated users to read maintenance_types"
  on "public"."maintenance_types"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated users to read measurement_units"
  on "public"."measurement_units"
  as permissive
  for select
  to authenticated
using (true);



