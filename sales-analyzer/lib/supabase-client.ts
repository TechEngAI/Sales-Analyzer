import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SalesRecord = {
  id: string
  user_id: string
  date: Date
  amount: number
  product: string
  region: string
  customer: string
  margin: number
  created_at: Date
}

export type UserProfile = {
  id: string
  email: string
  full_name: string
  company: string
  created_at: Date
}