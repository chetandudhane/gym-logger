# Momentum (2A) — Design System

The single source of truth for tokens. Every value in the mocks maps to something here. Prefer these Tailwind tokens over ad-hoc hex/px anywhere in the app.

## Fonts
```html
<!-- index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
```
- **Barlow Condensed** — display, screen titles, workout-type names, ALL numerals (reps, weight, streak count, timer). UPPERCASE for titles/type names, `letter-spacing: 0.5px`, weights 600–800.
- **Barlow** — body, labels, inputs, meta. Weights 400–600.

## Tailwind config (paste into `tailwind.config.js`)
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // App surfaces — light
        cream:      '#f5f1ea', // app bg (light)
        surface:    '#fffdf9', // cards (light)
        surface2:   '#efe9df', // set-index chip, segmented track (light)
        ink:        '#1c1a17', // primary text / inverse card (light)
        // App surfaces — dark
        night:      '#16130f', // app bg (dark)
        'surface-d':  '#201c17', // cards (dark)
        'surface2-d': '#2a251d', // timer, set-index (dark)
        // Text
        'muted':    '#8a8378', // secondary (light)
        'muted-2':  '#a29d93', // tertiary (light)
        'faint':    '#c8bfae', // placeholder/disabled (light)
        'muted-d':  '#a49a8b', // secondary (dark)
        'muted-2d': '#6f665a', // tertiary (dark)
        // Lines
        line:       '#e9e2d6', // hairline/border (light)
        'line-input':'#e4ddd0',
        'line-d':   '#2e2921', // hairline (dark)
        'line-input-d':'#362f26',
        // Accent (the one energy color)
        accent:       '#e8622a', // light
        'accent-d':   '#ff7440', // dark
        'accent-soft':'#fbe6db', // tint bg (light)
        'accent-soft-d':'#32211a', // tint bg (dark)
        'accent-ink': '#c26a3a', // accent text on cream (contrast-safe)
        // Workout types — light [color, tint]
        push:  '#3f7cae', 'push-soft':  '#e4edf4',
        pull:  '#7d6bb3', 'pull-soft':  '#ece8f5',
        legs:  '#5f8f5a', 'legs-soft':  '#e7f0e5',
        other: '#b98a3f', 'other-soft': '#f6ecda',
        // Workout types — dark
        'push-d':  '#6ea0d0', 'push-soft-d':  '#1a2531',
        'pull-d':  '#a894d8', 'pull-soft-d':  '#241f31',
        'legs-d':  '#7fb079', 'legs-soft-d':  '#1a2618',
        'other-d': '#d3a45f', 'other-soft-d': '#2a2113',
      },
      borderRadius: {
        chip: '9px', card: '13px', bar: '14px', win: '16px',
      },
      boxShadow: {
        card: '0 2px 10px -6px rgba(30,28,24,.12)',
        dock: '0 10px 24px -12px rgba(30,28,24,.22)',
        modal: '0 30px 60px -20px rgba(0,0,0,.7)',
      },
      keyframes: {
        confettiFall: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '15%':  { opacity: '1' },
          '100%': { transform: 'translateY(240px) rotate(300deg)', opacity: '0' },
        },
      },
      animation: { confetti: 'confettiFall 2.8s ease-in infinite' },
    },
  },
};
```

## Type scale (mobile)
| Token | Font | Size / weight | Use |
|---|---|---|---|
| title | Barlow Condensed 800 · uppercase · 0.5px | 32–34px | Screen titles ("LOG", "MY WORKOUTS") |
| type-name | Barlow Condensed 700 · uppercase · 0.5px | 19–23px | Workout-type names in rows |
| number | Barlow Condensed 700 | 20px (mobile) / 22px (desktop) | Reps, weight |
| number-hero | Barlow Condensed 800 | 28–64px | Rest timer, PR value, streak count |
| card-title | Barlow 600 | 16–17px | Exercise names |
| section-label | Barlow 700 · uppercase · 1.4px | 11px | "CHOOSE A WORKOUT", "SESSION NOTE" |
| body | Barlow 400–500 | 13.5–15px | Notes, feed summaries |
| meta | Barlow 500 | 11.5–12px | "Last · Jun 28 · 6 exercises" |

Desktop bumps titles/numbers ~15–25% and switches gutters to 36–44px.

## Spacing & shape
- 4px grid. Card padding 14–18px. Screen gutters 20–22px (mobile) / 36–44px (desktop). List row gap 9–12px.
- Radii: inputs/chips `chip` (9–10), cards `card` (12–14), nav bar & windows `bar`/`win` (14–16), badges/pills 8–9, avatars full-round (or 10–11 rounded-square for initials tiles).
- Touch targets ≥ 44px (complete toggle 26px visual but with padded hit area).

## Component inventory (build these as shared primitives first)
| Component | Notes |
|---|---|
| `Button` (primary/ghost/dashed) | Primary = solid accent, radius 12, 54px. Dashed = "Add …" affordances. |
| `Card` | surface + `line` border + `card` radius; dark variants via `dark:` utilities. |
| `SectionLabel` | 11px 700 uppercase tracking-wide, muted. |
| `StreakBanner` | inverse ink card; flame + condensed count + week dots. |
| `WorkoutRow` | icon chip + type-name + meta + chevron; takes a `type` prop for color. |
| `TypeIconChip` | tinted rounded-square; `Dumbbell` (Push/Pull/Legs) or ring (`Circle`) for Other. |
| `ExerciseCard` | name + variant `SegmentedToggle` + meta + `SetRow`s + AddSet. |
| `SetRow` | index chip + reps input + weight input + `CompleteToggle`. |
| `CompleteToggle` | empty ring ↔ solid-accent circle with `Check`. |
| `SegmentedToggle` | active segment solid accent; used for exercise variants. |
| `DateChip` / calendar modal | header date affordance. |
| `RestTimer` | floating (mobile bottom) / docked (desktop bottom-right); countdown + −15/+15/Skip + progress. |
| `PrCelebration` | overlay + confetti + medal card. |
| `CalendarGrid` | 7-col; type-tinted day circles; today ring; legend. |
| `WorkoutHistoryRow` | Me tab; swipe-to-delete + confirm. |
| `FeedCard` | Community; avatar + name + time + type chip + summary. |
| `BottomNav` (mobile) / `Sidebar` (desktop) | tabs: Log · Calendar · Me · Community. Active = accent. |
| `EmptyState` | on-brand empty for Me/Calendar/Community. |

## Semantic rules
- **Orange is precious.** Use accent only for: primary action, active nav/tab, completed set, streak flame, PR, "Today", "Add …" affordances. Never as a large fill or a decorative background.
- **Workout-type color** identifies a type everywhere it appears (row chip, calendar day, feed chip, history dot) — keep the mapping consistent.
- Numerals are always Barlow Condensed — it's the signature of the direction.
- Dark mode is not an afterthought: every token has a dark counterpart; verify parity per screen.
- Respect `prefers-reduced-motion` (skip confetti, use fades).
