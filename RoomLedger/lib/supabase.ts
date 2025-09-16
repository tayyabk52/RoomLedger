import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Room {
  id: string
  name: string
  code: string
  currency: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string
}

export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  is_active: boolean
  user?: User
  room?: Room
}

export interface Bill {
  id: string
  room_id: string
  title: string
  description?: string
  total_amount: number
  currency: string
  created_by: string
  created_at: string
  updated_at: string
  is_settled: boolean
  settled_at?: string
  created_by_username?: string
  total_paid?: number
  remaining_amount?: number
  participant_count?: number
}

export interface BillParticipant {
  id: string
  bill_id: string
  user_id: string
  share_amount: number
  created_at: string
  user?: User
}

export interface Payment {
  id: string
  bill_id: string
  payer_id: string
  amount: number
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
  payer?: User
}

export interface UserBalance {
  room_id: string
  user_id: string
  username: string
  room_name: string
  balance: number
  currency: string
}

export interface Settlement {
  id: string
  room_id: string
  from_user_id: string
  to_user_id: string
  amount: number
  currency: string
  notes?: string
  created_at: string
  is_confirmed: boolean
  confirmed_at?: string
  from_user?: User
  to_user?: User
}