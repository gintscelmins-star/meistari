import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return clientInstance
}

export function getSupabaseServer() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? supabaseAnonKey
  return createClient<Database>(supabaseUrl, serviceKey)
}

export type DarbaTips = Database['public']['Tables']['darba_tipi']['Row']
export type Regions = Database['public']['Tables']['regioni']['Row']
export type Meistars = Database['public']['Tables']['meistari']['Row']
export type Pakalpojums = Database['public']['Tables']['pakalpojumi']['Row']
export type Atsauksme = Database['public']['Tables']['atsauksmes']['Row']
export type Booking = Database['public']['Tables']['booking']['Row']
