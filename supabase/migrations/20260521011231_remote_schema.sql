


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."ats_stage" AS ENUM (
    'postulado',
    'entrevista',
    'prueba_tecnica',
    'oferta',
    'contratado',
    'rechazado'
);


ALTER TYPE "public"."ats_stage" OWNER TO "postgres";


CREATE TYPE "public"."driver_rest_status" AS ENUM (
    'on_rest',
    'completed'
);


ALTER TYPE "public"."driver_rest_status" OWNER TO "postgres";


CREATE TYPE "public"."hr_incident_type" AS ENUM (
    'asistencia',
    'falta',
    'retardo',
    'vacaciones',
    'incapacidad',
    'permiso_sin_sueldo'
);


ALTER TYPE "public"."hr_incident_type" OWNER TO "postgres";


CREATE TYPE "public"."inventory_movement_type" AS ENUM (
    'in',
    'out',
    'adjustment'
);


ALTER TYPE "public"."inventory_movement_type" OWNER TO "postgres";


CREATE TYPE "public"."maintenance_status" AS ENUM (
    'open',
    'closed'
);


ALTER TYPE "public"."maintenance_status" OWNER TO "postgres";


CREATE TYPE "public"."maintenance_type" AS ENUM (
    'preventive',
    'corrective'
);


ALTER TYPE "public"."maintenance_type" OWNER TO "postgres";


CREATE TYPE "public"."reliable_resource_type" AS ENUM (
    'r_control',
    'fasttrack',
    'opalo'
);


ALTER TYPE "public"."reliable_resource_type" OWNER TO "postgres";


CREATE TYPE "public"."trip_status" AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'in_delivery',
    'returning',
    'at_base',
    'in_workshop',
    'at_client'
);


ALTER TYPE "public"."trip_status" OWNER TO "postgres";


CREATE TYPE "public"."unit_assembly_log_action" AS ENUM (
    'CREATED',
    'UPDATED',
    'TRAILER_DETACHED'
);


ALTER TYPE "public"."unit_assembly_log_action" OWNER TO "postgres";


CREATE TYPE "public"."unit_status" AS ENUM (
    'returning',
    'at_base',
    'at_client',
    'in_trip',
    'in_workshop'
);


ALTER TYPE "public"."unit_status" OWNER TO "postgres";


CREATE TYPE "public"."vehicle_status" AS ENUM (
    'available',
    'in_trip',
    'maintenance',
    'out_service',
    'assigned'
);


ALTER TYPE "public"."vehicle_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_admin"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_role_ids" "uuid"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_user_id uuid;
  v_role_id uuid;
begin
  -- 1. Insertar el usuario en la tabla de autenticación nativa de Supabase
  v_user_id := gen_random_uuid();
  
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', p_full_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 1.5. Insertar la identidad (necesario para login en GoTrue)
  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id::text,
    v_user_id,
    jsonb_build_object('sub', v_user_id, 'email', p_email, 'email_verified', false, 'phone_verified', false),
    'email',
    now(),
    now(),
    now()
  );

  -- 2. Asegurarse de que el registro del perfil exista
  insert into public.profiles (id, full_name)
  values (v_user_id, p_full_name)
  on conflict (id) do update set full_name = EXCLUDED.full_name;

  -- 3. Asignar los roles
  if array_length(p_role_ids, 1) > 0 then
    foreach v_role_id in array p_role_ids loop
      insert into public.profiles_roles (profile_id, role_id)
      values (v_user_id, v_role_id)
      on conflict do nothing;
    end loop;
  end if;

  return v_user_id;
end;
$$;


ALTER FUNCTION "public"."create_user_admin"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_role_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_admin"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  delete from auth.users where id = p_user_id;
end;
$$;


ALTER FUNCTION "public"."delete_user_admin"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expenses_compute_amount"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.amount := round(new.unit_price * new.quantity, 2);
  return new;
end;
$$;


ALTER FUNCTION "public"."expenses_compute_amount"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expenses_validate_diesel_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  sub_name  text;
  unit_name text;
begin
  select lower(
    replace(replace(replace(replace(replace(name,'é','e'),'í','i'),'á','a'),'ó','o'),'ú','u')
  )
  into sub_name
  from public.expense_subcategories
  where id = new.subcategory_id;

  if sub_name is null then
    return new;
  end if;

  if sub_name like '%diesel%' then
    select lower(
      replace(replace(replace(replace(replace(name,'é','e'),'í','i'),'á','a'),'ó','o'),'ú','u')
    )
    into unit_name
    from public.measurement_units
    where id = new.unit_id;

    if unit_name is null or unit_name not like 'litro%' then
      raise exception 'Si el gasto es Diésel, la unidad debe ser Litros';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."expenses_validate_diesel_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile_id', p.id,
    'full_name',  p.full_name,
    'roles', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id',          r.id,
            'name',        r.name,
            'description', r.description
          )
        )
        FROM profiles_roles pr
        JOIN roles r ON r.id = pr.role_id
        WHERE pr.profile_id = p.id
      ),
      '[]'::jsonb
    ),
    'permissions', COALESCE(
      (
        SELECT jsonb_agg(DISTINCT perm.name)
        FROM profiles_roles pr
        JOIN roles_permissions rp ON rp.role_id = pr.role_id
        JOIN permissions perm ON perm.id = rp.permission_id
        WHERE pr.profile_id = p.id
      ),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Si no existe perfil, devolver estructura vacía (no null)
  RETURN COALESCE(v_result, jsonb_build_object(
    'profile_id', p_user_id,
    'full_name',  NULL,
    'roles',      '[]'::jsonb,
    'permissions','[]'::jsonb
  ));
END;
$$;


ALTER FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_users_with_roles"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "created_at" timestamp with time zone, "last_sign_in_at" timestamp with time zone, "roles" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select
    u.id,
    u.email::text,
    p.full_name,
    u.created_at,
    u.last_sign_in_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', r.id, 'name', r.name, 'description', r.description)
      ) filter (where r.id is not null),
      '[]'::jsonb
    ) as roles
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.profiles_roles pr on pr.profile_id = u.id
  left join public.roles r on r.id = pr.role_id
  group by u.id, u.email, p.full_name, u.created_at, u.last_sign_in_at
  order by u.created_at desc;
end;
$$;


ALTER FUNCTION "public"."get_users_with_roles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_trip_odometer_from_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.trips
  SET
    initial_km = NEW.km_initial,
    final_km = NEW.km_final,
    preinvoice_km = NEW.total_km_preinvoice,
    updated_at = now()
  WHERE id = NEW.trip_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_trip_odometer_from_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_unit_status_from_trip"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.unit_assembly_id is null then
    return new;
  end if;

  if new.status = 'completed'::trip_status then
    update public.unit_assemblies
    set status = 'returning'::unit_status,
        updated_at = now()
    where id = new.unit_assembly_id;

    return new;
  end if;

  if new.status = 'cancelled'::trip_status then
    return new;
  end if;

  update public.unit_assemblies
  set status = 'in_trip'::unit_status,
      updated_at = now()
  where id = new.unit_assembly_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."sync_unit_status_from_trip"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."work_order_parts_compute_total"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  base numeric;
begin
  base := (new.quantity * new.unit_price) - coalesce(new.discount, 0);
  if base < 0 then
    base := 0;
  end if;

  new.total := round(base * (1 + coalesce(new.tax_rate, 0)), 2);
  return new;
end;
$$;


