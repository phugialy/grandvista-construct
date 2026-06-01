# Grandvista Construct

Website and digital platform foundation for Grandvista, an emerging commercial construction company positioned around disciplined planning, field coordination, and growth-ready commercial work.

## Current Foundation

- Next.js App Router with TypeScript and Tailwind CSS
- Brand-first homepage concept
- Core route pages for the planned navigation
- Supabase client wiring through environment variables
- Draft Supabase migration for projects, project media, project categories, leads, and lead events
- Project roadmap in `docs/grandvista-website-roadmap.md`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill the required values.

Public browser-safe values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only values:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_EMAIL`

Never commit database passwords, service role keys, or private API keys.

## Verification

```bash
npm run lint
npm run build
```

## Deployment

The Vercel project is connected to the GitHub repository. Pushes to `main` are intended to drive the production deployment workflow, while other branches can be used for previews.

## Admin

The lead dashboard is available at `/admin/login`. It uses the server-only `ADMIN_ACCESS_TOKEN` environment variable and sets an HTTP-only session cookie for `/admin` routes.
