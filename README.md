# InfluenceOS-hackathon

InfluenceOS is an AI-powered influencer discovery platform that helps brands find the right micro-influencers for their campaigns. By analyzing creator profiles, engagement, niche, audience relevance, and web data, it generates smart match scores, campaign insights, and personalized outreach messages, making influencer marketing faster and more data-driven.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) v4 (`@tailwindcss/vite`, `@import "tailwindcss"` in `src/index.css`)
- [React Router](https://reactrouter.com/) v7 (`BrowserRouter` shell in `src/App.jsx`)

## UI

Warm cream background with rose–orange gradients, serif headings, and rounded “editorial” cards (no zinc/teal utilitarian theme). Shared tokens live in `src/lib/uiClasses.js`. Global chrome is in `src/components/AppLayout.jsx`; the brand mark is a gradient “IO” badge in `src/components/BrandMark.jsx`. The shortlist page uses soft gradient heroes, rose chips, and pill-shaped primary buttons.

**Marketing home sections** (`src/components/marketing/`): hero stat chips, discover search (`#discover`), pillars, how-it-works (`#how-it-works`), use cases (`#use-cases`), FAQ (`#faq`), and a CTA band. The home header shows anchor links to How it works and FAQ; `SiteFooter.jsx` is a multi-column dark footer with the same anchors plus GitHub repo links.

### Pages

| Route        | File                              | Purpose                                                |
|--------------|-----------------------------------|--------------------------------------------------------|
| `/`          | `src/pages/LandingPage.jsx`       | Multi-section landing (hero, search, pillars, FAQ, CTA). |
| `/dashboard` | `src/pages/DashboardPage.jsx`     | Ranked results from the backend (Instagram or YouTube). |
| `/influencer/:id` | `src/pages/InfluencerDetailPage.jsx` | Platform-specific detail: Instagram gets Apify live profile; YouTube shows Wire discovery data only. |

The session storage key for the last discovery payload lives in `src/lib/discoverySnapshot.js` (`LAST_SEARCH_KEY`). `SearchPanel` (`src/components/SearchPanel.jsx`) collects niche, platform, location, audience type. On submit, the landing page calls discovery via **Anakin Wire** (`POST /api/v1/discovery/instagram` or `/youtube`) through `src/lib/discoveryApi.js` (`searchCreators`), stores the response in `sessionStorage`, and navigates to `/dashboard`. Response `stages.wireUsed` and `stages.wireActionId` prove Holocron ran.

While the request is in flight, `LandingPage` mounts `DiscoveryLoader` (`src/components/DiscoveryLoader.jsx`) — a prominent panel with a spinner, an animated indeterminate progress bar, an elapsed-seconds counter, and rotating “heavy lift” status lines (generic copy, not literal pipeline steps). The discovery flow usually takes 15–30 s on a cold cache, so the loader is intentionally large.

`DashboardPage` sorts rows by follower/subscriber count (YouTube uses backend counts only; Instagram may parse snippet fallbacks), links each card to `/influencer/:id`, and defensively cleans markdown in snippets. `InfluencerDetailPage` branches on `row.platform`: Instagram calls `GET /api/v1/enrichment/instagram/:handle` when configured; YouTube never calls Instagram enrichment and shows channel metadata from discovery instead.

## Environment

Copy the example file and adjust:

- **PowerShell:** `Copy-Item .env.example .env`
- **macOS / Linux:** `cp .env.example .env`

Variables:

- `VITE_API_URL` — base URL of **influenceOS-hackathon-backend** in production builds (your deployed hackathon API). For local dev, **leave empty**: the app calls `/api` on the Vite origin and Vite proxies to `VITE_API_PROXY_TARGET`.
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

**Use the hackathon backend only** — do not run `InfluenceOS-backend`. Both default to port `3000`; if the old backend is running, this app will talk to the wrong API.

1. In **`influenceOS-hackathon-backend`**: copy `.env.example` → `.env`, then `npm install` and `npm run dev`. You should see `influenceOS-hackathon-backend listening on http://localhost:3000`.
2. In **this repo**:

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`. API calls go to `/api` on Vite and are proxied to the hackathon backend ([influenceOS-hackathon-backend](https://github.com/ikbal-hussain/influenceOS-hackathon-backend)).

### Discovery returns 404 from `localhost:5173`

The dev server is pinned to **port 5173** (`strictPort: true` in `vite.config.js`). If that port was already in use, Vite used to pick **5174** (or another port) while an old browser tab still pointed at **5173** — whatever is on 5173 usually has **no** `/api` proxy, so `POST /api/v1/discovery/instagram` returns **404**. Fix: stop the stray process on 5173 (or close its terminal), run `npm run dev` again, and use **exactly** the URL Vite prints (should be `http://localhost:5173/`).
