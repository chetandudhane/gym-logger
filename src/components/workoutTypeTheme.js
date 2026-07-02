// Single source of truth for workout-type color mapping. Every place a type needs
// a color (icon chips, calendar days, feed chips, history dots) should read from
// this map — via getTypeStyles() below — so colors stay visually consistent
// everywhere, including for custom types beyond the 4 presets.

export const WORKOUT_TYPE_ORDER = ['PUSH', 'PULL', 'LEGS', 'OTHER'];

export const WORKOUT_TYPE_STYLES = {
  PUSH: {
    text: 'text-push dark:text-push-d',
    softBg: 'bg-push-soft dark:bg-push-soft-d',
    dot: 'bg-push dark:bg-push-d',
    ring: 'ring-push dark:ring-push-d',
  },
  PULL: {
    text: 'text-pull dark:text-pull-d',
    softBg: 'bg-pull-soft dark:bg-pull-soft-d',
    dot: 'bg-pull dark:bg-pull-d',
    ring: 'ring-pull dark:ring-pull-d',
  },
  LEGS: {
    text: 'text-legs dark:text-legs-d',
    softBg: 'bg-legs-soft dark:bg-legs-soft-d',
    dot: 'bg-legs dark:bg-legs-d',
    ring: 'ring-legs dark:ring-legs-d',
  },
  OTHER: {
    text: 'text-other dark:text-other-d',
    softBg: 'bg-other-soft dark:bg-other-soft-d',
    dot: 'bg-other dark:bg-other-d',
    ring: 'ring-other dark:ring-other-d',
  },
};

// Overflow palette for any workout type beyond the 4 presets. "Add workout
// type" (LogScreen) lets a user create any number of types, but the hand-
// picked design-system palette only defines colors for Push/Pull/Legs/Other.
// Each additional type name hashes deterministically to one of these 10, so
// the same type name always gets the same color everywhere — no extra field
// needed in Firestore, and it doesn't matter what order types were created or
// loaded in.
const EXTRA_TYPE_STYLES = [
  { text: 'text-extra1 dark:text-extra1-d', softBg: 'bg-extra1-soft dark:bg-extra1-soft-d', dot: 'bg-extra1 dark:bg-extra1-d', ring: 'ring-extra1 dark:ring-extra1-d' }, // teal
  { text: 'text-extra2 dark:text-extra2-d', softBg: 'bg-extra2-soft dark:bg-extra2-soft-d', dot: 'bg-extra2 dark:bg-extra2-d', ring: 'ring-extra2 dark:ring-extra2-d' }, // indigo
  { text: 'text-extra3 dark:text-extra3-d', softBg: 'bg-extra3-soft dark:bg-extra3-soft-d', dot: 'bg-extra3 dark:bg-extra3-d', ring: 'ring-extra3 dark:ring-extra3-d' }, // rose
  { text: 'text-extra4 dark:text-extra4-d', softBg: 'bg-extra4-soft dark:bg-extra4-soft-d', dot: 'bg-extra4 dark:bg-extra4-d', ring: 'ring-extra4 dark:ring-extra4-d' }, // plum
  { text: 'text-extra5 dark:text-extra5-d', softBg: 'bg-extra5-soft dark:bg-extra5-soft-d', dot: 'bg-extra5 dark:bg-extra5-d', ring: 'ring-extra5 dark:ring-extra5-d' }, // olive
  { text: 'text-extra6 dark:text-extra6-d', softBg: 'bg-extra6-soft dark:bg-extra6-soft-d', dot: 'bg-extra6 dark:bg-extra6-d', ring: 'ring-extra6 dark:ring-extra6-d' }, // crimson
  { text: 'text-extra7 dark:text-extra7-d', softBg: 'bg-extra7-soft dark:bg-extra7-soft-d', dot: 'bg-extra7 dark:bg-extra7-d', ring: 'ring-extra7 dark:ring-extra7-d' }, // cyan
  { text: 'text-extra8 dark:text-extra8-d', softBg: 'bg-extra8-soft dark:bg-extra8-soft-d', dot: 'bg-extra8 dark:bg-extra8-d', ring: 'ring-extra8 dark:ring-extra8-d' }, // magenta
  { text: 'text-extra9 dark:text-extra9-d', softBg: 'bg-extra9-soft dark:bg-extra9-soft-d', dot: 'bg-extra9 dark:bg-extra9-d', ring: 'ring-extra9 dark:ring-extra9-d' }, // brown
  { text: 'text-extra10 dark:text-extra10-d', softBg: 'bg-extra10-soft dark:bg-extra10-soft-d', dot: 'bg-extra10 dark:bg-extra10-d', ring: 'ring-extra10 dark:ring-extra10-d' }, // taupe
];

function hashTypeName(type) {
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Resolves any workout type (preset or custom) to its color classes. Use
 *  this everywhere instead of indexing WORKOUT_TYPE_STYLES directly, so
 *  custom types get a real distinct color instead of silently collapsing to
 *  Other's ochre. */
export function getTypeStyles(type) {
  if (WORKOUT_TYPE_STYLES[type]) return WORKOUT_TYPE_STYLES[type];
  const index = hashTypeName(type || '') % EXTRA_TYPE_STYLES.length;
  return EXTRA_TYPE_STYLES[index];
}
