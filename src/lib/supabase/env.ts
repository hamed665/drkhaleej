export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

function readTrimmedEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  return (process.env[name] ?? '').trim();
}

function assertValidSupabaseUrl(value: string): void {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL must be a valid URL.');
  }

  if (!parsedUrl.protocol || (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:')) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL must use http or https.');
  }
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = readTrimmedEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readTrimmedEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL is required.');
  }

  if (!anonKey) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
  }

  assertValidSupabaseUrl(url);

  return {
    url,
    anonKey
  };
}
