import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    console.error("Supabase configuration missing:", !url ? "SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Supabase admin environment variables are not configured.");
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');
  } catch {
    console.error('Supabase configuration invalid: SUPABASE_URL must be an HTTP URL');
    throw new Error('Supabase URL is invalid.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