ALTER FUNCTION "public"."work_order_parts_compute_total"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cargo_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cargo_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_pools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client_pools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "required_document_name" "text" NOT NULL,
    "applies_to" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trade_name" "text",
    "company_name" "text",
    "rfc" "text",
    "tax_domicile" "text",
    "tax_regime" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_profile" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "legal_name" "text" NOT NULL,
    "rfc" "text" NOT NULL,
    "tax_regime" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "street" "text",
    "exterior_num" "text",
    "interior_num" "text",
    "neighborhood" "text",
    "city" "text",
    "state" "text",
    "country" "text" DEFAULT 'MEX'::"text" NOT NULL,
    "logo_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."company_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_billing_assignment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "client_id" "uuid",
    "company_profile_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customer_billing_assignment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "responsible_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "truck_id" "uuid",
    "trailer_id" "uuid",
    "client_id" "uuid",
    "document_name" "text",
    "file_url" "text" NOT NULL,
    "expiration_date" "date",
    "expiration_alert" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_document_entity" CHECK ((((((("employee_id" IS NOT NULL))::integer + (("truck_id" IS NOT NULL))::integer) + (("trailer_id" IS NOT NULL))::integer) + (("client_id" IS NOT NULL))::integer) = 1))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."driver_details" (
    "employee_id" "uuid" NOT NULL,
    "license_number" "text",
    "license_type" "text",
    "license_expiration" "date",
    "full_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reliable_resource" "text",
    "reliable_resource_type" "public"."reliable_resource_type",
    "reliable_resource_expiration" "date",
    CONSTRAINT "check_reliable_resource_consistency" CHECK (((("reliable_resource" IS NULL) AND ("reliable_resource_type" IS NULL) AND ("reliable_resource_expiration" IS NULL)) OR (("reliable_resource" IS NOT NULL) AND ("reliable_resource_type" IS NOT NULL) AND ("reliable_resource_expiration" IS NOT NULL)))),
    CONSTRAINT "check_reliable_resource_expiration_future" CHECK ((("reliable_resource_expiration" IS NULL) OR ("reliable_resource_expiration" >= CURRENT_DATE)))
);


ALTER TABLE "public"."driver_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."driver_rest_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "client_id" "uuid",
    "start_date" timestamp with time zone,
    "estimated_end_date" timestamp with time zone,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_employee_is_operator" CHECK (("employee_id" IS NOT NULL))
);


ALTER TABLE "public"."driver_rest_periods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "rfc" "text",
    "nss" "text",
    "hire_date" "date",
    "department_id" "uuid",
    "is_operator" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid",
    "curp" "text",
    "contact_phone" "text",
    "contact_email" "text",
    "birth_date" "date",
    "emergency_contact_name" "text",
    "emergency_contact_phone" "text",
    "blood_type" "text",
    "medical_notes" "text",
    "job_title" "text"
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_advances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "unit_assembly_id" "uuid",
    "operator_id" "uuid" NOT NULL,
    "truck_id" "uuid",
    "trailer_id" "uuid",
    "amount" numeric NOT NULL,
    "method" "text" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assigned_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "expense_advances_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "expense_advances_method_check" CHECK (("method" = ANY (ARRAY['cash'::"text", 'transfer'::"text"])))
);


ALTER TABLE "public"."expense_advances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."expense_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_subcategories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expense_subcategories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_trip_settlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "operator_id" "uuid",
    "receipt_url" "text",
    "notes" "text",
    "settled_by" "uuid",
    "settled_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expense_trip_settlements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "truck_id" "uuid",
    "trailer_id" "uuid",
    "category_id" "uuid",
    "amount" numeric(12,2) NOT NULL,
    "expense_date" "date" DEFAULT CURRENT_DATE,
    "description" "text",
    "receipt_url" "text",
    "is_ai_classified" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subcategory_id" "uuid",
    "unit_price" numeric NOT NULL,
    "quantity" numeric NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "frequency" "text",
    "cargo_type_id" "uuid",
    "comments" "text",
    "advance_id" "uuid",
    "is_settleable" boolean DEFAULT true,
    CONSTRAINT "check_expense_unit" CHECK (((("truck_id" IS NOT NULL) AND ("trailer_id" IS NULL)) OR (("truck_id" IS NULL) AND ("trailer_id" IS NOT NULL)) OR (("truck_id" IS NULL) AND ("trailer_id" IS NULL)))),
    CONSTRAINT "expenses_amount_matches_units_chk" CHECK (("amount" = "round"(("unit_price" * "quantity"), 2))),
    CONSTRAINT "expenses_frequency_check" CHECK ((("frequency" IS NULL) OR ("frequency" = ANY (ARRAY['recurrente'::"text", 'extraordinario'::"text"]))))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fuel_loads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "truck_id" "uuid",
    "operator_id" "uuid",
    "supervisor_name" "text",
    "load_date" timestamp with time zone,
    "ticket_folio" "text",
    "liters_loaded" numeric NOT NULL,
    "price_per_liter" numeric NOT NULL,
    "total_cost" numeric NOT NULL,
    "is_full_tank_fill" boolean DEFAULT false,
    "source_type" "text" DEFAULT 'EXTERNAL'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "supervised_by" "uuid",
    "expense_id" "uuid",
    "fuel_tank_movement_id" "uuid",
    "odometer_at_load" numeric,
    "vehicle_type" "text" DEFAULT 'TRUCK'::"text" NOT NULL,
    "trailer_id" "uuid",
    CONSTRAINT "fuel_loads_vehicle_type_check" CHECK (("vehicle_type" = ANY (ARRAY['TRUCK'::"text", 'TRAILER'::"text"])))
);


ALTER TABLE "public"."fuel_loads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fuel_tank_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tank_id" "uuid" NOT NULL,
    "movement_type" "text" NOT NULL,
    "liters" numeric NOT NULL,
    "unit_cost" numeric,
    "total_cost" numeric,
    "movement_date" timestamp with time zone DEFAULT "now"(),
    "trip_id" "uuid",
    "truck_id" "uuid",
    "fuel_load_id" "uuid",
    "expense_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "fuel_tank_movements_movement_type_check" CHECK (("movement_type" = ANY (ARRAY['IN'::"text", 'OUT'::"text", 'ADJUST'::"text"])))
);


ALTER TABLE "public"."fuel_tank_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fuel_tanks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "capacity_liters" numeric NOT NULL,
    "location" "text",
    "is_active" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fuel_tanks" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gastos_operativos_detalle" AS
 SELECT "id",
    "trip_id" AS "viaje_id",
    "expense_date" AS "fecha_gasto",
    "subcategory_id" AS "subcategoria_id",
    "description" AS "descripcion",
    "frequency" AS "frecuencia",
    "unit_price" AS "precio_unitario",
    "unit_id" AS "unidad_medida_id",
    "quantity" AS "cantidad",
    "amount" AS "monto_total",
    "comments" AS "comentarios"
   FROM "public"."expenses";


ALTER VIEW "public"."gastos_operativos_detalle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hr_applicants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "expected_role" "text" NOT NULL,
    "department_id" "uuid",
    "is_operator_role" boolean DEFAULT false,
    "stage" "public"."ats_stage" DEFAULT 'postulado'::"public"."ats_stage" NOT NULL,
    "phone_number" "text",
    "email" "text",
    "resume_url" "text",
    "board_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hr_applicants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hr_attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "incident_date" "date" NOT NULL,
    "incident_type" "public"."hr_incident_type" DEFAULT 'asistencia'::"public"."hr_incident_type" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hr_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "current_stock" integer DEFAULT 0,
    "minimum_stock" integer DEFAULT 0,
    "unit" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inventory_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid",
    "movement_type" "public"."inventory_movement_type",
    "quantity" integer NOT NULL,
    "unit_cost" numeric(12,2),
    "total_cost" numeric(12,2),
    "movement_date" timestamp with time zone DEFAULT "now"(),
    "expense_id" "uuid",
    "maintenance_id" "uuid",
    "trip_id" "uuid",
    "reference" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_inventory_reference" CHECK (((((("expense_id" IS NOT NULL))::integer + (("maintenance_id" IS NOT NULL))::integer) + (("trip_id" IS NOT NULL))::integer) <= 1)),
    CONSTRAINT "inventory_movements_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."inventory_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "maintenance_providers_provider_type_check" CHECK (("provider_type" = ANY (ARRAY['INTERNAL'::"text", 'EXTERNAL'::"text"])))
);


