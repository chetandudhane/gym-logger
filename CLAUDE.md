# Gym Logger — Design System Rules (Momentum / 2A)

> Drop this at the repo root (or merge into an existing CLAUDE.md). It is auto-loaded into context so these rules are followed on every task. Full spec: `design_handoff_momentum_2a/README.md` + `DESIGN_SYSTEM.md`. Visual target: `design_handoff_momentum_2a/Momentum-2A-reference.html`.

## Direction
Clean, minimal, Apple-Health-calm with athletic punch. Warm cream & ink, ONE electric-orange accent, big condensed numerals. This is a visual system — never change the data model, Firebase schema, or feature set to satisfy it. Stack stays React + Vite + Tailwind + Firebase.

## Non-negotiables
- **Tokens only.** Every color/radius/font-size comes from the Tailwind theme (see `DESIGN_SYSTEM.md`). No ad-hoc hex or one-off px. If a value is missing, add it to the theme, don't inline it.
- **Type:** Barlow Condensed (uppercase, 0.5px tracking) for titles, workout-type names, and ALL numerals; Barlow for body/UI. No other fonts.
- **Accent `#e8622a` / dark `#ff7440` is precious** — only for primary action, active nav, completed set, streak flame, PR, "Today", and "Add …" affordances. Never a big decorative fill.
- **Workout-type colors** (Push=blue, Pull=violet, Legs=green, Other=ochre) identify a type consistently everywhere (chips, calendar days, feed, dots).
- **Light + dark parity** on every screen. Keep Tailwind `class` dark strategy, default to system, persist to `localStorage`. Every token has a `-d` / `dark:` counterpart.
- **Don't slow the core flow.** Logging a set must stay tap-count-neutral: autosave (no Save button), Add Set duplicates the last set, complete-toggle starts the rest timer.
- **Icons:** `lucide-react` (`Dumbbell`, `ChevronRight`, `Check`, `Circle`, `Flame`, `Plus`, `Trophy`, `Trash2`, `Sun`, `Moon`). Never hand-draw glyphs from divs/SVGs in production.
- **Reuse primitives.** Build once, reuse: `Button`, `Card`, `StreakBanner`, `WorkoutRow`, `TypeIconChip`, `SetRow`, `ExerciseCard`, `SegmentedToggle`, `RestTimer`, `PrCelebration`, `CalendarGrid`, `FeedCard`, `BottomNav`/`Sidebar`, `EmptyState`. Don't re-style ad hoc per screen.
- **Motion is calm.** Rest timer = linear progress; PR = confetti + spring-pop; everything else subtle. Honor `prefers-reduced-motion`.

## Layout
- Mobile-first (375–430px, one-handed). Bottom tab bar: Log · Calendar · Me · Community.
- Desktop: promote the tab bar to a 248px left sidebar; center content (Workout Log ~600px); dock the rest timer bottom-right.

## Key structural decision
- The Log tab is a **vertical list** of workout types (not a grid), rendered **dynamically from `customWorkouts`** (any count), ending in a dashed **"Add workout type"** row. New types and custom exercises persist to the user's list.

## When redesigning a screen
Match `Momentum-2A-reference.html` exactly for color/type/spacing, keep all existing behavior + dark mode, verify both themes, and diff against the reference. Ask before adding any new screen, section, or copy that isn't in the spec.
