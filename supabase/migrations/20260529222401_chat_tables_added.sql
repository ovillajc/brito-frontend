create type "public"."chat_conversation_status" as enum ('active', 'archived', 'closed');

create type "public"."chat_conversation_type" as enum ('direct_assistant', 'support', 'trip_context');

create type "public"."chat_message_kind" as enum ('text', 'image', 'audio', 'file', 'system');

create type "public"."chat_message_status" as enum ('sent', 'delivered', 'read', 'failed');

create type "public"."chat_participant_role" as enum ('user', 'assistant', 'admin', 'system');


  create table "public"."chat_conversations" (
    "id" uuid not null default gen_random_uuid(),
    "owner_profile_id" uuid not null,
    "conversation_type" public.chat_conversation_type not null default 'direct_assistant'::public.chat_conversation_type,
    "channel" text not null default 'mobile'::text,
    "status" public.chat_conversation_status not null default 'active'::public.chat_conversation_status,
    "subject" text,
    "last_message_at" timestamp with time zone,
    "last_message_preview" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "archived_at" timestamp with time zone
      );


alter table "public"."chat_conversations" enable row level security;


  create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "sender_role" public.chat_participant_role not null,
    "sender_profile_id" uuid,
    "is_from_ai" boolean not null default false,
    "message_kind" public.chat_message_kind not null default 'text'::public.chat_message_kind,
    "body" text,
    "media_url" text,
    "mime_type" text,
    "reply_to_message_id" uuid,
    "message_status" public.chat_message_status not null default 'sent'::public.chat_message_status,
    "metadata" jsonb not null default '{}'::jsonb,
    "extracted_payload" jsonb,
    "trip_id" uuid,
    "unit_assembly_id" uuid,
    "operator_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "processed_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
      );


alter table "public"."chat_messages" enable row level security;


  create table "public"."chat_participants" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "participant_role" public.chat_participant_role not null,
    "profile_id" uuid,
    "display_name" text,
    "is_active" boolean not null default true,
    "joined_at" timestamp with time zone not null default now(),
    "last_read_at" timestamp with time zone
      );


alter table "public"."chat_participants" enable row level security;

CREATE UNIQUE INDEX chat_conversations_pkey ON public.chat_conversations USING btree (id);

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_participants_pkey ON public.chat_participants USING btree (id);

CREATE INDEX idx_chat_conversations_owner_profile ON public.chat_conversations USING btree (owner_profile_id, status, last_message_at DESC);

CREATE INDEX idx_chat_messages_conversation_created ON public.chat_messages USING btree (conversation_id, created_at DESC);

CREATE INDEX idx_chat_messages_operator_id ON public.chat_messages USING btree (operator_id);

CREATE INDEX idx_chat_messages_trip_id ON public.chat_messages USING btree (trip_id);

CREATE UNIQUE INDEX uq_chat_active_direct_assistant ON public.chat_conversations USING btree (owner_profile_id, conversation_type, channel) WHERE ((status = 'active'::public.chat_conversation_status) AND (conversation_type = 'direct_assistant'::public.chat_conversation_type));

alter table "public"."chat_conversations" add constraint "chat_conversations_pkey" PRIMARY KEY using index "chat_conversations_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_participants" add constraint "chat_participants_pkey" PRIMARY KEY using index "chat_participants_pkey";

alter table "public"."chat_conversations" add constraint "chat_conversations_owner_profile_id_fkey" FOREIGN KEY (owner_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_conversations" validate constraint "chat_conversations_owner_profile_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_content_check" CHECK (((body IS NOT NULL) OR (media_url IS NOT NULL))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_content_check";

alter table "public"."chat_messages" add constraint "chat_messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_conversation_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_operator_id_fkey" FOREIGN KEY (operator_id) REFERENCES public.employees(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_operator_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_reply_to_message_id_fkey" FOREIGN KEY (reply_to_message_id) REFERENCES public.chat_messages(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_reply_to_message_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_sender_profile_id_fkey" FOREIGN KEY (sender_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_sender_profile_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_trip_id_fkey" FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_trip_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_unit_assembly_id_fkey" FOREIGN KEY (unit_assembly_id) REFERENCES public.unit_assemblies(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_unit_assembly_id_fkey";

alter table "public"."chat_participants" add constraint "chat_participants_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE not valid;

alter table "public"."chat_participants" validate constraint "chat_participants_conversation_id_fkey";

alter table "public"."chat_participants" add constraint "chat_participants_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_participants" validate constraint "chat_participants_profile_id_fkey";

grant delete on table "public"."chat_conversations" to "anon";

grant insert on table "public"."chat_conversations" to "anon";

grant references on table "public"."chat_conversations" to "anon";

grant select on table "public"."chat_conversations" to "anon";

grant trigger on table "public"."chat_conversations" to "anon";

grant truncate on table "public"."chat_conversations" to "anon";

grant update on table "public"."chat_conversations" to "anon";

grant delete on table "public"."chat_conversations" to "authenticated";

grant insert on table "public"."chat_conversations" to "authenticated";

grant references on table "public"."chat_conversations" to "authenticated";

grant select on table "public"."chat_conversations" to "authenticated";

grant trigger on table "public"."chat_conversations" to "authenticated";

grant truncate on table "public"."chat_conversations" to "authenticated";

grant update on table "public"."chat_conversations" to "authenticated";

grant delete on table "public"."chat_conversations" to "service_role";

grant insert on table "public"."chat_conversations" to "service_role";

grant references on table "public"."chat_conversations" to "service_role";

grant select on table "public"."chat_conversations" to "service_role";

grant trigger on table "public"."chat_conversations" to "service_role";

grant truncate on table "public"."chat_conversations" to "service_role";

grant update on table "public"."chat_conversations" to "service_role";

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."chat_participants" to "anon";

grant insert on table "public"."chat_participants" to "anon";

grant references on table "public"."chat_participants" to "anon";

grant select on table "public"."chat_participants" to "anon";

grant trigger on table "public"."chat_participants" to "anon";

grant truncate on table "public"."chat_participants" to "anon";

grant update on table "public"."chat_participants" to "anon";

grant delete on table "public"."chat_participants" to "authenticated";

grant insert on table "public"."chat_participants" to "authenticated";

grant references on table "public"."chat_participants" to "authenticated";

grant select on table "public"."chat_participants" to "authenticated";

grant trigger on table "public"."chat_participants" to "authenticated";

grant truncate on table "public"."chat_participants" to "authenticated";

grant update on table "public"."chat_participants" to "authenticated";

grant delete on table "public"."chat_participants" to "service_role";

grant insert on table "public"."chat_participants" to "service_role";

grant references on table "public"."chat_participants" to "service_role";

grant select on table "public"."chat_participants" to "service_role";

grant trigger on table "public"."chat_participants" to "service_role";

grant truncate on table "public"."chat_participants" to "service_role";

grant update on table "public"."chat_participants" to "service_role";


  create policy "Allow all operations for authenticated users on chat_conversati"
  on "public"."chat_conversations"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow all operations for authenticated users on chat_messages"
  on "public"."chat_messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow all operations for authenticated users on chat_participan"
  on "public"."chat_participants"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow all operations for authenticated users on mobile_chat_log"
  on "public"."mobile_chat_logs"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



