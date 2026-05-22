import { createClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase con el Service Role Key.
 * ATENCIÓN: Este cliente tiene privilegios de administrador que evaden RLS.
 * ÚSALO SOLO en Server Components o Server Actions, NUNCA en el cliente.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('SUPABASE_URL is missing')
  }
  const adminKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY
  if (!adminKey) {
    throw new Error('SUPABASE_SECRET_KEY is missing in environment variables.')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    adminKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