ALTER TABLE "public"."maintenance_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "truck_id" "uuid",
    "trailer_id" "uuid",
    "maintenance_type" "public"."maintenance_type",
    "location" "text",
    "scheduled_date" "date",
    "completed_date" "date",
    "total_cost" numeric(12,2),
    "comments" "text",
    "status" "public"."maintenance_status" DEFAULT 'open'::"public"."maintenance_status",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_maintenance_unit" CHECK (((("truck_id" IS NOT NULL) AND ("trailer_id" IS NULL)) OR (("truck_id" IS NULL) AND ("trailer_id" IS NOT NULL))))
);


ALTER TABLE "public"."maintenance_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."maintenance_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."measurement_units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "abbreviation" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."measurement_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mechanical_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mechanical_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mobile_chat_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "sender_role" "text" NOT NULL,
    "message_type" "text" NOT NULL,
    "text" "text",
    "media_url" "text",
    "trip_id" "uuid",
    "unit_assembly_id" "uuid",
    "operator_id" "uuid",
    CONSTRAINT "mobile_chat_logs_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'audio'::"text"]))),
    CONSTRAINT "mobile_chat_logs_sender_role_check" CHECK (("sender_role" = ANY (ARRAY['guardia'::"text", 'administrativo'::"text"])))
);


ALTER TABLE "public"."mobile_chat_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "department_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "role_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles_permissions" (
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roles_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trailer_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trailer_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trailer_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "brand" "text",
    "provider" "text",
    "capacity_kg" numeric(12,2),
    "size" "text",
    "cargo_type" "text",
    "acquisition_year" integer,
    "category_id" "uuid",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_trailer_year_valid" CHECK ((("acquisition_year" IS NULL) OR ("acquisition_year" >= 1980)))
);


ALTER TABLE "public"."trailer_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trailers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "economic_number" "text" NOT NULL,
    "plates" "text",
    "serial_number" "text",
    "insurance_policy" "text",
    "company_profile_id" "uuid",
    "trailer_model_id" "uuid",
    "status" "public"."vehicle_status" DEFAULT 'available'::"public"."vehicle_status",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "size_ft" numeric,
    "continuous_refrigerated_yield" numeric,
    "continuous_frozen_yield" numeric,
    "ss_refrigerated_yield" numeric,
    "ss_frozen_yield" numeric
);


ALTER TABLE "public"."trailers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_client_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "client_table_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_client_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "event_type" "text",
    "description" "text",
    "event_time" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_events" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trips_trip_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."trips_trip_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "folio" "text",
    "client_id" "uuid",
    "company_profile_id" "uuid",
    "departure_date" timestamp with time zone,
    "arrival_date_actual" timestamp with time zone,
    "status" "public"."trip_status" DEFAULT 'scheduled'::"public"."trip_status",
    "trip_type" "text",
    "total_income" numeric(12,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "origin" "text",
    "destination" "text",
    "is_full_trip" boolean DEFAULT false,
    "initial_km" numeric,
    "final_km" numeric,
    "preinvoice_km" numeric,
    "client_specific_data" "jsonb",
    "unit_assembly_id" "uuid",
    "monitored_by" "uuid",
    "fuel_load_date" timestamp with time zone,
    "trip_number_client" integer,
    "last_scan" timestamp with time zone,
    "observations" "text",
    "linked_trip_id" "uuid",
    "trip_leg" "text",
    "trip_number" bigint DEFAULT "nextval"('"public"."trips_trip_number_seq"'::"regclass"),
    CONSTRAINT "trips_trip_leg_check" CHECK (("trip_leg" = ANY (ARRAY['STR'::"text", 'DHD'::"text", NULL::"text"])))
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."trip_expense_assignment_kpis" AS
 SELECT "id" AS "trip_id",
    "folio",
    "trip_number",
    "status" AS "trip_status",
    "unit_assembly_id",
    ( SELECT "ea"."operator_id"
           FROM "public"."expense_advances" "ea"
          WHERE ("ea"."trip_id" = "t"."id")
          ORDER BY "ea"."assigned_at" DESC
         LIMIT 1) AS "operator_id",
    COALESCE(( SELECT "sum"("ea"."amount") AS "sum"
           FROM "public"."expense_advances" "ea"
          WHERE ("ea"."trip_id" = "t"."id")), (0)::numeric) AS "assigned_amount",
    COALESCE(( SELECT "sum"("e"."amount") AS "sum"
           FROM "public"."expenses" "e"
          WHERE (("e"."trip_id" = "t"."id") AND ("e"."is_settleable" = true))), (0)::numeric) AS "spent_amount",
    (COALESCE(( SELECT "sum"("ea"."amount") AS "sum"
           FROM "public"."expense_advances" "ea"
          WHERE ("ea"."trip_id" = "t"."id")), (0)::numeric) - COALESCE(( SELECT "sum"("e"."amount") AS "sum"
           FROM "public"."expenses" "e"
          WHERE (("e"."trip_id" = "t"."id") AND ("e"."is_settleable" = true))), (0)::numeric)) AS "balance_amount",
    (EXISTS ( SELECT 1
           FROM "public"."expense_trip_settlements" "ets"
          WHERE ("ets"."trip_id" = "t"."id"))) AS "is_settled",
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM "public"."expense_trip_settlements" "ets"
              WHERE ("ets"."trip_id" = "t"."id"))) THEN 'settled'::"text"
            ELSE 'pending'::"text"
        END AS "settlement_status"
   FROM "public"."trips" "t";


ALTER VIEW "public"."trip_expense_assignment_kpis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_fuel_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "km_initial" numeric,
    "km_final" numeric,
    "hours_r1" numeric DEFAULT 0,
    "hours_r2" numeric DEFAULT 0,
    "total_km_preinvoice" numeric,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "km_initial_date" timestamp with time zone,
    "km_final_date" timestamp with time zone,
    "r1_start_date" timestamp with time zone,
    "r1_end_date" timestamp with time zone,
    "r2_start_date" timestamp with time zone,
    "r2_end_date" timestamp with time zone
);


ALTER TABLE "public"."trip_fuel_metrics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."trip_rentabilidad" AS
 SELECT "t"."id" AS "viaje_id",
    COALESCE("t"."total_income", (0)::numeric) AS "ingreso_neto",
    COALESCE("sum"("e"."amount"), (0)::numeric) AS "total_gastos",
    (COALESCE("t"."total_income", (0)::numeric) - COALESCE("sum"("e"."amount"), (0)::numeric)) AS "ganancia_neta",
        CASE
            WHEN (COALESCE("t"."total_income", (0)::numeric) = (0)::numeric) THEN NULL::numeric
            ELSE "round"((((COALESCE("t"."total_income", (0)::numeric) - COALESCE("sum"("e"."amount"), (0)::numeric)) / NULLIF("t"."total_income", (0)::numeric)) * (100)::numeric), 2)
        END AS "variacion_pct"
   FROM ("public"."trips" "t"
     LEFT JOIN "public"."expenses" "e" ON (("e"."trip_id" = "t"."id")))
  GROUP BY "t"."id", "t"."total_income";


