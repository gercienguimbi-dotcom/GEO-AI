import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xojdlpxyikajwnqtpoy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvamRscHh5aWthanducXRweG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzAyNzUsImV4cCI6MjA4OTEwNjI3NX0.-n3Rsy20QS_YKcaXhWL6zmSNbwrfsPUF2wgyOPjTCc'
)