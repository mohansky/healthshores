/// <reference types="astro/client" />

// Worker runtime bindings available via `Astro.locals.runtime.env`.
// Secrets: `wrangler secret put <NAME>` (prod) or `.dev.vars` (local dev).
// Plain vars: the "vars" block in wrangler.jsonc.
interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  /** Comma-separated list of recipients */
  RESEND_TO_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
