// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cwewsfuswiiliritikvh.supabase.co'
const SUPABASE_KEY = 'sb_publishable_qIHIRr47iAqiYoTn9aQIuQ_qteCIHk0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
