alter table "public"."driver_details" add column "fasttrack_expiration" date;

alter table "public"."driver_details" add column "fasttrack_id" text;

alter table "public"."driver_details" add column "opalo_expiration" date;

alter table "public"."driver_details" add column "opalo_id" text;

alter table "public"."driver_details" add column "rcontrol_expiration" date;

alter table "public"."driver_details" add column "rcontrol_id" text;

alter table "public"."trucks" add column "capacity_kg" numeric;

alter table "public"."trucks" add column "size_ft" numeric;

alter table "public"."trucks" add column "vehicle_type" character varying(20) default 'TRUCK'::character varying;

alter table "public"."unit_assemblies" add column "pool_role" character varying(20) default 'titular'::character varying;

alter table "public"."unit_assemblies" add column "substitutes_unit_id" uuid;

alter table "public"."unit_assemblies" add constraint "unit_assemblies_substitutes_unit_id_fkey" FOREIGN KEY (substitutes_unit_id) REFERENCES public.unit_assemblies(id) ON DELETE SET NULL not valid;

alter table "public"."unit_assemblies" validate constraint "unit_assemblies_substitutes_unit_id_fkey";


