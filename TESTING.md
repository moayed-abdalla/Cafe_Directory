# Moayed Cafe Directory — Testing Guide

Manual QA checklist for the app in this repo root. There is one app (Next.js 15). Test it in **dev** and **production** modes, then walk every public and admin surface below.

---

## 1. Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js | 20+ recommended |
| npm | Comes with Node |
| Env file | Copy `.env.example` → `.env.local` |

Required env vars in `.env.local`:

```env
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=a-long-random-string
```

Optional: `MAPBOX_ACCESS_TOKEN` (geocoding fallback for `npm run seed` only — not needed for UI testing).

Install once from the repo root:

```bash
npm install
```

Confirm data files exist:

- `data/cafes.json`
- `data/category-picks.json`
- `data/yet-to-try.json`

If they are missing or empty, regenerate from the spreadsheet:

```bash
npm run seed
```

---

## 2. How to run (every mode)

Run these from the **repo root** (`Moayed_Cafe_Directory`).

### A. Development (hot reload)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Use this for day-to-day UI checks and admin JSON writes.

### B. Production build (local)

Mirrors what Vercel serves more closely than `dev`.

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### C. Lint (non-UI)

```bash
npm run lint
```

Expect: no errors (warnings OK if previously accepted).

### Checklist — run modes

| Mode | Command | Pass criteria |
|------|---------|----------------|
| Dev | `npm run dev` | Home loads; map tiles appear; no console crash |
| Prod | `npm run build` then `npm start` | Same as above; build completes with exit 0 |
| Lint | `npm run lint` | Exit 0 |

Test the flows in sections 3–6 in **both** Dev and Prod at least once before a release.

---

## 3. App surfaces (what to test)

| Surface | URL | Role |
|---------|-----|------|
| Public home | `/` | Map → Leaderboard → Full Data |
| Login | `/login` | Admin sign-in |
| Admin | `/admin` | CRUD (cookie-gated) |
| Login API | `POST /api/auth/login` | Sets session cookie |
| Logout API | `POST /api/auth/logout` | Clears session |

Middleware redirects unauthenticated `/admin` visits to `/login?from=/admin`.

---

## 4. Public site — `/`

Viewport sizes to cover: **desktop (~1280px)** and **mobile (~390px)**.

### 4.1 Map (`#map-section`)

| # | Steps | Expected |
|---|-------|----------|
| 1 | Load `/` | Full-viewport map centered on Jeddah; brand line “Moayed's Cafe Directory”; “Scroll for rankings” cue |
| 2 | Wait for tiles | Basemap loads; score-colored pins appear for cafés with coordinates |
| 3 | Click a pin | Popup opens with café name / scores; pin shows selected state |
| 4 | Close popup | Popup dismisses; selection clears |
| 5 | Zoom + / − controls | Map zooms in and out (scroll-wheel and double-click zoom are intentionally off) |
| 6 | Drag / pan | Map pans normally |
| 7 | Scroll down | Map scales down slightly (GSAP scrub); page reaches leaderboard |

### 4.2 Leaderboard (`#leaderboard-section`)

| # | Steps | Expected |
|---|-------|----------|
| 1 | Scroll to Leaderboard | Heading + short intro visible |
| 2 | Category rail — **Overall / All Rankings** | City-grouped overall ranking list |
| 3 | Switch **Coffee, Desserts, Social, Work, Value** | Top-picks list for that category (UI labels this “Top 5”) |
| 4 | Mobile | Category chips/rail usable; layout does not overflow badly |
| 5 | Click a ranked café that exists in `cafes.json` | Page scrolls/focuses map; pin popup opens for that café |
| 6 | Click a pick with a mismatched name (e.g. typo vs café list) | Shows “Not in full ratings yet”; not clickable to map |

Categories to click through every time: Overall, Coffee, Desserts, Social, Work, Value.

### 4.3 Full Data (`#full-data-section`)

| # | Steps | Expected |
|---|-------|----------|
| 1 | Scroll to dark “Want every detail?” section | CTA **Full Data** visible |
| 2 | Click **Full Data** | Full-screen overlay slides up |
| 3 | Search by name / city / notes | Table filters live |
| 4 | Sort each column: Café, City, Avg, Coffee, Desserts, Visits | Sort toggles asc/desc; arrow indicator updates |
| 5 | Expand **Yet to Try** | List of pending cafés appears |
| 6 | Collapse Yet to Try | List hides |
| 7 | Close (X) | Overlay closes; page scroll position remains usable |

