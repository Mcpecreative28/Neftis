NEFTIS V6 — FOUNDATION REBUILD
================================

Development branch: rebuild/platform-foundation
Production branch: main (do not modify until review and explicit approval)

CURRENT BASE
- Next.js App Router with the existing Neftis V6 visual shell.
- Public routes under app/(public); route-group name does not appear in URLs.
- Root app/layout.tsx owns the document <html> and <body>.
- The public overview route is app/(public)/page.tsx.
- Existing theme, language, RTL, and tools UI are preserved while the foundation is rebuilt.

TARGET ROUTES
- /, /ai, /tools, /games, /learn, /community, /services
- /login, /register
- /dashboard, /profile, /settings, /admin

TARGET SERVICES (NOT CONNECTED YET)
- Neon Managed Better Auth (email/password + Google; GitHub after OAuth app credentials are configured)
- Neon PostgreSQL + Drizzle ORM
- AI provider adapters, encrypted BYOK connections, and usage quotas
- Private Cloudflare R2 object storage for documents, images, and videos
- Browser camera capture with file-picker fallback

LOCAL DEVELOPMENT
1. Install dependencies with npm install.
2. Copy .env.example to .env.local. Add the pooled Neon `DATABASE_URL` from the Console and generate `NEON_AUTH_COOKIE_SECRET` (at least 32 characters).
3. Start with npm run dev.
4. Run npm run lint and npm run build before considering a change verified.

DEPLOYMENT
- Deploy from the development branch only when you want a Vercel preview.
- Configure server-side environment variables in Vercel; never commit real secrets.
- Do not merge into main until build, lint, migrations, authentication, quotas, and upload security are verified.

See docs/architecture.md for the agreed structure, service boundaries, upload design, and security invariants.


ADMIN ACCESS
------------
There is no separate public admin registration page.

1. Create a normal Neftis account at /register, or sign in at /login.
2. To grant the initial owner access, add the exact email used by that account to the
   server-only Vercel Environment Variable named NEFTIS_SUPERADMIN_EMAILS.
   Example format: owner@example.com
   Multiple addresses can be comma-separated.
3. Apply the variable to Production (and Preview if needed), then redeploy the project.
4. Sign out of Neftis and sign in again using that same email.
5. Open /admin. If the account is not authorized, /admin/login explains what is missing.

Do not create a NEXT_PUBLIC_NEFTIS_SUPERADMIN_EMAILS variable. Do not put this email
allowlist in client-side code. Never share passwords or authentication cookies.

The initial superadmin is resolved from NEFTIS_SUPERADMIN_EMAILS. Other staff access
is represented by active rows in the admin_members table and must be granted by an
authorized administrator through a controlled server-side process. The current admin
console does not yet provide a complete staff-management interface.