ALTER VIEW "public"."trip_rentabilidad" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_stops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "stop_order" integer,
    "location_name" "text",
    "address" "text",
    "estimated_arrival" timestamp with time zone,
    "actual_departure" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_stops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_tracking_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "speed" numeric(6,2),
    "heading" numeric(6,2),
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_tracking_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trucks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "economic_number" "text" NOT NULL,
    "brand" "text",
    "model" "text",
    "year" integer,
    "plates" "text",
    "serial_number" "text",
    "insurance_policy" "text",
    "company_profile_id" "uuid",
    "status" "public"."vehicle_status" DEFAULT 'available'::"public"."vehicle_status",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "engine" "text",
    "tire_size" "text",
    "tank_capacity" numeric,
    "theoretical_yield" numeric,
    CONSTRAINT "check_truck_year_valid" CHECK ((("year" IS NULL) OR ("year" >= 1980)))
);


ALTER TABLE "public"."trucks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unit_assemblies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "economic_number" "text" NOT NULL,
    "description" "text",
    "employee_id" "uuid" NOT NULL,
    "truck_id" "uuid" NOT NULL,
    "trailer_id" "uuid",
    "client_id" "uuid",
    "company_profile_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "trailer2_id" "uuid",
    "client_pool_id" "uuid",
    "status" "public"."unit_status" DEFAULT 'at_base'::"public"."unit_status"
);


ALTER TABLE "public"."unit_assemblies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unit_assembly_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_assembly_id" "uuid" NOT NULL,
    "employee_id" "uuid",
    "truck_id" "uuid",
    "trailer_id" "uuid",
    "trailer2_id" "uuid",
    "profile_id" "uuid",
    "action" "public"."unit_assembly_log_action" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."unit_assembly_logs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_accounts" AS
 SELECT "u"."id",
    "u"."email",
    "p"."full_name",
    "u"."created_at",
    "u"."last_sign_in_at"
   FROM ("auth"."users" "u"
     LEFT JOIN "public"."profiles" "p" ON (("u"."id" = "p"."id")));


ALTER VIEW "public"."user_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."walmart_stores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "location" "text",
    "store_type" "text",
    "store_code" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."walmart_stores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."walmart_trip_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "trip_number_walmart" integer,
    "coordinator_name" "text",
    "route" "text",
    "cargo_type" "text",
    "carta_porte_walmart" "text",
    "status_walmart" "text",
    "str_num_load" "text",
    "str_complement_carta_porte" "text",
    "str_preinvoice_km" numeric,
    "str_km_traveled" numeric,
    "str_diesel" numeric,
    "str_casetas" numeric,
    "str_total_invoice" numeric,
    "dhd_num_load" "text",
    "dhd_complement_carta_porte" "text",
    "dhd_preinvoice_km" numeric,
    "dhd_km_traveled" numeric,
    "dhd_diesel" numeric,
    "dhd_casetas" numeric,
    "dhd_total_invoice" numeric,
    "dettes_log" "jsonb" DEFAULT '[]'::"jsonb",
    "departure_temperature" "text",
    "departure_time" timestamp with time zone,
    "num_stores" integer,
    "incidencias" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."walmart_trip_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_order_parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "work_order_id" "uuid" NOT NULL,
    "provider_id" "uuid",
    "inventory_item_id" "uuid",
    "description" "text" NOT NULL,
    "brand" "text",
    "unit_id" "uuid",
    "quantity" numeric NOT NULL,
    "unit_price" numeric NOT NULL,
    "discount" numeric DEFAULT 0 NOT NULL,
    "tax_rate" numeric DEFAULT 0.16 NOT NULL,
    "total" numeric DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "work_order_parts_discount_check" CHECK (("discount" >= (0)::numeric)),
    CONSTRAINT "work_order_parts_quantity_check" CHECK (("quantity" > (0)::numeric)),
    CONSTRAINT "work_order_parts_tax_rate_check" CHECK ((("tax_rate" >= (0)::numeric) AND ("tax_rate" <= (1)::numeric))),
    CONSTRAINT "work_order_parts_unit_price_check" CHECK (("unit_price" >= (0)::numeric))
);


ALTER TABLE "public"."work_order_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workshop_stays" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "folio" "text" NOT NULL,
    "vehicle_type" "text" NOT NULL,
    "truck_id" "uuid",
    "trailer_id" "uuid",
    "entered_at" timestamp with time zone NOT NULL,
    "exited_at" timestamp with time zone,
    "reason" "text" NOT NULL,
    "km_at_entry" numeric,
    "delivered_by_employee_id" "uuid",
    "picked_up_by_employee_id" "uuid",
    "last_trip_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "workshop_stays_vehicle_fk_chk" CHECK (((("vehicle_type" = 'TRUCK'::"text") AND ("truck_id" IS NOT NULL) AND ("trailer_id" IS NULL)) OR (("vehicle_type" = 'TRAILER'::"text") AND ("trailer_id" IS NOT NULL) AND ("truck_id" IS NULL)))),
    CONSTRAINT "workshop_stays_vehicle_type_check" CHECK (("vehicle_type" = ANY (ARRAY['TRUCK'::"text", 'TRAILER'::"text"])))
);


ALTER TABLE "public"."workshop_stays" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workshop_work_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stay_id" "uuid" NOT NULL,
    "folio" "text" NOT NULL,
    "maintenance_type_id" "uuid",
    "mechanical_category_id" "uuid",
    "started_at" timestamp with time zone NOT NULL,
    "finished_at" timestamp with time zone,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "specialist_employee_id" "uuid",
    "supervisor_profile_id" "uuid",
    "description" "text" NOT NULL,
    "details" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "workshop_work_orders_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'completed'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."workshop_work_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."workshop_stays_kpis" AS
 SELECT "s"."id",
    "s"."folio",
    "s"."vehicle_type",
    COALESCE("t"."economic_number", "tr"."economic_number", '—'::"text") AS "unit_label",
    "s"."entered_at",
    "s"."exited_at",
    "s"."reason",
    ("floor"((EXTRACT(epoch FROM (COALESCE("s"."exited_at", "now"()) - "s"."entered_at")) / 86400.0)))::integer AS "days_in_shop",
    COALESCE("sum"("p"."total"), (0)::numeric) AS "total_cost",
        CASE
            WHEN ("s"."exited_at" IS NULL) THEN 'open'::"text"
            ELSE 'closed'::"text"
        END AS "status"
   FROM (((("public"."workshop_stays" "s"
     LEFT JOIN "public"."trucks" "t" ON (("t"."id" = "s"."truck_id")))
     LEFT JOIN "public"."trailers" "tr" ON (("tr"."id" = "s"."trailer_id")))
     LEFT JOIN "public"."workshop_work_orders" "w" ON (("w"."stay_id" = "s"."id")))
     LEFT JOIN "public"."work_order_parts" "p" ON (("p"."work_order_id" = "w"."id")))
  GROUP BY "s"."id", "s"."folio", "s"."vehicle_type", "t"."economic_number", "tr"."economic_number", "s"."entered_at", "s"."exited_at", "s"."reason";


ALTER VIEW "public"."workshop_stays_kpis" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cargo_types"
    ADD CONSTRAINT "cargo_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cargo_types"
    ADD CONSTRAINT "cargo_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_pools"
    ADD CONSTRAINT "client_pools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_requirements"
    ADD CONSTRAINT "client_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_profile"
    ADD CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_profile"
    ADD CONSTRAINT "company_profile_rfc_key" UNIQUE ("rfc");



