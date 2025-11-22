import { createClient } from "@supabase/supabase-js";

/**
 * Use Vite env vars (import.meta.env) in the browser.
 * Support both VITE_SUPABASE_ANON_KEY and VITE_SUPABASE_PUBLISHABLE_KEY as the anon key.
 */
const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";

const supabaseKey =
  (typeof import.meta !== "undefined" && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  "";

/* Create real client only when both values exist; otherwise export a safe stub. */
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Do not throw at module load — warn and provide a stub to avoid app crash.
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase not fully configured. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) are set in .env and restart the dev server."
  );

  const makeError = (msg) => async () => ({ data: null, error: new Error(msg) });

  supabase = {
    from: () => ({
      insert: makeError("Supabase not configured"),
      select: makeError("Supabase not configured"),
      update: makeError("Supabase not configured"),
      delete: makeError("Supabase not configured"),
    }),
    auth: {
      signIn: makeError("Supabase not configured"),
      signOut: makeError("Supabase not configured"),
    },
  };
}

export { supabase };