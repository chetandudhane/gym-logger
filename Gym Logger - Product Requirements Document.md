# Gym Logger — Product Requirements Document

**Purpose of this document:** capture the *functional* scope of Gym Logger — what it does, who it's for, how data flows, and what screens exist — as the input for a visual redesign brainstorm. Visual specifics (color, type, spacing, iconography) are intentionally described only as "current state" reference, not as requirements. Those will be designed fresh in the Claude Design session.

Last updated: 2026-07-01

---

## 1. Product Overview

Gym Logger is a mobile-first web app (installable as a PWA) for logging strength-training and general workouts. A user picks a workout type, logs sets (reps × weight) against a preset or custom exercise list, and the app tracks history, personal records, and weekly consistency automatically. It also has a lightweight social layer: a public feed of everyone's logged workouts.

It is a solo-built, single-user-turned-multi-user product — originally a personal tool for the founder, now being extended toward small-group/community use.

**One-line pitch:** *A fast, no-fuss way to log a workout in under a minute, that quietly keeps score for you (history, PRs, streaks) and lets you see what your friends are training.*

---

## 2. Goals of This Redesign

- Replace the current default-Tailwind, utility-class look with a considered visual identity — this app currently has no real "brand," just teal accents on gray/white Tailwind defaults.
- Preserve every existing function listed in Section 5 below; this is a visual/UX-polish pass, not a feature rewrite.
- Resolve the interaction/IA questions raised in Section 8 (they affect layout, so they should be settled before or during visual design, not after).
- Design should work well as an installed PWA on a phone first, tablet/desktop second.

**Non-goals:** new features, backend/data-model changes, framework migration (staying React + Tailwind + Firebase).

---

## 3. Users

| User type | Description |
|---|---|
| Primary user (founder) | Logs PUSH/PULL/LEGS/OTHER sessions several times a week. Cares about speed of logging (mid-set, sweaty, one-handed) and about seeing progress (PRs, streaks, history). |
| Community/friends | A small circle who also log workouts and can see each other's sessions in a public feed for accountability/motivation. Currently sign in with their own Google account. |

No formal personas or user research exist beyond the founder's own usage — this is a self-built tool. Treat "fast single-handed logging during a rest period" as the core usability constraint for any redesign.

---

## 4. Current Technical Snapshot

*(context for the designer/AI, not something to change)*

- React 19 + Vite single-page app, entire UI in one component file (`App.jsx`, ~1,350 lines).
- Styling: Tailwind CSS utility classes, no design system/tokens, no component library.
- Icons: `lucide-react`, plus a few hand-drawn custom SVGs (bench press, lat pulldown, squat).
- Firebase: Firestore (data), Firebase Auth (Google Sign-In), Firebase Hosting.
- PWA-configured (`vite-plugin-pwa`, apple touch icons, standalone display intent).
- Dark mode implemented via Tailwind's `class` strategy, toggled manually and defaulting to system preference, persisted to `localStorage`.
- Deployed at Firebase Hosting project `gym-logger-by-cd`.

---

## 5. Feature Inventory (current, deployed version)

### 5.1 Authentication & Profile
- Sign-in is "Continue with Google" (Firebase `GoogleAuthProvider` popup) — no email/password, no anonymous mode in the deployed build.
- First sign-in auto-creates a Firestore profile from the Google account (name, email, photo).
- Returning users get their stored profile merged with the live Google session.
- Sign out available from the footer on every screen.

### 5.2 Navigation
Top pill-style nav with 4 tabs, always visible: **Log · Calendar · Me · Community**.

### 5.3 Log tab — workout type selection ("WorkoutSelector")
- Streak banner at the top (see 5.7).
- Four large tappable cards: PUSH, PULL, LEGS, OTHER — each with a custom icon and its own accent color.
- Tapping a card opens the Workout Log screen for that type.

