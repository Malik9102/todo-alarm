import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vomouomctioarhuduibs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbW91b21jdGlvYXJodWR1aWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDAzOTYsImV4cCI6MjA5ODQxNjM5Nn0.faoi25WmRtyfEXnWU2PYTgFeRwClimUVqbevD-WNd3Y'

export const supabase = createClient(supabaseUrl, supabaseKey)