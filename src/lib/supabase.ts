import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type User = {
  id: string
  email: string
  user_metadata: {
    username?: string
  }
  created_at: string
}