### 5.4 Workout Log screen
- Header: back button, workout type + day title, and a date picker (calendar modal) to log a session for a different date.
- One card per exercise, each showing:
  - Exercise name.
  - "Last performed" summary line (e.g. *Last · Jun 28: 10×40, 8×42*) pulled from history — only shown when actively logging, not in read-only views.
  - If the exercise has a variant (e.g. "Flat/Incline"), a segmented toggle to pick which variant this session's sets belong to.
  - A list of sets: set number, reps input, weight input, a "complete" toggle (circle check), and a delete button.
  - "Add Set" — duplicates the last set's values as a starting point for the next one.
- "Add Exercise" — lets the user append a custom exercise to that workout type's list permanently (saved to their personal exercise list, not global).
- A free-text "workout note" field per session (e.g. "felt strong, left shoulder twinge"), autosaved with debounce.
- Marking a set complete auto-starts a floating **rest timer** (see 5.8).
- Logging a new max weight on a completed set triggers a **PR celebration** overlay (see 5.9).
- When viewed read-only (from Calendar or Me tab), all inputs are disabled and Add Set/Add Exercise are hidden; the note is shown as static text.

### 5.5 Calendar tab
- Month-grid calendar. Days with a logged workout are colored by workout type (PUSH/PULL/LEGS/OTHER each have a color) and clickable to open that day's workout read-only.
- Today is highlighted with a ring.
- Month navigation (prev/next).

