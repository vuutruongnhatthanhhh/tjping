export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";
export const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL || "#";
