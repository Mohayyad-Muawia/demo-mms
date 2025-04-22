import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabaseRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseRoleKey) {
  throw new Error("Supabase environment variables are missing!");
}

 export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseRoleKey)

