# DrKhaleej Preview Runtime Boundary

This boundary is server-only and preview-only.

It resolves `VERCEL_ENV`, validates the Supabase URL and service-role key, parses explicit actor and canary-entity allowlists, and constructs a non-persistent Supabase client only when every prerequisite is valid.

Execution remains hard-disabled through `IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED = false`.

The guarded RPC client returns a closed disabled response while the hard flag is false. It does not execute reservation RPCs, persist terminal results, mutate imported entities, change visibility, change index policy, change sitemap policy, or allow bulk publishing.

Secrets are never returned or logged. Production, development, missing secrets, invalid URLs, and empty allowlists fail closed before client construction.
