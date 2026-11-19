import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function buildClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    console.error(
      "Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (local .env.local or Netlify environment variables)."
    );
    return null;
  }

  try {
    return createClient(supabaseUrl, supabasePublishableKey);
  } catch (error) {
    console.error("Supabase client could not be created. Check the configured URL and key.", error);
    return null;
  }
}

// null when configuration is missing or invalid. Check `supabaseConfigured`
// before using it so the site can show a friendly message instead of crashing.
export const supabase = buildClient();
export const supabaseConfigured = supabase !== null;
