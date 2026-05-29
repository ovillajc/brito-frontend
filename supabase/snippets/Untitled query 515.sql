-- 1. Habilitar RLS en las tablas del chat
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_chat_logs ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar las politicas en caso de que existan previamente para evitar errores
DROP POLICY IF EXISTS "Allow all operations for authenticated users on chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on chat_participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on mobile_chat_logs" ON public.mobile_chat_logs;

-- 3. Crear politicas que permiten TODO a los usuarios autenticados
CREATE POLICY "Allow all operations for authenticated users on chat_conversations" 
ON public.chat_conversations 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on chat_messages" 
ON public.chat_messages 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on chat_participants" 
ON public.chat_participants 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on mobile_chat_logs" 
ON public.mobile_chat_logs 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);
