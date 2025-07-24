import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""

export const db = createClient(supabaseUrl, supabaseAnonKey)