import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ihtaoeyatyldqqkqmmvk.supabase.co" || "";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodGFvZXlhdHlsZHFxa3FtbXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NjY1NTQsImV4cCI6MjA1ODA0MjU1NH0.DISk5lFOW99Duz4f8WMsUlh22swGCO6VtbybzvE2DCo" ||
  "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
