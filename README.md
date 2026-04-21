# RelayKit

RelayKit is a Next.js MVP for a public Instagram automation SaaS. It uses Supabase for auth and Postgres, and includes the first Meta OAuth, webhook, rule-builder, and automation-log surfaces needed before Meta app review.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

3. Create a Supabase project and add:

   ```txt
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

4. Run `supabase/schema.sql` in the Supabase SQL editor.

5. Configure Supabase Auth:

   ```txt
   Site URL: http://localhost:3000
   Redirect URL: http://localhost:3000/auth/callback
   ```

   If Next.js uses another local port, add that port too.

6. Create a Meta developer app and add:

   ```txt
   META_APP_ID=
   META_APP_SECRET=
   META_WEBHOOK_VERIFY_TOKEN=
   META_GRAPH_API_VERSION=v22.0
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

7. Run the app:

   ```bash
   npm run dev
   ```

## Meta URLs

Use these URLs in the Meta developer console, adjusted for your deployed domain:

```txt
OAuth redirect: /api/meta/oauth/callback
Webhook callback: /api/meta/webhook
```

For local webhook testing, use a public tunnel and set `NEXT_PUBLIC_APP_URL` to the tunnel origin.

## MVP Scope

- Supabase magic-link auth
- Workspace creation
- Instagram account connection shell through Meta OAuth
- Keyword rule builder for DMs and comments
- Meta webhook verification and event storage
- First-pass DM reply and comment private-reply automation processor
- Dashboard logs for review/debugging

## Next Build Steps

- Add hosted deployment URL
- Configure real Supabase credentials
- Configure Meta app products and webhook subscriptions
- Test with a Meta app admin/tester account
- Add Stripe billing after the automation proof works
# slyde
