import {
  Dumbbell, BicepsFlexed, Footprints, Activity,
  Mountain, Bike, Waves, Feather, HeartPulse, Target,
  Swords, Trophy, Weight,
  Zap, Compass, Star, Sparkles, Rocket, Medal, CircleDot, Wind, Anchor, Gauge,
} from 'lucide-react';

// Distinct, semantically-fitting icon per preset type — replaces the
// original design spec's "Dumbbell for Push/Pull/Legs, ring for Other"
// (DESIGN_SYSTEM.md's TypeIconChip note), per your request that all three
// looked identical and weren't visually distinguishable at a glance.
const PRESET_ICONS = {
  PUSH: Dumbbell,       // pressing/pushing a weight
  PULL: BicepsFlexed,   // back & biceps — the muscle a pull day trains
  LEGS: Footprints,     // lower body / movement
  OTHER: Activity,      // general activity (cardio, sport, everything else)
};

// Common gym/activity keywords -> a fitting icon, checked in order, first
// match wins. Covers the custom types people are most likely to actually
// type ("Running", "Yoga", "Swimming", ...) with something more specific
// than a random fallback.
const KEYWORD_ICONS = [
  [/run|jog|sprint/i, Footprints],
  [/walk/i, Footprints],
  [/hike|trek|climb/i, Mountain],
  [/bike|cycl|spin/i, Bike],
  [/swim|pool/i, Waves],
  [/yoga|stretch|pilates|mobility/i, Feather],
  [/cardio|hiit|heart/i, HeartPulse],
  [/core|abs?\b|plank/i, Target],
  [/box|combat|mma|fight|martial/i, Swords],
  [/sport|game|match|tennis|badminton|basketball|football|soccer|volleyball/i, Trophy],
  [/power|strength|lift/i, Weight],
];

// Fallback pool for anything that doesn't match a keyword — deterministically
// hashed the same way getTypeStyles() picks a color, so a given custom type
// name always gets the same icon (and, combined with its own hash-picked
// color, still reads as visually distinct from other custom types).
const FALLBACK_ICONS = [Zap, Compass, Star, Sparkles, Rocket, Medal, CircleDot, Wind, Anchor, Gauge];

function hashTypeName(type) {
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Resolves any workout type (preset or custom) to an icon component. */
export function getTypeIcon(type) {
  if (PRESET_ICONS[type]) return PRESET_ICONS[type];
  const keywordMatch = KEYWORD_ICONS.find(([pattern]) => pattern.test(type || ''));
  if (keywordMatch) return keywordMatch[1];
  const index = hashTypeName(type || '') % FALLBACK_ICONS.length;
  return FALLBACK_ICONS[index];
}