ALTER TABLE ONLY "public"."customer_billing_assignment"
    ADD CONSTRAINT "customer_billing_assignment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_billing_assignment"
    ADD CONSTRAINT "customer_billing_assignment_profile_id_client_id_company_pr_key" UNIQUE ("profile_id", "client_id", "company_profile_id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."driver_details"
    ADD CONSTRAINT "driver_details_pkey" PRIMARY KEY ("employee_id");



ALTER TABLE ONLY "public"."driver_rest_periods"
    ADD CONSTRAINT "driver_rest_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_curp_key" UNIQUE ("curp");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_profile_id_key" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_rfc_key" UNIQUE ("rfc");



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_subcategories"
    ADD CONSTRAINT "expense_subcategories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_subcategories"
    ADD CONSTRAINT "expense_subcategories_unique_per_category" UNIQUE ("category_id", "name");



ALTER TABLE ONLY "public"."expense_trip_settlements"
    ADD CONSTRAINT "expense_trip_settlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_trip_settlements"
    ADD CONSTRAINT "expense_trip_settlements_trip_id_key" UNIQUE ("trip_id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fuel_tanks"
    ADD CONSTRAINT "fuel_tanks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hr_applicants"
    ADD CONSTRAINT "hr_applicants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hr_attendance"
    ADD CONSTRAINT "hr_attendance_employee_id_incident_date_key" UNIQUE ("employee_id", "incident_date");



ALTER TABLE ONLY "public"."hr_attendance"
    ADD CONSTRAINT "hr_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_providers"
    ADD CONSTRAINT "maintenance_providers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."maintenance_providers"
    ADD CONSTRAINT "maintenance_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_records"
    ADD CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_types"
    ADD CONSTRAINT "maintenance_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."maintenance_types"
    ADD CONSTRAINT "maintenance_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."measurement_units"
    ADD CONSTRAINT "measurement_units_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."measurement_units"
    ADD CONSTRAINT "measurement_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mechanical_categories"
    ADD CONSTRAINT "mechanical_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."mechanical_categories"
    ADD CONSTRAINT "mechanical_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mobile_chat_logs"
    ADD CONSTRAINT "mobile_chat_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_profile_id_rol_id_key" UNIQUE ("profile_id", "role_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles_permissions"
    ADD CONSTRAINT "roles_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trailer_categories"
    ADD CONSTRAINT "trailer_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."trailer_categories"
    ADD CONSTRAINT "trailer_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trailer_models"
    ADD CONSTRAINT "trailer_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trailers"
    ADD CONSTRAINT "trailers_economic_number_key" UNIQUE ("economic_number");



ALTER TABLE ONLY "public"."trailers"
    ADD CONSTRAINT "trailers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trailers"
    ADD CONSTRAINT "trailers_serial_number_key" UNIQUE ("serial_number");



ALTER TABLE ONLY "public"."trip_client_entries"
    ADD CONSTRAINT "trip_client_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_client_entries"
    ADD CONSTRAINT "trip_client_entries_trip_client_unique" UNIQUE ("trip_id", "client_id");



ALTER TABLE ONLY "public"."trip_client_entries"
    ADD CONSTRAINT "trip_client_entries_trip_id_client_id_key" UNIQUE ("trip_id", "client_id");



ALTER TABLE ONLY "public"."trip_events"
    ADD CONSTRAINT "trip_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_fuel_metrics"
    ADD CONSTRAINT "trip_fuel_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_fuel_metrics"
    ADD CONSTRAINT "trip_fuel_metrics_trip_id_key" UNIQUE ("trip_id");



ALTER TABLE ONLY "public"."trip_stops"
    ADD CONSTRAINT "trip_stops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_tracking_logs"
    ADD CONSTRAINT "trip_tracking_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_folio_key" UNIQUE ("folio");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trucks"
    ADD CONSTRAINT "trucks_economic_number_key" UNIQUE ("economic_number");



ALTER TABLE ONLY "public"."trucks"
    ADD CONSTRAINT "trucks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trucks"
    ADD CONSTRAINT "trucks_serial_number_key" UNIQUE ("serial_number");



ALTER TABLE ONLY "public"."customer_billing_assignment"
    ADD CONSTRAINT "unique_billing_assignment" UNIQUE ("profile_id", "client_id", "company_profile_id");



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "unique_profile_role" UNIQUE ("profile_id", "role_id");



ALTER TABLE ONLY "public"."driver_details"
    ADD CONSTRAINT "unique_reliable_resource" UNIQUE ("reliable_resource");



ALTER TABLE ONLY "public"."trailer_models"
    ADD CONSTRAINT "unique_trailer_model" UNIQUE ("name", "brand");



ALTER TABLE ONLY "public"."trip_stops"
    ADD CONSTRAINT "unique_trip_stop_order" UNIQUE ("trip_id", "stop_order");



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_economic_number_key" UNIQUE ("economic_number");



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walmart_stores"
    ADD CONSTRAINT "walmart_stores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walmart_stores"
    ADD CONSTRAINT "walmart_stores_store_code_key" UNIQUE ("store_code");



ALTER TABLE ONLY "public"."walmart_trip_data"
    ADD CONSTRAINT "walmart_trip_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walmart_trip_data"
    ADD CONSTRAINT "walmart_trip_data_trip_id_key" UNIQUE ("trip_id");



ALTER TABLE ONLY "public"."work_order_parts"
    ADD CONSTRAINT "work_order_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_folio_key" UNIQUE ("folio");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_folio_uq" UNIQUE ("stay_id", "folio");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_pkey" PRIMARY KEY ("id");



CREATE INDEX "expense_advances_assigned_at_idx" ON "public"."expense_advances" USING "btree" ("assigned_at" DESC);



CREATE INDEX "expense_advances_operator_id_idx" ON "public"."expense_advances" USING "btree" ("operator_id");



CREATE INDEX "expense_advances_trip_id_idx" ON "public"."expense_advances" USING "btree" ("trip_id");



CREATE UNIQUE INDEX "expense_subcategories_category_name_uq" ON "public"."expense_subcategories" USING "btree" ("category_id", "lower"("name"));



CREATE INDEX "expense_trip_settlements_trip_id_idx" ON "public"."expense_trip_settlements" USING "btree" ("trip_id");



CREATE INDEX "expenses_advance_id_idx" ON "public"."expenses" USING "btree" ("advance_id");



CREATE INDEX "fuel_tank_movements_tank_date_idx" ON "public"."fuel_tank_movements" USING "btree" ("tank_id", "movement_date" DESC);



CREATE UNIQUE INDEX "fuel_tanks_single_active" ON "public"."fuel_tanks" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_customer_billing_client_id" ON "public"."customer_billing_assignment" USING "btree" ("client_id");



CREATE INDEX "idx_customer_billing_profile_id" ON "public"."customer_billing_assignment" USING "btree" ("profile_id");



CREATE INDEX "idx_documents_client_id" ON "public"."documents" USING "btree" ("client_id");



CREATE INDEX "idx_documents_employee_id" ON "public"."documents" USING "btree" ("employee_id");



CREATE INDEX "idx_documents_trailer_id" ON "public"."documents" USING "btree" ("trailer_id");



CREATE INDEX "idx_documents_truck_id" ON "public"."documents" USING "btree" ("truck_id");



CREATE INDEX "idx_driver_details_resource" ON "public"."driver_details" USING "btree" ("reliable_resource_type", "reliable_resource");



CREATE INDEX "idx_driver_details_resource_expiration" ON "public"."driver_details" USING "btree" ("reliable_resource_expiration");



CREATE INDEX "idx_driver_rest_client_id" ON "public"."driver_rest_periods" USING "btree" ("client_id");



CREATE INDEX "idx_driver_rest_employee_id" ON "public"."driver_rest_periods" USING "btree" ("employee_id");



CREATE INDEX "idx_employees_department_id" ON "public"."employees" USING "btree" ("department_id");



CREATE INDEX "idx_employees_full_name" ON "public"."employees" USING "btree" ("full_name");



CREATE INDEX "idx_employees_profile_id" ON "public"."employees" USING "btree" ("profile_id");



CREATE INDEX "idx_expenses_trailer_id" ON "public"."expenses" USING "btree" ("trailer_id");



CREATE INDEX "idx_expenses_trip_id" ON "public"."expenses" USING "btree" ("trip_id");



CREATE INDEX "idx_expenses_truck_id" ON "public"."expenses" USING "btree" ("truck_id");



CREATE INDEX "idx_fuel_loads_supervised_by" ON "public"."fuel_loads" USING "btree" ("supervised_by");



CREATE INDEX "idx_hr_applicants_stage" ON "public"."hr_applicants" USING "btree" ("stage");



CREATE INDEX "idx_hr_attendance_date" ON "public"."hr_attendance" USING "btree" ("incident_date");



CREATE INDEX "idx_hr_attendance_employee" ON "public"."hr_attendance" USING "btree" ("employee_id");



CREATE INDEX "idx_inventory_expense_id" ON "public"."inventory_movements" USING "btree" ("expense_id");



CREATE INDEX "idx_inventory_item_id" ON "public"."inventory_movements" USING "btree" ("item_id");



CREATE INDEX "idx_inventory_maintenance_id" ON "public"."inventory_movements" USING "btree" ("maintenance_id");



CREATE INDEX "idx_maintenance_trailer_id" ON "public"."maintenance_records" USING "btree" ("trailer_id");



CREATE INDEX "idx_maintenance_truck_id" ON "public"."maintenance_records" USING "btree" ("truck_id");



CREATE INDEX "idx_profiles_department_id" ON "public"."profiles" USING "btree" ("department_id");



CREATE INDEX "idx_profiles_roles_profile_id" ON "public"."profiles_roles" USING "btree" ("profile_id");



CREATE INDEX "idx_profiles_roles_role_id" ON "public"."profiles_roles" USING "btree" ("role_id");



CREATE INDEX "idx_roles_permissions_role_id" ON "public"."roles_permissions" USING "btree" ("role_id");



CREATE INDEX "idx_tracking_trip_time" ON "public"."trip_tracking_logs" USING "btree" ("trip_id", "recorded_at" DESC);



CREATE INDEX "idx_trailer_models_category_id" ON "public"."trailer_models" USING "btree" ("category_id");



CREATE INDEX "idx_trailers_company_profile_id" ON "public"."trailers" USING "btree" ("company_profile_id");



CREATE INDEX "idx_trailers_model_id" ON "public"."trailers" USING "btree" ("trailer_model_id");



CREATE INDEX "idx_trip_fuel_metrics_trip" ON "public"."trip_fuel_metrics" USING "btree" ("trip_id");



CREATE INDEX "idx_trip_stops_trip_id" ON "public"."trip_stops" USING "btree" ("trip_id");



CREATE INDEX "idx_trips_client_id" ON "public"."trips" USING "btree" ("client_id");



CREATE INDEX "idx_trips_client_number" ON "public"."trips" USING "btree" ("client_id", "trip_number_client");



CREATE INDEX "idx_trips_company_profile_id" ON "public"."trips" USING "btree" ("company_profile_id");



CREATE INDEX "idx_trips_linked" ON "public"."trips" USING "btree" ("linked_trip_id");



CREATE INDEX "idx_trips_monitored_by" ON "public"."trips" USING "btree" ("monitored_by");



CREATE INDEX "idx_trucks_company_profile_id" ON "public"."trucks" USING "btree" ("company_profile_id");



CREATE INDEX "idx_walmart_trip_data_trip" ON "public"."walmart_trip_data" USING "btree" ("trip_id");



CREATE UNIQUE INDEX "trips_trip_number_unique" ON "public"."trips" USING "btree" ("trip_number");



CREATE INDEX "work_order_parts_work_order_idx" ON "public"."work_order_parts" USING "btree" ("work_order_id");



CREATE INDEX "workshop_stays_entered_at_idx" ON "public"."workshop_stays" USING "btree" ("entered_at" DESC);



CREATE INDEX "workshop_stays_vehicle_idx" ON "public"."workshop_stays" USING "btree" ("vehicle_type");



CREATE INDEX "workshop_work_orders_stay_idx" ON "public"."workshop_work_orders" USING "btree" ("stay_id");



CREATE OR REPLACE TRIGGER "set_updated_at_clients" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_company_profile" BEFORE UPDATE ON "public"."company_profile" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_departments" BEFORE UPDATE ON "public"."departments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_driver_details" BEFORE UPDATE ON "public"."driver_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_employees" BEFORE UPDATE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_permissions" BEFORE UPDATE ON "public"."permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_profiles" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_roles" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_trailer_models" BEFORE UPDATE ON "public"."trailer_models" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_trailers" BEFORE UPDATE ON "public"."trailers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_trips" BEFORE UPDATE ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_trucks" BEFORE UPDATE ON "public"."trucks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_expenses_compute_amount" BEFORE INSERT OR UPDATE OF "unit_price", "quantity" ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."expenses_compute_amount"();



CREATE OR REPLACE TRIGGER "trg_expenses_validate_diesel_unit" BEFORE INSERT OR UPDATE OF "subcategory_id", "unit_id" ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."expenses_validate_diesel_unit"();



CREATE OR REPLACE TRIGGER "trg_sync_trip_odometer_from_metrics" AFTER INSERT OR UPDATE ON "public"."trip_fuel_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."sync_trip_odometer_from_metrics"();



CREATE OR REPLACE TRIGGER "trg_sync_unit_status_from_trip" AFTER INSERT OR UPDATE OF "status", "unit_assembly_id" ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."sync_unit_status_from_trip"();



CREATE OR REPLACE TRIGGER "trg_work_order_parts_compute_total" BEFORE INSERT OR UPDATE OF "quantity", "unit_price", "discount", "tax_rate" ON "public"."work_order_parts" FOR EACH ROW EXECUTE FUNCTION "public"."work_order_parts_compute_total"();



CREATE OR REPLACE TRIGGER "update_client_pools_updated_at" BEFORE UPDATE ON "public"."client_pools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."client_pools"
    ADD CONSTRAINT "client_pools_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_requirements"
    ADD CONSTRAINT "client_requirements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_billing_assignment"
    ADD CONSTRAINT "customer_billing_assignment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_billing_assignment"
    ADD CONSTRAINT "customer_billing_assignment_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_billing_assignment"
    ADD CONSTRAINT "customer_billing_assignment_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."driver_details"
    ADD CONSTRAINT "driver_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."driver_rest_periods"
    ADD CONSTRAINT "driver_rest_periods_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."driver_rest_periods"
    ADD CONSTRAINT "driver_rest_periods_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id");



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id");



ALTER TABLE ONLY "public"."expense_advances"
    ADD CONSTRAINT "expense_advances_unit_assembly_id_fkey" FOREIGN KEY ("unit_assembly_id") REFERENCES "public"."unit_assemblies"("id");



ALTER TABLE ONLY "public"."expense_subcategories"
    ADD CONSTRAINT "expense_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");



ALTER TABLE ONLY "public"."expense_trip_settlements"
    ADD CONSTRAINT "expense_trip_settlements_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."expense_trip_settlements"
    ADD CONSTRAINT "expense_trip_settlements_settled_by_fkey" FOREIGN KEY ("settled_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."expense_trip_settlements"
    ADD CONSTRAINT "expense_trip_settlements_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_advance_id_fkey" FOREIGN KEY ("advance_id") REFERENCES "public"."expense_advances"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_cargo_type_id_fkey" FOREIGN KEY ("cargo_type_id") REFERENCES "public"."cargo_types"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "public"."expense_subcategories"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."measurement_units"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_fuel_tank_movement_id_fkey" FOREIGN KEY ("fuel_tank_movement_id") REFERENCES "public"."fuel_tank_movements"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_supervised_by_fkey" FOREIGN KEY ("supervised_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."fuel_loads"
    ADD CONSTRAINT "fuel_loads_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id");



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id");



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_fuel_load_id_fkey" FOREIGN KEY ("fuel_load_id") REFERENCES "public"."fuel_loads"("id");



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_tank_id_fkey" FOREIGN KEY ("tank_id") REFERENCES "public"."fuel_tanks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."fuel_tank_movements"
    ADD CONSTRAINT "fuel_tank_movements_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id");



