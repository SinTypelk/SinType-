# SinType.lk

**SinType.lk** is a modern web application for real-time **Singlish → Sinhala** transliteration. Type phonetic Latin (e.g. `ammaa`, `mama gedara yanavaa`) and see Sinhala output instantly. Pair your phone with your desktop browser for **live mobile-to-PC input**, use a built-in **on-screen Sinhala keyboard**, and switch between **Unicode** and **Legacy FM** font output for web, print, and design workflows.

> **Privacy-first by default:** conversion history and preferences stay in your browser (`localStorage`) unless you sign in and use Mobile Sync (real-time broadcast only).

---

## Key features

| Feature | Description |
|--------|-------------|
| **Real-time conversion** | Greedy longest-match engine (`src/lib/sinhala.ts`) updates output as you type. |
| **Unicode & Legacy FM** | Toggle between modern Unicode and Legacy FM glyphs for Photoshop, Word, and older templates. |
| **Mobile-to-PC sync** | Sign in, scan a QR code, and stream converted Sinhala from your phone into the desktop input via **Supabase Realtime** broadcast channels. |
| **On-screen Sinhala keyboard** | Draggable vowel/consonant grid (`VirtualKeyboard.tsx`) with consonant variation sub-grids. |
| **Voice input** | Browser speech recognition (`MicButton`) on desktop and mobile routes. |
| **Smart learning** | `SmartLearningEngine` combines instant local conversion with optional cloud learning (`/api/sinhala/learn`). |
| **Spell hints** | Underlined suggestions in Unicode mode when `findSpellIssues` detects likely typos. |
| **Conversion history** | Last 20 entries stored locally; restore from the history panel. |
| **Dark / light UI** | Theme persisted in `localStorage`; neon-accented layout (Tailwind + CSS variables). |
| **License & telemetry** | Sign-in required 7-day keys at `/license`; live desktop stats on `/download` from `app_usage`. |
| **Marketing pages** | About, FAQ, download (desktop app), contact, privacy, and terms routes. |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | [React 19](https://react.dev/) |
| **Routing / SSR** | [TanStack Router](https://tanstack.com/router) + [TanStack Start](https://tanstack.com/start) |
| **Build** | [Vite 7](https://vitejs.dev/) + TanStack Start Vite plugin |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| **UI components** | [shadcn/ui](https://ui.shadcn.com/) primitives ([Radix UI](https://www.radix-ui.com/)) |
| **State / data** | [TanStack Query](https://tanstack.com/query), React Context (`app-context`, `auth-context`) |
| **Backend / auth** | [Supabase](https://supabase.com/) (Auth + Realtime broadcast) |
| **OAuth** | Supabase native OAuth (`supabase.auth.signInWithOAuth`) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Forms / validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **QR codes** | [qrcode](https://www.npmjs.com/package/qrcode) |
| **Deployment target** | [Cloudflare Workers](https://workers.cloudflare.com/) (`@cloudflare/vite-plugin`) |

---

## Project structure

```
SinType.lk Web Site/
├── public/                    # Static assets
├── src/
│   ├── routes/                # File-based TanStack Router pages
│   │   ├── index.tsx          # Main converter (home)
│   │   ├── login.tsx          # Google OAuth sign-in
│   │   ├── m.$sessionId.tsx   # Mobile sync input (/m/:userId)
│   │   ├── license.tsx        # License management
│   │   ├── download.tsx       # Desktop app download info
│   │   ├── about.tsx · faq.tsx · contact.tsx · privacy.tsx · terms.tsx
│   │   └── api/sinhala/learn.ts   # Server API for smart learning
│   ├── components/
│   │   ├── Converter.tsx        # Core typing UI
│   │   ├── VirtualKeyboard.tsx  # Sinhala vowel/consonant keyboard
│   │   ├── AccountPanel.tsx     # QR + mobile sync pairing
│   │   ├── MicButton.tsx        # Voice input
│   │   ├── HistoryPanel.tsx     # Local history
│   │   ├── Navbar.tsx · EdgeBar.tsx · Footer.tsx
│   │   └── ui/                  # shadcn/ui component library
│   ├── lib/
│   │   ├── sinhala.ts           # Conversion dictionary & engine
│   │   ├── smartEngine.ts       # Local + API learning layer
│   │   ├── app-context.tsx      # Theme, mode, history
│   │   ├── auth-context.tsx     # Supabase session context
│   │   └── rules.ts             # Spell-check heuristics
│   ├── integrations/
│   │   ├── supabase/            # Client, types, auth middleware
│   │   └── (removed)            # Lovable OAuth helper removed (native Supabase OAuth)
│   ├── styles.css               # Global theme tokens
│   └── routes/__root.tsx        # App shell, providers, layout
├── vite.config.ts
├── package.json
└── .env                         # Supabase keys (not committed — see below)
```

---

## Getting started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+ (or compatible package manager)
- A **Supabase** project with Auth and Realtime enabled (required for sign-in and mobile sync)

### Installation

```bash
cd "SinType.lk Web Site"
npm install
```

### Environment variables

Create a `.env` file in the project root (or configure in your hosting dashboard):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

Optional server-side aliases (SSR / API routes):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

> Without these variables, the Supabase client throws at first use and **mobile sync / sign-in will not work**. The converter itself still runs offline for local transliteration.

### Development

```bash
npm run dev
```

Starts the Vite dev server (TanStack Start). Open the URL printed in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview    # optional local preview of production build
```

### Linting & formatting

```bash
npm run lint
npm run format
```

---

## Authentication flow

SinType.lk uses **Supabase Auth** for identity and session management, with **Google OAuth** as the primary sign-in path on the `/login` page.

### How it works today

1. **`AuthProvider`** (`src/lib/auth-context.tsx`) wraps the app and:
   - Calls `supabase.auth.getSession()` on load.
   - Subscribes to `supabase.auth.onAuthStateChange` for live session updates.
   - Exposes `user`, `session`, `signIn`, `signUp`, and `signOut`.

2. **`/login`** uses **native Supabase OAuth**:
   - `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`
   - Supabase captures the callback, persists the session, and `AuthProvider` reacts to `onAuthStateChange`.

3. **Email / password** sign-in is available on `/login` and in `LoginModal` (used before generating a 7-day desktop key).

4. **7-day activation keys** (`/license`, download CTAs): requires an authenticated user. Keys are inserted into Supabase `licenses` with `email`, `license_key`, and `status: active`.

5. **Live usage** on `/download` reads from `app_usage` (unique `session_id` counts and recent pings).

6. **Mobile sync** requires a signed-in user:
   - Desktop shows a QR code pointing to `/m/{user.id}` (`AccountPanel.tsx`).
   - Phone page joins Supabase channel `sintype:{userId}` and broadcasts `{ event: "set", payload: { text } }`.
   - Desktop `Converter.tsx` listens on the same channel and updates the input in real time.

### Session storage

- Browser: Supabase persists the session in `localStorage` (see `integrations/supabase/client.ts`).
- Sign out: `signOut()` clears the Supabase session.

### Integrating additional providers

1. Enable the provider in the Supabase dashboard (Authentication → Providers).
2. Add a button on `/login` that calls `supabase.auth.signInWithOAuth({ provider: "provider", options: { redirectTo: window.location.origin } })`.
3. Ensure redirect URLs match your deployment origin.

---

## Mobile-to-PC sync (technical overview)

```
┌─────────────────┐     Supabase Realtime      ┌─────────────────┐
│  Phone /m/:id   │  broadcast "set" {text}   │  Desktop /      │
│  Singlish draft │ ────────────────────────► │  Converter      │
│  → Unicode out  │     channel sintype:{id}   │  input textarea │
└─────────────────┘                            └─────────────────┘
```

- Debounced streaming (~120 ms) on mobile; desktop applies incoming text immediately.
- **No conversion text is stored on the server** for sync—only ephemeral broadcast messages.
- Works without sync when logged out; pairing requires Google sign-in.

---

## Conversion modes

| Mode | Use case |
|------|----------|
| **Unicode** (default) | Web, social media, Google Docs, modern Sinhala fonts |
| **Legacy FM** | Photoshop, Illustrator, FM Abhaya / FMBindumathi and similar legacy fonts |

Dictionary data is embedded from `singlish_and_unicode.txt`-style blocks parsed in `src/lib/sinhala.ts`.

---

## Related projects

- **SinType Desktop** — Windows app (`SinType Project/` sibling folder) with global hotkeys, floating toolbar, and offline transliteration. See the desktop `developer.md` and `/download` on the site.

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

---

## License & support

- Terms: `/terms` · Privacy: `/privacy` · FAQ: `/faq`
- Contact: `/contact`
- Website: [https://sintype.lk](https://sintype.lk)

---

*Built for Sri Lankan writers, students, designers, and developers who need fast, accurate Singlish → Sinhala typing across devices.*
