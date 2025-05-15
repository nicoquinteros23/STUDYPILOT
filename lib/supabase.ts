import { createClient } from "@supabase/supabase-js"

// Crear un cliente singleton para evitar múltiples instancias
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el lado del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el lado del servidor con rol de servicio
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}
