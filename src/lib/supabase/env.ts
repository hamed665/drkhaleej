export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServiceRoleEnv = {
  url: string;
  serviceRoleKey: string;
};

type SupabaseEnvName = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY';

function readTrimmedEnv(name: SupabaseEnvName): string {
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

function getRequiredSupabaseUrl(): string {
  const url = readTrimmedEnv('NEXT_PUBLIC_SUPABASE_URL');

  if (!url) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL is required.');
  }

  assertValidSupabaseUrl(url);

  return url;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = getRequiredSupabaseUrl();
  const anonKey = readTrimmedEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!anonKey) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
  }

  return {
    url,
    anonKey
  };
}

export function getSupabaseServiceRoleEnv(): SupabaseServiceRoleEnv {
  const url = getRequiredSupabaseUrl();
  const serviceRoleKey = readTrimmedEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!serviceRoleKey) {
    throw new Error('Supabase configuration error: SUPABASE_SERVICE_ROLE_KEY is required for trusted server-side Supabase access.');
  }

  return {
    url,
    serviceRoleKey
  };
}
