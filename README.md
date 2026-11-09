# HealthShores

Marketing site for HealthShores, a Bengaluru-based medical tourism facilitator. Live at **https://www.healthshores.com**.

Built with Astro 5 + Tailwind CSS 4, deployed as a Cloudflare Worker (static pages served as assets; `/api/contact` runs on demand).

## Commands

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Local dev server at `localhost:4321` |
| `pnpm build` | Build to `./dist/` |
| `pnpm preview` | Preview the build locally |
| `pnpm build && npx wrangler deploy` | Deploy to Cloudflare |

## Editing content

Most text lives in content files, not components:

| What | Where |
| :--- | :--- |
| Business name, email, phone, address, nav, social links | `src/content/global/site.yaml` |
| Homepage sections (hero, about, services, process, testimonials) | `src/content/sections/homepage.yaml` |
| Blog posts | `src/content/blog/*.mdx` |
| Privacy Policy / Terms / Medical Disclaimer | `src/pages/privacy.astro`, `terms.astro`, `disclaimer.astro` |

Hidden for now (re-enable when ready):
- **Testimonials**: uncomment `<Testimonials />` in `src/pages/index.astro` and the nav entry in `site.yaml`. Replace the placeholder entries in `homepage.yaml` with real ones first.
- **Social links**: uncomment the `social:` block in `site.yaml`.

## Configuration

**Build-time** (`.env.local`, gitignored):

| Variable | Purpose |
| :--- | :--- |
| `SITE_URL` | Canonical origin for sitemap/canonical tags. Defaults to `https://www.healthshores.com` |
| `PUBLIC_GTM_ID` | Google Tag Manager container ID. Empty = GTM not loaded |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key for the contact form. Empty = widget not shown |

**Runtime** (read in `src/pages/api/contact.ts` via `locals.runtime.env`):

| Variable | Where it's set |
| :--- | :--- |
| `RESEND_API_KEY` | Secret: `npx wrangler secret put RESEND_API_KEY` |
| `TURNSTILE_SECRET_KEY` | Secret: `npx wrangler secret put TURNSTILE_SECRET_KEY` (enables server-side bot check) |
| `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` | `vars` in `wrangler.jsonc` (`RESEND_TO_EMAIL` is comma-separated) |

For local dev, put runtime values in `.dev.vars` (gitignored).

> If you set `TURNSTILE_SECRET_KEY`, also set `PUBLIC_TURNSTILE_SITE_KEY` and rebuild. Otherwise every form submission will be rejected.

## Domains

- `www.healthshores.com`: canonical, attached as a Worker custom domain.
- `healthshores.com`: Worker custom domain, plus a Cloudflare Redirect Rule (301 to www).
- `healthshores.mohansky.workers.dev`: kept live for old links; canonical tags point to www.

Email (`info@healthshores.com`) is handled by Porkbun email forwarding (MX records in Cloudflare DNS).
