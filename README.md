# Gym Logger

A personal workout tracker: log sets and reps by workout type, track a weekly
streak, see your history on a calendar, and share sessions to a public feed.
Built with React + Vite + Firebase, styled with a custom design system
("Momentum").

## Features

- **Log** — pick a workout type (Push/Pull/Legs/Other, plus any custom types
  you add) and log sets with autosave — no Save button, every field persists
  as you type.
- **Streak** — tracks consecutive weeks hitting a weekly session goal
  (default 3/week, editable by tapping the streak card).
- **PR detection** — automatically detects a new max weight per exercise and
  fires a celebration.
- **Rest timer** — starts automatically when you mark a set complete.
- **Calendar** — month view, color-coded by workout type.
- **Me** — your workout history, grouped by week, with delete (behind a
  confirm step).
- **Community** — a public feed of everyone's logged sessions.
- **Dark mode** — system-aware, persisted, with a toggle on both mobile and
  desktop.
- Custom workout types you add get a distinct color and icon automatically
  (deterministically assigned, no extra setup).

## Tech stack

- [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com) — design tokens in `tailwind.config.js`
- [Firebase](https://firebase.google.com) — Auth (Google sign-in) + Firestore
- [lucide-react](https://lucide.dev) for icons

## Getting started

```bash
npm install
npm run dev       # local dev server (Vite)
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
npm run lint      # eslint
```

The app connects to a live Firebase project (config is in
`src/lib/firebase.js`) — the client-side Firebase config (`apiKey`, etc.) is
not a secret; it's meant to be public. Access control is enforced by
Firestore security rules, not by hiding this config.

## Project structure

```
src/
  App.jsx              # app shell: auth, theme, nav, view routing
  lib/                  # shared logic (Firebase init, date/format helpers,
                         #   presets, hooks) — no UI
  components/            # design-system primitives (Button, Card, SetRow,
                         #   ExerciseCard, RestTimer, CalendarGrid, ...)
  screens/               # one file per tab/screen (LogScreen,
                         #   WorkoutLogScreen, CalendarScreen, ...)
```

`src/tempApp.js` is a separate, in-progress rewrite exploring multi-user auth
— not wired into the app, kept around for reference.

## Design system

The visual design ("Momentum") is documented in
[`design_handoff_momentum_2a/`](./design_handoff_momentum_2a) — tokens,
component inventory, and a static HTML reference. `CLAUDE.md` at the repo
root encodes the same rules for AI-assisted edits going forward: token-only
colors/spacing, `lucide-react` icons only, light+dark parity on every screen.

## Admin / maintenance scripts

A few one-off Node scripts at the repo root use the Firebase **Admin** SDK
(full read/write access, bypassing security rules) for data migrations —
these are not part of the deployed app:

| Script | Purpose |
|---|---|
| `migrate.mjs` | Merge multiple anonymous UIDs into one Google account UID |
| `migrate_to_cdudhane.mjs` | Copy one account's data to another (non-destructive) |
| `cleanup.mjs` | Delete old UID data after a successful migration |
| `audit_profiles.mjs` | Read-only audit of profiles/workouts (uses the client SDK, not Admin) |

All Admin-SDK scripts require a `serviceAccount.json` file in the repo root
(Firebase Console → Project Settings → Service Accounts → **Generate new
private key**). This file is **gitignored on purpose** — see Security below.
Run any of them with `--dry-run` first.

## Deployment

Firebase Hosting config lives in `firebase.json` / `.firebaserc`. Typical flow:

```bash
npm run build
firebase deploy --only hosting
```

## Security notes

- `serviceAccount.json` (Firebase Admin credentials) must never be committed.
  It's in `.gitignore`. If you're setting this up fresh, generate your own
  key from the Firebase Console and drop it in the repo root locally only.
- The web `apiKey` in `src/lib/firebase.js` is safe to have in source — it
  identifies the Firebase project, it doesn't authorize anything by itself.
  Actual access control is Firestore security rules (not included in this
  repo — configure them in the Firebase Console / a `firestore.rules` file).