### 5.6 Me tab ("My Workouts")
- Reverse-chronological list of every workout the user has logged, each row showing type (color dot), date, and exercise count.
- Tap a row to view full detail (read-only modal).
- Delete a workout (removes it from both the user's private collection and the public feed if it was published there). Confirmation is implicit via a spinner/disabled state, no separate "are you sure" dialog currently.
- Empty state when nothing has been logged yet.

### 5.7 Streak banner
- Shown at the top of the Log tab.
- Tracks a configurable weekly session target (currently 3/week).
- Shows current streak in consecutive weeks that hit the target, and a dot progress indicator for the current week's session count.
- Visually "active" (flame icon lit) vs. "inactive" states.

### 5.8 Rest timer
- Floating bar pinned to the bottom of the screen once a set is marked complete.
- Countdown display, progress bar, controls: −15s, +15s, Restart, Skip.
- Beeps (Web Audio) and vibrates (if supported) when the timer hits zero, then auto-dismisses.
- Default duration persisted per-device in `localStorage`.

### 5.9 PR (personal record) celebration
- Triggered when a completed set's weight beats the previous max recorded for that exercise.
- Full-screen confetti animation + a modal card ("New PR! 🎉" with trophy icon, exercise name, weight) that auto-dismisses after ~3 seconds.
- Also triggers a distinct vibration pattern.

### 5.10 Community tab
- Public feed of every user's logged workouts (not just friends — global), newest first.
- Each row: workout type, owner's display name, date, time logged.
- Tap to view full read-only detail including per-exercise sets and the session note.
- A workout is only published to the public feed once it has at least one set with reps entered (empty/未-started sessions stay private).

### 5.11 Cross-cutting
- Dark mode toggle in the footer (moon/sun icon), affects every screen.
- Loading states: spinner (Tailwind spin animation) used consistently for async screens.
- Responsive layout: centered column, max width ~896px (`max-w-4xl`), comfortable on both phone and desktop browser.

---

## 6. Core User Flows

1. **Log today's workout (happy path):** Open app → already signed in → Log tab → tap PUSH/PULL/LEGS/OTHER → for each exercise, enter reps/weight per set, mark complete (rest timer starts) → optionally add a note → done, no explicit "save" step (autosaves per field).
2. **Back-log a missed day:** Log tab → pick a workout type → use the date-picker in the header to switch to a past date → log as normal (works only when *not* arriving from the Calendar/Me tab, which are read-only views).
3. **Check progress:** Calendar tab → glance at color-coded month → tap any colored day to review that session. Or Me tab → scroll chronological list → tap to review, or delete if it was a mistake.
4. **See what others are doing:** Community tab → scroll global feed → tap any card to see full detail.
5. **First-time onboarding:** Land on app (signed out) → "Continue with Google" → profile is auto-created from Google account → dropped straight into the Log tab.

---

## 7. Data Model (Firestore)

Useful for the design AI to understand what's persisted vs. computed on the fly — it affects what states a screen can be in (empty, partial, complete).

```
artifacts/default-gym-log/
  users/{uid}/
    workouts/{date}                → one doc per calendar day logged: type, exercises[], note, ownerId, ownerName
    exerciseHistory/{exerciseName} → lastPerformed, previousPerformed, pr {maxWeight, date} — powers "last performed" hints and PR detection
    customWorkouts/{type}          → the user's personal exercise list for PUSH/PULL/LEGS/OTHER (starts from a preset, editable via "Add Exercise")
    profile/data                   → displayName, email, photoURL, createdAt
  public/data/
    workouts/{date_uid}            → mirror of a workout doc, only written once it has real logged data — powers Community feed
    profiles/{uid}                 → {name, ownerId} — public-facing identity
```

Preset exercise lists exist for PUSH (8 exercises), PULL (11), LEGS (8), and OTHER (4 cardio-style presets: Running, Walking, Yoga, Badminton) — all editable per-user via "Add Exercise."

---

## 8. Open Product Questions (worth resolving alongside the redesign)

There is a second, unused implementation in the codebase (`tempApp.js`) that explored a different sign-in model: instead of "Continue with Google," it shows a list of existing public profiles to pick from (or "Create New Profile" with just a display name, no Google account), backed by anonymous Firebase auth and a `localStorage` session. It's simpler to use on a shared/borrowed device but currently lacks several features the deployed version has (dark mode, rest timer, PR celebration, streak banner, the "Me" tab). It is **not** more feature-complete than the deployed app — it's an alternate, incomplete auth experiment, not a newer version to migrate to as-is.

Decisions worth making before/while redesigning the IA:
- **Auth model:** stay Google-only, or reintroduce a lightweight "pick or create a profile" path for people who don't want to use a Google account? This affects the very first screen's design.
- **"Me" vs. "Community" overlap:** both are workout-history browsers (one private+deletable, one public+read-only). Is there a cleaner single pattern (e.g. one history view with a "shared" toggle) worth exploring visually?
- **Delete confirmation:** currently no confirmation dialog on deleting a logged workout — worth a deliberate empty/confirm state in the new design.
- **Weekly streak target (3/week):** currently hardcoded, not user-configurable — flag if the redesign should surface a settings/profile screen for this.

---

## 9. Current Visual Language (baseline reference only)

Documented so the "before" state is clear — none of this is a constraint for the new design.

- Palette: teal (`#14b8a6`-ish) as the single accent color; workout types color-coded (PUSH = sky blue, PULL = indigo, LEGS = teal, OTHER = neutral gray); standard Tailwind gray scale for surfaces/text; amber for the streak flame; amber/gold for PR celebration.
- Shape language: rounded-xl cards on white/gray-800 surfaces, soft shadows, pill-shaped nav and toggle controls.
- Typography: default Tailwind sans stack, no custom typeface, no defined type scale beyond ad hoc text-sm/lg/xl/2xl/3xl usage.
- Iconography: Lucide icon set plus 3 custom line-art SVGs for exercise types.
- Motion: minimal — hover scale on the workout-type cards, confetti + spring-pop on PRs, a linear progress bar on the rest timer, spin loaders.
- No illustration, imagery, or custom branding currently exists (app icon/PWA assets are default Vite placeholders).

---

## 10. Constraints for the New Design

- Must render well as a Tailwind implementation (utility classes) since that's the current stack and a full CSS framework swap is out of scope.
- Must support light and dark mode from day one (existing users rely on it).
- Primary viewport: mobile portrait, ~375–430px wide, used one-handed during a workout. Secondary: desktop browser at ~896px content width.
- High-frequency, low-attention interactions (logging a set) must stay fast — avoid redesigns that add taps/steps to the core logging flow.
- Existing delightful moments (PR confetti, rest timer, streak flame) are considered on-brand and worth carrying forward in spirit, even if their visual execution changes completely.

---

## 11. What This Document Deliberately Leaves Open

Color palette, typography, iconography direction, illustration style, component shapes, motion language, and overall "personality" (e.g. gritty/athletic vs. clean/minimal vs. playful) are all undecided on purpose — that's the brainstorm to have with the design AI, using this PRD as the functional brief.