ALTER TABLE ONLY "public"."hr_applicants"
    ADD CONSTRAINT "hr_applicants_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."hr_attendance"
    ADD CONSTRAINT "hr_attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance_records"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_records"
    ADD CONSTRAINT "maintenance_records_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_records"
    ADD CONSTRAINT "maintenance_records_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mobile_chat_logs"
    ADD CONSTRAINT "mobile_chat_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."mobile_chat_logs"
    ADD CONSTRAINT "mobile_chat_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."mobile_chat_logs"
    ADD CONSTRAINT "mobile_chat_logs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."mobile_chat_logs"
    ADD CONSTRAINT "mobile_chat_logs_unit_assembly_id_fkey" FOREIGN KEY ("unit_assembly_id") REFERENCES "public"."unit_assemblies"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles_permissions"
    ADD CONSTRAINT "roles_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles_permissions"
    ADD CONSTRAINT "roles_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trailer_models"
    ADD CONSTRAINT "trailer_models_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."trailer_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trailers"
    ADD CONSTRAINT "trailers_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trailers"
    ADD CONSTRAINT "trailers_trailer_model_id_fkey" FOREIGN KEY ("trailer_model_id") REFERENCES "public"."trailer_models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_client_entries"
    ADD CONSTRAINT "trip_client_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."trip_client_entries"
    ADD CONSTRAINT "trip_client_entries_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_events"
    ADD CONSTRAINT "trip_events_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_fuel_metrics"
    ADD CONSTRAINT "trip_fuel_metrics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."trip_fuel_metrics"
    ADD CONSTRAINT "trip_fuel_metrics_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_stops"
    ADD CONSTRAINT "trip_stops_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_tracking_logs"
    ADD CONSTRAINT "trip_tracking_logs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_linked_trip_id_fkey" FOREIGN KEY ("linked_trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_monitored_by_fkey" FOREIGN KEY ("monitored_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_unit_assembly_id_fkey" FOREIGN KEY ("unit_assembly_id") REFERENCES "public"."unit_assemblies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trucks"
    ADD CONSTRAINT "trucks_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_client_pool_id_fkey" FOREIGN KEY ("client_pool_id") REFERENCES "public"."client_pools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id");



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_trailer2_id_fkey" FOREIGN KEY ("trailer2_id") REFERENCES "public"."trailers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id");



ALTER TABLE ONLY "public"."unit_assemblies"
    ADD CONSTRAINT "unit_assemblies_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id");



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_trailer2_id_fkey" FOREIGN KEY ("trailer2_id") REFERENCES "public"."trailers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."unit_assembly_logs"
    ADD CONSTRAINT "unit_assembly_logs_unit_id_fkey" FOREIGN KEY ("unit_assembly_id") REFERENCES "public"."unit_assemblies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walmart_trip_data"
    ADD CONSTRAINT "walmart_trip_data_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_order_parts"
    ADD CONSTRAINT "work_order_parts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."work_order_parts"
    ADD CONSTRAINT "work_order_parts_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id");



