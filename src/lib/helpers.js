import { useCallback, useRef, useEffect } from 'react';

// General-purpose date/format/data helpers shared across screens and
// components. Ported 1:1 from the logic that used to live inline in App.jsx —
// behavior is unchanged, only the location moved so multiple files can share
// one implementation instead of copy-pasting.

export const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const sanitizeForId = (str) => str.replace(/\//g, '_');

// Strip the "/" options part (e.g. "Bench Press Flat/Incline" -> "Bench Press")
export const getBaseName = (name) => {
  const parts = name.split(' ');
  const opt = parts.find((p) => p.includes('/'));
  return opt ? name.replace(opt, '').trim() : name;
};

// Normalizes a user-typed exercise name to Title Case, matching the preset
// exercise list's style ("Barbell Bench Press", "DB Shoulder Press") —
// mirrors how "Add workout type" auto-uppercases its input. Only forces the
// *first* letter of each word up rather than fully title-casing, so
// abbreviations a lifter actually types (DB, RDLs, EZ bar) survive instead of
// getting mangled into "Db" / "Rdls" / "Ez".
export const toTitleCase = (str) => str
  .trim()
  .replace(/\s+/g, ' ')
  .split(' ')
  .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
  .join(' ');

export const formatTime = (s) => {
  const safe = Math.max(0, s);
  const m = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const formatShortDate = (dateStr) => {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

// Compact summary of a past session's sets, e.g. "10×40, 8×42"
export const summarizeSets = (sets) => {
  if (!sets) return '';
  return sets
    .filter((s) => s.reps && String(s.reps).length > 0)
    .map((s) => `${s.reps}×${(s.weight === '' || s.weight == null) ? '–' : s.weight}`)
    .join(', ');
};

// Monday-anchored week key for streak math + "this week / last week" grouping
export const getMonday = (d) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const isWorkoutLogged = (workout) =>
  !!workout?.exercises?.some((ex) => ex.sets?.some((s) => s.reps && String(s.reps).length > 0));

export function useDebounce(callback, delay) {
  return useCallback((...args) => {
    const timer = setTimeout(() => { callback(...args); }, delay);
    return () => clearTimeout(timer);
  }, [callback, delay]);
}

// Properly-cancelling debounce (used for the notes field to avoid spamming Firestore)
export function useDebouncedCallback(callback, delay) {
  const ref = useRef(null);
  const cbRef = useRef(callback);
  useEffect(() => { cbRef.current = callback; }, [callback]);
  return useCallback((...args) => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => cbRef.current(...args), delay);
  }, [delay]);
}

// --- Community feed helpers ---

// "6 exercises · 18 sets · top set Bench 60kg". Note: does NOT include a "New
// PR" callout like the design mock — that would need per-viewer reads of
// another user's private exerciseHistory to verify, which isn't safe to do
// from the public feed, so it's omitted rather than faked.
export function summarizeWorkoutForFeed(workout) {
  const exercises = (workout.exercises || []).filter((ex) => ex.sets?.some((s) => s.reps && String(s.reps).length > 0));
  let totalSets = 0;
  let topSet = null;
  exercises.forEach((ex) => {
    (ex.sets || []).forEach((s) => {
      if (s.reps && String(s.reps).length > 0) {
        totalSets += 1;
        const w = Number(s.weight);
        if (!isNaN(w) && (!topSet || w > topSet.weight)) {
          topSet = { name: getBaseName(ex.name), weight: w };
        }
      }
    });
  });
  const parts = [
    `${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`,
    `${totalSets} set${totalSets === 1 ? '' : 's'}`,
  ];
  if (topSet) parts.push(`top set ${topSet.name} ${topSet.weight}kg`);
  return parts.join(' · ');
}

export function relativeTimeFromNow(date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
