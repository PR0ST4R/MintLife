/* ===========================================================
   supabase.js — Supabase client config
   ===========================================================
   SETUP:
   1. Go to https://supabase.com and create a free project
   2. Go to Project Settings → API
   3. Copy your Project URL and anon/public key into the
      two constants below
   4. Run the SQL in schema.sql in your Supabase SQL editor
   =========================================================== */

const SUPABASE_URL  = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON = "YOUR_SUPABASE_ANON_KEY";

// tiny fetch-based Supabase client (no npm needed)
const DB = (() => {
  const headers = () => ({
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON,
    "Authorization": `Bearer ${SUPABASE_ANON}`,
    "Prefer": "return=representation"
  });

  async function from(table) {
    return {
      async select(filter = "") {
        const url = `${SUPABASE_URL}/rest/v1/${table}${filter ? "?" + filter : ""}`;
        const r = await fetch(url, { headers: headers() });
        return r.ok ? r.json() : [];
      },
      async upsert(data) {
        const url = `${SUPABASE_URL}/rest/v1/${table}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { ...headers(), "Prefer": "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify(data)
        });
        return r.ok ? r.json() : null;
      },
      async update(data, filter) {
        const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}`;
        const r = await fetch(url, {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify(data)
        });
        return r.ok;
      },
      async delete(filter) {
        const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}`;
        const r = await fetch(url, { method: "DELETE", headers: headers() });
        return r.ok;
      }
    };
  }

  return { from };
})();
