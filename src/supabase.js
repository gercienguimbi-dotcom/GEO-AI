import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xojdlpxyikajwnqtpxoy.supabase.co',
  'TA_CLE_ANON'
)