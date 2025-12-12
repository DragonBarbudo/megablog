# Multi-Site Blog System

A multi-tenant Nuxt 4 application using Supabase, Tailwind, OpenAI, and Fal.ai.

## Setup Instructions

### 1. Database Setup
Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> SQL Editor and run the content of `supabase/schema.sql`.

### 2. Environment Variables
The `.env` file has been created. Ensure it contains:
- `SUPABASE_URL` & `SUPABASE_KEY`
- `SUPABASE_SERVICE_KEY` (Required for Builder/Cron)
- `OPENAI_API_KEY`
- `FAL_KEY`
- `CLOUDFLARE_TOKEN`

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

## Adding a New Site (The Builder)

Use the builder script to generate a new site configuration, pages, and initial posts automatically.

```bash
# Usage: npx tsx scripts/builder.ts <domain> <name> <niche>
npx tsx scripts/builder.ts example.com "My Tech Blog" "Technology and AI"
```

This will:
1.  Generate a theme and description using OpenAI.
2.  Create the site in Supabase.
3.  Generate Home and About pages.
4.  Generate 10 initial blog posts with images (using Fal.ai).

## testing Multi-tenancy locally
To test different domains locally, add them to your `/etc/hosts`:
```
127.0.0.1 example.com
```
Then visit [`http://example.com:3000`](http://example.com:3000).

## Cloudflare Worker Automation

The file `worker/index.js` contains the code for your Cloudflare Worker.
1.  Create a Timer Trigger (Cron) in Cloudflare.
2.  Deploy this worker.
3.  Update the `API_URL` in the worker script to point to your deployed Netlify URL.
