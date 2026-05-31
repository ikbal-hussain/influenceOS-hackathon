# InfluenceOS-hackathon

InfluenceOS is an AI-powered influencer discovery platform that helps brands find the right micro-influencers for their campaigns. By analyzing creator profiles, engagement, niche, audience relevance, and web data, it generates smart match scores, campaign insights, and personalized outreach messages, making influencer marketing faster and more data-driven.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) v4 (`@tailwindcss/vite`, `@import "tailwindcss"` in `src/index.css`)
- [React Router](https://reactrouter.com/) v7 (`BrowserRouter` shell in `src/App.jsx`)

## UI

Cool zinc neutrals, teal accent, monospace on the shell only — utilitarian but polished. Global chrome (header, footer, nav) lives in `src/components/AppLayout.jsx`, which wraps every route so the site footer stays consistent. The header and footer brand row use `src/components/BrandMark.jsx`, which displays `public/favicon.svg` next to the InfluenceOS wordmark. The dashboard uses a shortlist hero (chips + count), card rows with avatar initials, and teal primary actions.

### Pages

| Route        | File                              | Purpose                                                |
|--------------|-----------------------------------|--------------------------------------------------------|
| `/`          | `src/pages/LandingPage.jsx`       | Hero + `SearchPanel`. Submits the discovery query.     |
| `/dashboard` | `src/pages/DashboardPage.jsx`     | Ranked Instagram results from the backend.             |
| `/influencer/:id` | `src/pages/InfluencerDetailPage.jsx` | Full row + optional live Instagram snapshot when enrichment is configured on the backend. |

The session storage key for the last discovery payload lives in `src/lib/discoverySnapshot.js` (`LAST_SEARCH_KEY`). `SearchPanel` (`src/components/SearchPanel.jsx`) collects niche, platform, location, audience type. On submit, the landing page calls `POST /api/v1/discovery/instagram` via `src/lib/discoveryApi.js`, stores the response in `sessionStorage`, and navigates to `/dashboard`.

While the request is in flight, `LandingPage` mounts `DiscoveryLoader` (`src/components/DiscoveryLoader.jsx`) — a prominent panel with a spinner, an animated indeterminate progress bar, an elapsed-seconds counter, and rotating “heavy lift” status lines (generic copy, not literal pipeline steps). The discovery flow usually takes 15–30 s on a cold cache, so the loader is intentionally large.

`DashboardPage` sorts rows by follower count (after client-side parsing fallbacks), links each card to `/influencer/:id`, and defensively cleans markdown in snippets. `InfluencerDetailPage` loads the row from the saved snapshot and calls `GET /api/v1/enrichment/instagram/:handle` for a live profile (image, counts, bio) when the backend is configured; the UI stays vendor-neutral. While that request runs, the page shows a skeleton-style “live profile” placeholder and a subtle header cue; recent posts render as compact cards.

## Environment

Copy the example file and adjust:

- **PowerShell:** `Copy-Item .env.example .env`
- **macOS / Linux:** `cp .env.example .env`

Variables:

- `VITE_API_URL` — base URL of the backend in **production** builds (e.g. `https://influenceos-backend.onrender.com`). For local dev, **leave empty**: the app calls `/api` on the Vite origin and Vite proxies to `VITE_API_PROXY_TARGET`, so you avoid CORS entirely. If you set `http://localhost:3000` here instead, the browser makes a cross-origin request; the backend allows loopback `http` origins for that case.
- `VITE_API_PROXY_TARGET` — used by `vite.config.js` to proxy `/api` during `npm run dev` and `npm run preview` (the browser still shows the Vite host; that is expected). Defaults to `http://localhost:3000`.
- `VITE_ENRICHMENT_API_KEY` / `VITE_DISCOVERY_API_KEY` — optional; only when the backend enables matching API keys. These are **embedded in the client bundle** (not secret); they reduce casual API abuse together with server rate limits.

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Local dev server           |
| `npm run build`    | Production build           |
| `npm run preview`  | Preview production build   |
| `npm run lint`     | ESLint                     |

## Getting started

```bash
npm install
npm run dev
```

Make sure the backend ([influenceOS-hackathon-backend](https://github.com/ikbal-hussain/influenceOS-hackathon-backend)) is running on the proxy target so discovery works locally.

### Discovery returns 404 from `localhost:5173`

The dev server is pinned to **port 5173** (`strictPort: true` in `vite.config.js`). If that port was already in use, Vite used to pick **5174** (or another port) while an old browser tab still pointed at **5173** — whatever is on 5173 usually has **no** `/api` proxy, so `POST /api/v1/discovery/instagram` returns **404**. Fix: stop the stray process on 5173 (or close its terminal), run `npm run dev` again, and use **exactly** the URL Vite prints (should be `http://localhost:5173/`).
