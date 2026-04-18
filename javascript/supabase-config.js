// ─── Supabase Configuration ───────────────────────────────────────────────────
// Replace these placeholder values with your actual Supabase project credentials.
// Find them at: https://supabase.com/dashboard → your project → Settings → API
//
// IMPORTANT: The anon key is safe to use in client-side code — it is intentionally
// public. Security comes from Row Level Security (RLS) policies in your Supabase
// dashboard, not by hiding this key. Never put your SERVICE ROLE key here.

const SUPABASE_URL  = 'YOUR_SUPABASE_URL';   // e.g. https://xyzabc.supabase.co
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';

// Detect whether real credentials have been configured
const SUPABASE_CONFIGURED =
  SUPABASE_URL  !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON !== 'YOUR_SUPABASE_ANON_KEY';

// Expose the client on window so all page scripts can access it
// home.js checks `window.supabaseClient` before fetching products
// auth.js checks `window.supabaseClient` before using Supabase Auth
window.supabaseClient = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;
