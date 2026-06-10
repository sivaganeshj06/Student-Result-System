import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://apxwbovjgeddqjwuxuaw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdib3ZqZ2VkZHFqd3V4dWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjY0NjMsImV4cCI6MjA5NjU0MjQ2M30.48c8ddJrI6i11C00_Ge6MELLcdXYp70BwZG8KYCoaks"
);
