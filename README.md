# Fikr Health International — Sales & Accounts Ledger

A standalone web app for recording daily sales, tracking inventory and
expenses, and generating reports (Naira-based). Installable as an app on
phones and desktops, with live data shared across every device that uses it.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

Out of the box (no setup below) it saves to the browser's local storage only
— fine for trying it out on one device, but nobody else will see the data.

## Share live data across devices (Supabase)

To make sales/inventory/expenses show up live for everyone the app is given
to — not just on the device that entered them — connect a free Supabase
project:

1. Go to [supabase.com](https://supabase.com), sign up, and create a new
   project (free tier is enough).
2. In the project, open **SQL Editor → New query**, paste in the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   one table the app uses and turns on live sync.
3. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon public** key.
4. In this folder, copy `.env.local.example` to `.env.local` and paste those
   two values in.
5. Restart `npm run dev` (or redeploy, if already live). The header will show
   **"Live sync on"** once it's connected — otherwise it shows **"This device
   only"**.

Once connected, anyone who opens the same deployed app URL sees the same
sales, inventory, expenses and customers, updating live as entries are made
— no refresh needed.

### Security note

There's no login screen. Access is controlled purely by who has the app's
URL — anyone with the link (and therefore the Supabase anon key bundled into
the app) can read and write the data. That's fine for handing the link
privately to an owner + a couple of managers, but **don't post the link
publicly**. If you later need real per-person accounts, Supabase's own
Auth (email/password or magic links) can be added on top of this — ask if
you want that wired up.

## Deploy it for free (recommended: Vercel)

1. Push this folder to a GitHub repository (or upload it directly — Vercel
   also supports drag-and-drop of a project folder).
2. Go to https://vercel.com, sign up/log in, click **Add New → Project**.
3. Import the repository. Vercel auto-detects Vite — leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Under **Environment Variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (same values as your `.env.local`) if you set up
   shared data above.
5. Click **Deploy**. You'll get a live URL like
   `fikr-health-ledger.vercel.app` within a minute.

### Alternative: Netlify

1. Go to https://app.netlify.com, sign up/log in.
2. **Add new site → Import an existing project**, connect your repo (or drag
   the `dist` folder after running `npm run build` for a no-git deploy).
3. Build command: `npm run build`, publish directory: `dist`.
4. Add the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment
   variables under Site settings if shared data is set up.

## Install it as an app

The app ships a real web app manifest and service worker, so it installs
like a native app rather than just being a bookmarked tab:

- **Android (Chrome):** open the deployed URL → menu (⋮) → "Install app" (or
  a install banner appears automatically).
- **Desktop (Chrome/Edge):** open the deployed URL → install icon in the
  address bar.
- **iPhone (Safari):** Share button → "Add to Home Screen" (iOS doesn't
  support the automatic install prompt, but this gives the same full-screen,
  no-browser-chrome result).

## Project structure

```
index.html            Entry HTML, PWA meta tags
vite.config.js         Vite + PWA (manifest, service worker) config
public/icon.svg        App icon
supabase/schema.sql     Table + policies for shared live data (optional)
.env.local.example      Template for Supabase credentials
src/main.jsx            React entry point
src/App.jsx             The whole app (dashboard, sales, inventory, expenses,
                         customers, reports)
src/supabaseClient.js   Supabase client (null if not configured)
src/storage.js          Persistence layer — Supabase-backed when configured,
                         localStorage fallback otherwise
src/index.css           Tailwind setup
```