ALTER TABLE ONLY "public"."work_order_parts"
    ADD CONSTRAINT "work_order_parts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."maintenance_providers"("id");



ALTER TABLE ONLY "public"."work_order_parts"
    ADD CONSTRAINT "work_order_parts_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."measurement_units"("id");



ALTER TABLE ONLY "public"."work_order_parts"
    ADD CONSTRAINT "work_order_parts_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."workshop_work_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_delivered_by_employee_id_fkey" FOREIGN KEY ("delivered_by_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_last_trip_id_fkey" FOREIGN KEY ("last_trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_picked_up_by_employee_id_fkey" FOREIGN KEY ("picked_up_by_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "public"."trailers"("id");



ALTER TABLE ONLY "public"."workshop_stays"
    ADD CONSTRAINT "workshop_stays_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_maintenance_type_id_fkey" FOREIGN KEY ("maintenance_type_id") REFERENCES "public"."maintenance_types"("id");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_mechanical_category_id_fkey" FOREIGN KEY ("mechanical_category_id") REFERENCES "public"."mechanical_categories"("id");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_specialist_employee_id_fkey" FOREIGN KEY ("specialist_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "public"."workshop_stays"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workshop_work_orders"
    ADD CONSTRAINT "workshop_work_orders_supervisor_profile_id_fkey" FOREIGN KEY ("supervisor_profile_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Enable CRUD for authenticated users" ON "public"."trips" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."cargo_types" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."client_pools" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."client_requirements" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."clients" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."company_profile" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."customer_billing_assignment" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."departments" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."documents" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."driver_details" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."driver_rest_periods" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."employees" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."expense_categories" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."expense_subcategories" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."expenses" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."fuel_loads" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."fuel_tank_movements" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."fuel_tanks" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."hr_applicants" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."hr_attendance" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."inventory_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."inventory_movements" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."maintenance_records" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."measurement_units" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."permissions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."profiles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."profiles_roles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."roles" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."roles_permissions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trailer_categories" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trailer_models" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trailers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trip_client_entries" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trip_events" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trip_fuel_metrics" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trip_stops" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trip_tracking_logs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trips" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."trucks" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."unit_assemblies" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."unit_assembly_logs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."walmart_stores" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Full access for authenticated users" ON "public"."walmart_trip_data" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."cargo_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_pools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_billing_assignment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."driver_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."driver_rest_periods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_advances" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "expense_advances_authenticated_all" ON "public"."expense_advances" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_subcategories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_trip_settlements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "expense_trip_settlements_authenticated_all" ON "public"."expense_trip_settlements" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fuel_loads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fuel_tank_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fuel_tanks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hr_applicants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hr_attendance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_providers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "maintenance_providers_auth_all" ON "public"."maintenance_providers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "maintenance_providers_authenticated_all" ON "public"."maintenance_providers" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."maintenance_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "maintenance_types_auth_all" ON "public"."maintenance_types" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "maintenance_types_authenticated_all" ON "public"."maintenance_types" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."measurement_units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mechanical_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mechanical_categories_auth_all" ON "public"."mechanical_categories" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "mechanical_categories_authenticated_all" ON "public"."mechanical_categories" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."mobile_chat_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trailer_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trailer_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trailers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_client_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_fuel_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_stops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_tracking_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trucks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."unit_assemblies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."unit_assembly_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."walmart_stores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."walmart_trip_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_order_parts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "work_order_parts_auth_all" ON "public"."work_order_parts" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "work_order_parts_authenticated_all" ON "public"."work_order_parts" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."workshop_stays" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workshop_stays_auth_all" ON "public"."workshop_stays" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "workshop_stays_authenticated_all" ON "public"."workshop_stays" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."workshop_work_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workshop_work_orders_auth_all" ON "public"."workshop_work_orders" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "workshop_work_orders_authenticated_all" ON "public"."workshop_work_orders" TO "authenticated" USING (true) WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."create_user_admin"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_role_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_admin"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_role_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_admin"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_role_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_admin"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_admin"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_admin"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."expenses_compute_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."expenses_compute_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expenses_compute_amount"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expenses_validate_diesel_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."expenses_validate_diesel_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expenses_validate_diesel_unit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_users_with_roles"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_users_with_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_with_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_trip_odometer_from_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_trip_odometer_from_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_trip_odometer_from_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_unit_status_from_trip"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_unit_status_from_trip"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_unit_status_from_trip"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."work_order_parts_compute_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."work_order_parts_compute_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."work_order_parts_compute_total"() TO "service_role";


















GRANT ALL ON TABLE "public"."cargo_types" TO "anon";
GRANT ALL ON TABLE "public"."cargo_types" TO "authenticated";
GRANT ALL ON TABLE "public"."cargo_types" TO "service_role";



GRANT ALL ON TABLE "public"."client_pools" TO "anon";
GRANT ALL ON TABLE "public"."client_pools" TO "authenticated";
GRANT ALL ON TABLE "public"."client_pools" TO "service_role";



GRANT ALL ON TABLE "public"."client_requirements" TO "anon";
GRANT ALL ON TABLE "public"."client_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."client_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."company_profile" TO "anon";
GRANT ALL ON TABLE "public"."company_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."company_profile" TO "service_role";



GRANT ALL ON TABLE "public"."customer_billing_assignment" TO "anon";
GRANT ALL ON TABLE "public"."customer_billing_assignment" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_billing_assignment" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."driver_details" TO "anon";
GRANT ALL ON TABLE "public"."driver_details" TO "authenticated";
GRANT ALL ON TABLE "public"."driver_details" TO "service_role";



GRANT ALL ON TABLE "public"."driver_rest_periods" TO "anon";
GRANT ALL ON TABLE "public"."driver_rest_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."driver_rest_periods" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."expense_advances" TO "anon";
GRANT ALL ON TABLE "public"."expense_advances" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_advances" TO "service_role";



GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";



GRANT ALL ON TABLE "public"."expense_subcategories" TO "anon";
GRANT ALL ON TABLE "public"."expense_subcategories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_subcategories" TO "service_role";



GRANT ALL ON TABLE "public"."expense_trip_settlements" TO "anon";
GRANT ALL ON TABLE "public"."expense_trip_settlements" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_trip_settlements" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."fuel_loads" TO "anon";
GRANT ALL ON TABLE "public"."fuel_loads" TO "authenticated";
GRANT ALL ON TABLE "public"."fuel_loads" TO "service_role";



GRANT ALL ON TABLE "public"."fuel_tank_movements" TO "anon";
GRANT ALL ON TABLE "public"."fuel_tank_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."fuel_tank_movements" TO "service_role";



GRANT ALL ON TABLE "public"."fuel_tanks" TO "anon";
GRANT ALL ON TABLE "public"."fuel_tanks" TO "authenticated";
GRANT ALL ON TABLE "public"."fuel_tanks" TO "service_role";



GRANT ALL ON TABLE "public"."gastos_operativos_detalle" TO "anon";
GRANT ALL ON TABLE "public"."gastos_operativos_detalle" TO "authenticated";
GRANT ALL ON TABLE "public"."gastos_operativos_detalle" TO "service_role";



GRANT ALL ON TABLE "public"."hr_applicants" TO "anon";
GRANT ALL ON TABLE "public"."hr_applicants" TO "authenticated";
GRANT ALL ON TABLE "public"."hr_applicants" TO "service_role";



GRANT ALL ON TABLE "public"."hr_attendance" TO "anon";
GRANT ALL ON TABLE "public"."hr_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."hr_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_movements" TO "anon";
GRANT ALL ON TABLE "public"."inventory_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_movements" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_providers" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_providers" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_records" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_records" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_records" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_types" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_types" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_types" TO "service_role";



GRANT ALL ON TABLE "public"."measurement_units" TO "anon";
GRANT ALL ON TABLE "public"."measurement_units" TO "authenticated";
GRANT ALL ON TABLE "public"."measurement_units" TO "service_role";



GRANT ALL ON TABLE "public"."mechanical_categories" TO "anon";
GRANT ALL ON TABLE "public"."mechanical_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."mechanical_categories" TO "service_role";



GRANT ALL ON TABLE "public"."mobile_chat_logs" TO "anon";
GRANT ALL ON TABLE "public"."mobile_chat_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."mobile_chat_logs" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles_roles" TO "anon";
GRANT ALL ON TABLE "public"."profiles_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_roles" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."roles_permissions" TO "anon";
GRANT ALL ON TABLE "public"."roles_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."roles_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."trailer_categories" TO "anon";
GRANT ALL ON TABLE "public"."trailer_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."trailer_categories" TO "service_role";



GRANT ALL ON TABLE "public"."trailer_models" TO "anon";
GRANT ALL ON TABLE "public"."trailer_models" TO "authenticated";
GRANT ALL ON TABLE "public"."trailer_models" TO "service_role";



GRANT ALL ON TABLE "public"."trailers" TO "anon";
GRANT ALL ON TABLE "public"."trailers" TO "authenticated";
GRANT ALL ON TABLE "public"."trailers" TO "service_role";



GRANT ALL ON TABLE "public"."trip_client_entries" TO "anon";
GRANT ALL ON TABLE "public"."trip_client_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_client_entries" TO "service_role";



GRANT ALL ON TABLE "public"."trip_events" TO "anon";
GRANT ALL ON TABLE "public"."trip_events" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trips_trip_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trips_trip_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trips_trip_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON TABLE "public"."trip_expense_assignment_kpis" TO "anon";
GRANT ALL ON TABLE "public"."trip_expense_assignment_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_expense_assignment_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."trip_fuel_metrics" TO "anon";
GRANT ALL ON TABLE "public"."trip_fuel_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_fuel_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."trip_rentabilidad" TO "anon";
GRANT ALL ON TABLE "public"."trip_rentabilidad" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_rentabilidad" TO "service_role";



GRANT ALL ON TABLE "public"."trip_stops" TO "anon";
GRANT ALL ON TABLE "public"."trip_stops" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_stops" TO "service_role";



GRANT ALL ON TABLE "public"."trip_tracking_logs" TO "anon";
GRANT ALL ON TABLE "public"."trip_tracking_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_tracking_logs" TO "service_role";



GRANT ALL ON TABLE "public"."trucks" TO "anon";
GRANT ALL ON TABLE "public"."trucks" TO "authenticated";
GRANT ALL ON TABLE "public"."trucks" TO "service_role";



GRANT ALL ON TABLE "public"."unit_assemblies" TO "anon";
GRANT ALL ON TABLE "public"."unit_assemblies" TO "authenticated";
GRANT ALL ON TABLE "public"."unit_assemblies" TO "service_role";



GRANT ALL ON TABLE "public"."unit_assembly_logs" TO "anon";
GRANT ALL ON TABLE "public"."unit_assembly_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."unit_assembly_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_accounts" TO "anon";
GRANT ALL ON TABLE "public"."user_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."walmart_stores" TO "anon";
GRANT ALL ON TABLE "public"."walmart_stores" TO "authenticated";
GRANT ALL ON TABLE "public"."walmart_stores" TO "service_role";



GRANT ALL ON TABLE "public"."walmart_trip_data" TO "anon";
GRANT ALL ON TABLE "public"."walmart_trip_data" TO "authenticated";
GRANT ALL ON TABLE "public"."walmart_trip_data" TO "service_role";



GRANT ALL ON TABLE "public"."work_order_parts" TO "anon";
GRANT ALL ON TABLE "public"."work_order_parts" TO "authenticated";
GRANT ALL ON TABLE "public"."work_order_parts" TO "service_role";



GRANT ALL ON TABLE "public"."workshop_stays" TO "anon";
GRANT ALL ON TABLE "public"."workshop_stays" TO "authenticated";
GRANT ALL ON TABLE "public"."workshop_stays" TO "service_role";



GRANT ALL ON TABLE "public"."workshop_work_orders" TO "anon";
GRANT ALL ON TABLE "public"."workshop_work_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."workshop_work_orders" TO "service_role";



GRANT ALL ON TABLE "public"."workshop_stays_kpis" TO "anon";
GRANT ALL ON TABLE "public"."workshop_stays_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."workshop_stays_kpis" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";


