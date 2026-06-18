# Moayed Cafe Directory

A single-page coffee review site with an interactive map, category leaderboard, and full ratings data — backed by Supabase.

## Setup

1. Add to `.env.local` (gitignored):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ADMIN_USERNAME=
   ADMIN_PASSWORD=
   ADMIN_SESSION_SECRET=
   ```
   `SUPABASE_SERVICE_ROLE_KEY` is from Supabase Dashboard → Settings → API (server-only; never commit).
   Admin credentials are for the hidden `/login` page (not linked from the public site).

2. Install dependencies:
   ```bash
   npm install
   ```

3. Seed database from the xlsx (geocodes cafes via OpenStreetMap search):
   ```bash
   npm run seed
   ```
   Review approximate coordinates in `data/geocode-review.json`, then correct pins in the Supabase Table Editor (`geocode_verified = true` preserves them on re-seed).

4. Run dev server:
   ```bash
   npm run dev
   ```

## Updating data

Edit `KSA Cafe Directory.xlsx`, then run `npm run seed` again.

Or sign in at `/login` (direct URL only) to edit cafés, Yet to Try, and category picks in the admin dashboard.

## Stack

- Next.js 15, Tailwind CSS, Framer Motion, GSAP, Lenis
- MapLibre GL (free tiles via OpenFreeMap)
- Supabase Postgres
