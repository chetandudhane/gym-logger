# Handoff: Gym Logger — "Momentum" Visual Redesign (2A)

## Overview
This package documents the **Momentum** visual direction for Gym Logger — a considered visual identity to replace the current default-Tailwind, teal-on-gray look. It is a **visual/UX-polish pass**: every existing function stays (see the PRD's Section 5 feature inventory). Nothing here changes the data model, backend, or feature set.

Personality: **clean and minimal, Apple-Health-calm, with athletic punch** — warm cream & ink surfaces, a single electric-orange accent used only for energy moments (streak, completed sets, PRs, primary actions), and big condensed numerals as the hero.

## About the Design Files
The files in this bundle are **design references authored in HTML** — prototypes showing the intended look, layout, and behavior. **They are not production code to copy verbatim.** The task is to **recreate these designs inside the existing Gym Logger codebase** (React 19 + Vite + **Tailwind CSS** + Firebase) using its established patterns, `lucide-react` icons, and component conventions. Keep the stack; do not migrate frameworks.

Open `Momentum-2A-reference.html` in a browser to see all screens (mobile + desktop, light + dark). It is a static, self-contained reference.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, and interaction intent are final. Recreate the UI faithfully using Tailwind utilities driven by the tokens in `DESIGN_SYSTEM.md`. Where a mock draws an icon from primitive shapes (e.g. the "barbell" glyph, chevrons, the check), use the codebase's `lucide-react` equivalents (`Dumbbell`, `ChevronRight`, `Check`, `Flame`, `Plus`, `Trophy`) tinted with the correct token — do not ship the primitive-div drawings.

---

## Design Tokens
Full token set + Tailwind config lives in **`DESIGN_SYSTEM.md`**. Summary:

**Type**
- Display / all numerals: **Barlow Condensed** (600/700/800), UPPERCASE for headers & type names, `letter-spacing: 0.5px`.
- Body / UI: **Barlow** (400/500/600).
- Load via Google Fonts. No other families.

**Core palette**
| Role | Light | Dark |
|---|---|---|
| App background | `#f5f1ea` | `#16130f` |
| Surface / card | `#fffdf9` | `#201c17` |
| Surface-2 (timer, set index) | `#efe9df` | `#2a251d` |
| Inverse card (streak) | `#1c1a17` | `#201c17` |
| Text primary | `#1c1a17` | `#f6f2ea` |
| Text secondary | `#8a8378` | `#a49a8b` |
| Text muted / placeholder | `#a29d93` → `#c8bfae` | `#6f665a` |
| Hairline / border | `#e9e2d6` | `#2e2921` |
| Input border | `#e4ddd0` | `#362f26` |
| **Accent (orange)** | `#e8622a` | `#ff7440` |
| Accent soft (tint) | `#fbe6db` | `#32211a` |
| Accent text-on-cream | `#c26a3a` | — |

**Workout-type colors** (used for icon chips, dots, calendar days, feed chips)
| Type | Light color / tint | Dark color / tint |
|---|---|---|
| Push | `#3f7cae` / `#e4edf4` | `#6ea0d0` / `#1a2531` |
| Pull | `#7d6bb3` / `#ece8f5` | `#a894d8` / `#241f31` |
| Legs | `#5f8f5a` / `#e7f0e5` | `#7fb079` / `#1a2618` |
| Other | `#b98a3f` / `#f6ecda` | `#d3a45f` / `#2a2113` |

**Radii** — cards 12–14px · inputs/chips 9–10px · nav bar / windows 14–16px · badges/pills 8–9px · avatars 50% (or 10–11px rounded square for initials tiles).

**Spacing** — 4px grid. Card padding 14–18px. Screen gutters: mobile 20–22px, desktop 36–44px. List gaps 9–12px.

**Shadows** — card float `0 2px 10px -6px rgba(30,28,24,.12)` · nav/dock `0 10px 24px -12px rgba(30,28,24,.22)` · modal (dark) `0 30px 60px -20px rgba(0,0,0,.7)`.

**Type scale (mobile)** — screen title 32–34 (Barlow Condensed 800, uppercase) · section label 11 (700, uppercase, tracking 1.4px) · exercise/card name 16–17 (Barlow 600) · rep/weight number 20 (Barlow Condensed 700) · meta 11.5–12 · body 13.5–15.

**Both light & dark are required** (existing users rely on dark mode — keep Tailwind's `class` strategy, default to system, persist to `localStorage`).

---

## Screens / Views

### 1. Onboarding / Sign-in
- **Purpose:** first launch, get the user into the Log tab fast.
- **Two auth models supported** (design shows both — pick per product decision):
  - **Continue with Google** (as deployed): centered logo mark (orange barbell in a `#fbe6db` rounded-square, dark version `#32211a`), stacked "GYM / LOGGER" wordmark (Barlow Condensed 800, 40px, uppercase), tagline, then a solid **orange** primary button `#e8622a` (54px tall, radius 12) with a provider mark + "Continue with Google", a secondary "or pick a profile instead" link, and small legal text.
  - **Pick a profile** (lightweight, no account): "Who's logging?" heading, a list of profile rows (44px avatar with initials tinted per a color, name, streak/workout meta, chevron), and a dashed **"Create new profile"** row in accent. Footer note "No account needed on this device."
- **Layout:** single centered column, 30px gutters; CTA group pinned to bottom.

### 2. Log tab — "Choose a workout" *(the key layout change)*
- **Purpose:** pick a workout type to start logging; the app's home.
- **Layout (was a 2×2 grid, now a vertical list):**
  - Header row: screen title **"LOG"** (Barlow Condensed 800, 34px, uppercase) + a 34px round profile avatar (`#fbe6db`/`#32211a` bg, initials in accent).
  - **Streak banner:** inverse ink card (`#1c1a17`), radius 14, padding 14×17. Left: "WEEKLY STREAK" label + an accent triangle "flame" + big condensed count "3" + "weeks". Right: 3 dots (filled = sessions done this week, outline = remaining) + "2 of 3 this week".
  - Section label "CHOOSE A WORKOUT".
  - **Workout rows** (stacked, gap 10, one per type): surface card (radius 12, padding 13×15) → 40px tinted rounded-square icon chip (barbell for Push/Pull/Legs, ring for Other) + type name (Barlow Condensed 700, 23px, uppercase) + meta "Last · Jun 28 · 6 exercises" + chevron.
  - **"+ Add workout type"** dashed accent row at the end.
- **Scalability:** the list must render **any number of workout types** from the user's `customWorkouts` collection, not a fixed four. "Add workout type" and per-type "Add Exercise" both persist to the user's list automatically (no global change). Order the four presets first, custom types after.
- Bottom tab bar: **Log · Calendar · Me · Community** (Log active, accent).

### 3. Workout Log screen
- **Purpose:** the core, high-frequency logging view. Must stay fast and one-handed — do not add taps to logging a set.
- **Header:** round back button (left), centered type title (Barlow Condensed 700 uppercase) + subtitle (e.g. "Chest & shoulders"), and a **date chip** ("Today", accent-soft bg) that opens a calendar modal to back-log another date.
- **Exercise card** (surface, radius 14): exercise name (Barlow 600, 16) + optional **variant segmented toggle** (e.g. Flat / Incline — active segment = solid accent). "Last · Jun 28 · 10×40 8×42" meta (shown only while actively logging). Then **set rows**:
  - set-index chip (rounded square, `#efe9df`/`#2a251d`) + **reps input** + **weight input** (bordered pill, number in Barlow Condensed 700 20px, unit in muted 11) + a round **complete toggle** (empty = 1.8px border ring; complete = solid accent circle with a white check).
  - **"+ Add set"** (accent) — duplicates the last set's values as the starting point.
- **"Add Exercise"** appends a custom exercise to that type's list (persisted).
- Free-text **session note** at the bottom (card with "SESSION NOTE" label), autosaved with debounce.
- **Read-only mode** (opened from Calendar / Me / Community): all inputs disabled, Add Set / Add Exercise hidden, note shown as static text.
- Marking a set complete auto-starts the **rest timer**; a new max weight fires the **PR celebration**.

### 4. Rest timer (floating)
- Pinned bar at the bottom once a set is completed. Surface-2 card (radius 14). Countdown **"1:12"** in Barlow Condensed 800 (28px) + "REST" label, controls **−15 / +15 / Skip** (Skip = accent), and a linear progress bar (accent fill on `#362f26` track). Beeps (Web Audio) + vibrates at zero, then auto-dismisses. Default duration persisted per-device in `localStorage`. On desktop it docks bottom-right of the content area (see below).

### 5. PR celebration (overlay)
- Full-screen dimmed overlay (`rgba(11,9,7,.82)` + blur). Confetti pieces (small squares/triangles/dots in the type + accent colors) fall via a `confettiFall` keyframe. Centered card: circular accent-soft medal holder with an accent triangle, "NEW PERSONAL RECORD" label (accent, tracked), exercise name (Barlow Condensed uppercase), a huge accent number ("90" at 64px Barlow Condensed 800) + "kg", and "Previous best 85 kg · +5 kg". Auto-dismisses after ~3s; also fires a distinct vibration pattern.

### 6. Calendar tab
- Month grid, 7 columns. Weekday header (S M T W T F S, muted). Day cells: days with a logged workout get a **soft tinted circle** behind the number, colored by that day's workout type (using the type tint + type color for the numeral). **Today** = 2px accent ring. Prev/next month chevrons flank the month title ("JUNE" Barlow Condensed 800 + year). A **legend** card maps colors → Push/Pull/Legs/Other + Today. Tapping a colored day opens that session read-only.

### 7. Me tab — "My Workouts"
- Reverse-chronological history, **grouped by week** ("THIS WEEK", "LAST WEEK" labels). Each row: type color dot + type name (Barlow Condensed 700 uppercase, 19) + "Mon, Jun 30 · 6 exercises" + chevron. Tap → read-only detail.
- **Delete:** swipe reveals a full-height accent-red destructive action (mock shows the revealed "Delete" state). **Add a deliberate confirm step** here (the current app deletes with no confirmation — the redesign should introduce a confirm, e.g. an inline "Delete? · Confirm / Cancel" state or a small sheet). Deleting removes it from the user's collection and the public feed.

### 8. Community tab
- Global public feed, newest first. Each card: owner avatar (initials, tinted) + name + relative time ("2 hours ago") + a **type chip** (Barlow Condensed uppercase, type-tinted). A one-line summary: "6 exercises · 18 sets · top set Bench 60kg", with PRs highlighted in accent ("New PR · Squat 90kg"). Tap → full read-only detail incl. sets + note. Only workouts with ≥1 real logged set appear.

### Desktop (secondary target)
The app is mobile-first (375–430px, one-handed) but must also work on desktop. Desktop promotes the bottom tab bar to a **left sidebar** (248px): logo + wordmark, nav list (Log/Calendar/Me/Community with the same icons), a spacer, a compact streak card, and a profile row + dark-mode toggle. Main content sits in a centered column (Workout Log ~600px max) with generous 36–44px padding. On desktop the **rest timer docks to the bottom-right** of the content area instead of full-width. Two desktop screens are mocked: Choose Workout (light, wide list rows with a "last session" column) and Workout Log (dark).

---

## Interactions & Behavior
- **No explicit save** — every field autosaves (per-field, debounced note). Preserve this.
- **Add Set** duplicates the previous set's reps/weight as a starting point.
- **Complete toggle** → starts/replaces the floating rest timer; if the completed weight beats the stored `pr.maxWeight` for that exercise, fire the PR overlay + vibration.
- **Date chip** opens a calendar modal to log/view another date. Back-logging works only when NOT arriving from a read-only entry point (Calendar/Me).
- **Variant toggle** scopes this session's sets to the chosen variant.
- **Swipe-to-delete** on Me rows → confirm step → delete from private + public.
- **Motion:** rest timer = linear progress; PR = confetti fall (~2.5–3.3s, staggered) + card spring-pop; workout rows = subtle press feedback; keep everything else calm. Respect `prefers-reduced-motion` (skip confetti / use fade).
- **Responsive:** ≤ ~640px → single column + bottom tab bar; ≥ ~900px → sidebar layout, docked timer.

## State Management
Unchanged from the current app — this is a visual pass. Relevant states each screen can be in (drive the design accordingly):
- **Empty** (no workouts yet → Me/Calendar/Community empty states; design an on-brand empty state), **partial** (session started, some sets logged), **complete**, **read-only** (from Calendar/Me/Community).
- A workout only publishes to the public feed once it has ≥1 set with reps.
- Dark mode: `class` strategy, default to system, persisted to `localStorage`.
- Rest-timer default duration: persisted per-device to `localStorage`.
- Streak: current consecutive weeks hitting the weekly target (currently 3/week, currently hardcoded — consider surfacing in a settings/profile screen).

## Data Model (reference only — do not change)
Per the PRD: `users/{uid}/workouts/{date}`, `exerciseHistory/{name}` (powers "last performed" + PR detection), `customWorkouts/{type}` (the editable per-user exercise list — this is what the scalable Log list renders), `profile/data`; plus `public/data/workouts/{date_uid}` and `public/data/profiles/{uid}` for the feed.

## Assets
No raster assets required. Icons come from `lucide-react` (`Dumbbell`, `ChevronRight`, `Check`, `Circle`, `Flame`, `Plus`, `Trophy`, `Trash2`, `Sun`, `Moon`). The current custom line-art SVGs (bench/pulldown/squat) may be retained and simply re-tinted to the type colors. Fonts are Google Fonts (Barlow, Barlow Condensed). Replace the default Vite PWA placeholder icon/splash with an orange-barbell mark on `#16130f` (see `Momentum-2A-reference.html` thumbnail).

## Files in this bundle
- `README.md` — this document (self-sufficient spec).
- `DESIGN_SYSTEM.md` — exact tokens + a ready-to-paste `tailwind.config` theme extension + component inventory.
- `CLAUDE.md` — drop into the repo root so Claude Code follows this system on every future task.
- `Momentum-2A-reference.html` — standalone, self-contained visual reference (all screens, mobile + desktop, light + dark). Open in any browser.

---

## How to use this with Claude Code

### One-time setup (so the system is followed *going forward*)
1. Copy this whole folder into your repo, e.g. `docs/design/momentum/`.
2. **Copy `CLAUDE.md` to your repo root** (or merge it into an existing `CLAUDE.md`). Claude Code auto-loads root `CLAUDE.md` into context on every session — this is the mechanism that makes it keep following the system.
3. Add the token theme from `DESIGN_SYSTEM.md` to `tailwind.config.js` and the Google Fonts `<link>` to `index.html`. Commit.
4. Ask Claude Code to build the shared primitives first (one prompt below) so every screen reuses them.

### Suggested first prompt to Claude Code
> Read `docs/design/momentum/README.md` and `DESIGN_SYSTEM.md`, and open `Momentum-2A-reference.html` for the visual target. These are design references — recreate them in our existing React + Tailwind app, don't copy the HTML. First, add the design tokens to `tailwind.config.js` and load the Barlow / Barlow Condensed fonts. Then extract shared primitives from `App.jsx` into components that match the system: `Button`, `Card`, `StreakBanner`, `WorkoutRow`, `SetRow`, `ExerciseCard`, `BottomNav` / `Sidebar`, `RestTimer`, `PrCelebration`. Keep all current functionality, dark mode, and Firebase wiring intact. Show me the token config and the component list before editing screens.

### Then, screen by screen
> Using the primitives, redesign the **Log tab** to the Momentum "Choose a workout" **vertical list** (README §2). Render workout types dynamically from `customWorkouts` (not a fixed 4) and add the "Add workout type" row. Match colors/type/spacing exactly per `DESIGN_SYSTEM.md`; verify light and dark.

Repeat for Workout Log, Rest timer, PR celebration, Calendar, Me (add the delete-confirm step), Community, Onboarding, and the desktop sidebar layout. Ask Claude Code to diff against the reference screenshot after each.

### Guardrails to give Claude Code
- Recreate in our stack; **do not** introduce new UI libraries or change the data model / Firebase schema.
- Every color, radius, font size must come from the Tailwind tokens — no ad-hoc hex.
- Keep the core logging flow tap-count-neutral (don't add steps).
- Light + dark parity on every screen; keep the `class` dark strategy + `localStorage` persistence.
- Use `lucide-react` for icons; never ship the prototype's primitive-div glyphs.
