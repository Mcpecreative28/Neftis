# Neftis V6 — Foundation architecture

## Status
This document describes the intended rebuild on `rebuild/platform-foundation`. It is an implementation contract, not a claim that the listed services are already connected. The current V6 UI remains a client-side preview until each backend phase is implemented and tested.

## Product boundaries
- Public areas: overview, tools, games, knowledge, community, and services.
- Account areas: dashboard, profile, settings, AI connections, and private media library.
- AI chat, provider credentials, usage records, uploads, and personal history require an authenticated account.
- Do not add creator-personal-profile content to the public product.

## Target application structure

```text
app/
├── (public)/                 # public routes; URL group is invisible
│   ├── page.tsx
│   ├── tools/ games/ learn/ community/ services/
│   └── ai/
├── (auth)/                   # login and registration
├── dashboard/ profile/
├── settings/                 # appearance, language, security, AI connections
├── admin/
└── api/
    ├── auth/ ai/ providers/ user/ uploads/
components/
├── ui/ layout/ ai/ dashboard/ settings/ uploads/
lib/
├── auth/ database/ crypto/ security/ validation/ rate-limit/
├── ai/                       # provider adapters, gateway, discovery, usage
└── storage/                  # R2 client, validation, processing
 drizzle/                     # schema and migrations
 public/ tests/ docs/
```

This structure extends the agreed route map; it must not replace it with a different top-level architecture.

## Stack decisions
- Next.js App Router + React + TypeScript; deploy to Vercel.
- Neon Managed Better Auth for email/password sessions and social OAuth; auth-owned tables stay in the `neon_auth` schema.
- Neon PostgreSQL with Drizzle ORM for application profiles, provider connections, conversations, usage, and file metadata. Application tables reference the managed auth user ID.
- Cloudflare R2 for private binary objects; Neon stores metadata and ownership, not file bytes.
- Provider adapter layer: Gemini native API, OpenAI-compatible endpoints (including validated custom Base URL), Anthropic native API, and future protocol adapters.
- Cloudflare WAF/rate limiting at the edge; application-level per-user limits and quotas remain authoritative.

## Authentication implementation
- The current auth integration uses Neon's `@neon/auth` Next.js server and client SDKs.
- `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` are server-only configuration; never expose the cookie secret to the browser.
- Email/password is enabled on the development project. Google shared OAuth is for development only; production should use an OAuth app owned by Neftis.
- GitHub OAuth requires a Neftis-owned GitHub OAuth App and must be configured in Neon Auth. Its client secret is stored by Neon, not in the Next.js environment.
- Protected routes include `/ai`, `/dashboard`, `/profile`, `/settings`, and `/admin`.

## AI provider credentials
- Support multiple provider connections per account.
- Support encrypted persistent credentials and session-only temporary credentials; the user chooses the storage mode for each connection.
- Encrypt secrets with authenticated encryption (AES-256-GCM); keep the master key in server environment variables, never in the database.
- Never return stored secrets to the browser, include them in logs, or expose them to another account.
- Session-only secrets need server-side TTL storage; do not rely on Vercel function memory.
- Custom Base URLs require HTTPS, strict host/IP validation, private and metadata address blocking, safe redirect handling, and DNS-rebinding defenses to prevent SSRF.
- Provider/model usage must be attributed to the user, connection, and model. Do not claim a provider call is available until the provider connection is tested.

## Upload and camera subsystem
- Accepted initial families: PDF and common office/text data documents; JPEG/PNG/WebP/GIF images; MP4/WebM video. Validate exact extensions, MIME, file signatures, size, and count on the server. The client accept attribute is only a convenience.
- Camera capture uses browser media permissions and must offer a file-picker fallback when camera access is unavailable or denied.
- Upload UI supports multi-select, preview, remove/replace, progress, cancel, retry, and clear error states.
- Use short-lived signed upload/download URLs; objects remain private. Verify ownership on every metadata and download operation.
- Persist file metadata (owner, object key, original name, detected MIME, size, checksum, status, timestamps) in Neon. Never accept an object key or owner ID as authorization from the client.
- Enforce per-file, per-request, and per-account storage quotas. Add malware scanning/quarantine before files become usable by AI.
- Document processing is isolated by format and size. Extract text server-side; do not execute macros or embedded content.
- Image understanding is available only for vision-capable provider/model connections. Video understanding requires explicit frame/audio extraction and limits; do not silently upload full media to providers.
- Deletion removes metadata and object data, with retryable cleanup for partial failures.

## Security invariants
- Authenticated server-side authorization on every private operation; deny by default.
- Strict account isolation in database queries and storage access.
- HttpOnly, Secure (production), SameSite cookies; OAuth state/PKCE; session revocation and rotation.
- Validate inputs and content; enforce request body, upload, concurrency, and rate limits.
- Protect against CSRF, XSS, SQL injection, SSRF, path traversal, MIME spoofing, and secret leakage.
- Redact tokens, provider keys, signed URLs, and sensitive prompts from logs.
- Admin permissions are separate from normal account permissions and must be checked server-side.

## Implementation sequence
1. Stabilize App Router and preserve the existing V6 visual shell.
2. Add typed environment validation, Neon/Drizzle schema, migrations, and Better Auth.
3. Add encrypted provider connections and provider adapter/gateway with per-user usage accounting.
4. Add private R2 uploads, media metadata, camera capture UI, and document/image/video processing.
5. Add dashboard/profile/settings, quotas, admin controls, community persistence, and automated tests.
6. Verify production build, lint, migrations, auth flows, account isolation, quota enforcement, and upload security before merging to main.

## Verification policy
A commit is not considered production-ready merely because GitHub accepted it. Report build/lint/test results only after actually running them. Keep this branch isolated until the user approves a merge.
