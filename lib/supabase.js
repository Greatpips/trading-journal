import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhyuqiifhblerprvpado.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoeXVxaWlmaGJsZXJwcnZwYWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDUyMjgsImV4cCI6MjA5OTYyMTIyOH0.BmDUR0qPTI54XAREBoI_6Ew3QWluiBODyNHF4w6op3k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);