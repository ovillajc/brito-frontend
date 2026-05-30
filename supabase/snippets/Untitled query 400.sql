-- Migration: Persistent Chat History Schema
-- Feature: 001-persistent-chat-history

-- Enumerations
CREATE TYPE public.chat_conversation_type AS ENUM (
  'direct_assistant',
  'support',
  'trip_context'
);

CREATE TYPE public.chat_conversation_status AS ENUM (
  'active',
  'archived',
  'closed'
);

CREATE TYPE public.chat_participant_role AS ENUM (
  'user',
  'assistant',
  'admin',
  'system'
);

CREATE TYPE public.chat_message_kind AS ENUM (
  'text',
  'image',
  'audio',
  'file',
  'system'
);

CREATE TYPE public.chat_message_status AS ENUM (
  'sent',
  'delivered',
  'read',
  'failed'
);

-- Tables
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_type public.chat_conversation_type NOT NULL DEFAULT 'direct_assistant',
  channel text NOT NULL DEFAULT 'mobile',
  status public.chat_conversation_status NOT NULL DEFAULT 'active',
  subject text,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE public.chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  participant_role public.chat_participant_role NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_role public.chat_participant_role NOT NULL,
  sender_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_from_ai boolean NOT NULL DEFAULT false,
  message_kind public.chat_message_kind NOT NULL DEFAULT 'text',
  body text,
  media_url text,
  mime_type text,
  reply_to_message_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  message_status public.chat_message_status NOT NULL DEFAULT 'sent',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  extracted_payload jsonb,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  unit_assembly_id uuid REFERENCES public.unit_assemblies(id) ON DELETE SET NULL,
  operator_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  deleted_at timestamptz,
  CONSTRAINT chat_messages_content_check CHECK (
    body IS NOT NULL OR media_url IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_chat_conversations_owner_profile
  ON public.chat_conversations(owner_profile_id, status, last_message_at DESC);

CREATE INDEX idx_chat_messages_conversation_created
  ON public.chat_messages(conversation_id, created_at DESC);

CREATE INDEX idx_chat_messages_trip_id
  ON public.chat_messages(trip_id);

CREATE INDEX idx_chat_messages_operator_id
  ON public.chat_messages(operator_id);

CREATE UNIQUE INDEX uq_chat_active_direct_assistant
  ON public.chat_conversations(owner_profile_id, conversation_type, channel)
  WHERE status = 'active' AND conversation_type = 'direct_assistant';

-- Row Level Security (RLS)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies: chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (owner_profile_id = auth.uid());

CREATE POLICY "Users can insert their own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (owner_profile_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (owner_profile_id = auth.uid());

-- Policies: chat_participants
CREATE POLICY "Users can view participants of their conversations"
  ON public.chat_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE owner_profile_id = auth.uid()
    )
  );

-- Note: Participants insertion usually handled by backend service_role or functions

-- Policies: chat_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE owner_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages into their conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_profile_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE owner_profile_id = auth.uid()
    )
  );