---

## 5. Auth — `/login` and session

Use credentials from `.env.local`.

| # | Steps | Expected |
|---|-------|----------|
| 1 | Visit `/admin` while logged out | Redirect to `/login?from=/admin` |
| 2 | Submit wrong password | Error: “Invalid username or password”; stay on login |
| 3 | Submit correct credentials | Redirect to `/admin` |
| 4 | Visit `/login` while already logged in | Redirect to `/admin` |
| 5 | Click **Logout** in admin | Session cleared; `/admin` redirects to login again |

---

## 6. Admin — `/admin`

Local saves write to `data/*.json`. Confirm file changes on disk after each save in **dev**. In **prod (`npm start`)**, filesystem writes may still work locally but will **not** persist on Vercel — treat prod-server edits as “save attempted / UI feedback” only unless you are testing local JSON I/O.

### 6.1 Shell

| # | Steps | Expected |
|---|-------|----------|
| 1 | Open `/admin` authenticated | Banner about JSON + commit/redeploy; tabs: Cafés, Yet to Try, Category Picks |
| 2 | Switch tabs | Each editor renders without blank screen |

### 6.2 Cafés tab

| # | Steps | Expected |
|---|-------|----------|
| 1 | Search cafés | List filters by name/city |
| 2 | Open an existing café | Form loads with scores, notes, coords, etc. |
| 3 | Edit a field and **Save** | Success feedback; `data/cafes.json` updates (dev) |
| 4 | **Pick location on map** | Location picker opens; click sets lat/lng; confirm applies |
| 5 | Create a new café | New row appears after save |
| 6 | Delete a test café | Removed from list and JSON (use a throwaway entry) |

City validation: only **Jeddah** / **Riyadh** should be accepted.

### 6.3 Yet to Try tab

| # | Steps | Expected |
|---|-------|----------|
| 1 | Add an item | Appears in list after save |
| 2 | Reorder if UI allows | Order persists in `data/yet-to-try.json` |
| 3 | Edit / remove | Changes persist |

### 6.4 Category Picks tab

| # | Steps | Expected |
|---|-------|----------|
| 1 | Open each category | Ranks 1–5 slots visible |
| 2 | Set a pick by selecting/typing a café name that matches `cafes.json` | Save succeeds |
| 3 | Reload public `/` leaderboard for that category | Pick appears and is map-clickable |
| 4 | Intentionally typo a name, save, check public UI | “Not in full ratings yet” |

---

## 7. Cross-cutting checks

Run once per release on **desktop and mobile**:

| Area | Check |
|------|--------|
| Performance | First paint usable; map not blank for long |
| Console | No repeated red errors on home / admin |
| Fonts | Display + body fonts load (not fallback Arial/system-only) |
| Smooth scroll | Lenis does not break native focus or overlay scroll |
| Motion | Map scroll cue, leaderboard entrance, Full Data sheet animate |
| Data count sanity | Roughly ~40+ cafés, category picks, yet-to-try items load |
| Build | `npm run build` succeeds |

---

## 8. Suggested pass order (full pass)

1. `npm install` + confirm `.env.local`
2. `npm run lint`
3. `npm run dev` → sections **4 → 5 → 6**
4. Stop dev server
5. `npm run build` + `npm start` → smoke **4.1, 4.2, 4.3, 5** (and admin read-only if desired)
6. Mark any failures with URL, viewport, and steps to reproduce

---

## 9. Known gaps (do not treat as regressions unless newly broken)

- Category UI says Top 5; data often only fills ranks 1–3
- Some category pick names may not match café names exactly
- Many cafés have empty `address` / `geocode_verified: false`
- Full Data copy mentions price breakdowns; table columns are narrower than that copy
- Production (Vercel) admin writes do not persist without commit + redeploy

---

## 10. Quick smoke (5 minutes)

```bash
npm run dev
```

1. `/` — map pins + popup  
2. Leaderboard — switch 2 categories + click one café → map focuses  
3. Full Data — open, search, close  
4. `/admin` → login → open each tab → logout  

If those four pass on desktop and mobile width, the core app is healthy.
