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
- Better Auth + Google/GitHub OAuth
- Neon PostgreSQL + Drizzle ORM
- AI provider adapters, encrypted BYOK connections, and usage quotas
- Private Cloudflare R2 object storage for documents, images, and videos
- Browser camera capture with file-picker fallback

LOCAL DEVELOPMENT
1. Install dependencies with npm install.
2. Copy .env.example to .env.local and fill only local development credentials.
3. Start with npm run dev.
4. Run npm run lint and npm run build before considering a change verified.

DEPLOYMENT
- Deploy from the development branch only when you want a Vercel preview.
- Configure server-side environment variables in Vercel; never commit real secrets.
- Do not merge into main until build, lint, migrations, authentication, quotas, and upload security are verified.

See docs/architecture.md for the agreed structure, service boundaries, upload design, and security invariants.
