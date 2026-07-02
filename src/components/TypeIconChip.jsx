import React from 'react';
import { getTypeStyles } from './workoutTypeTheme';
import { getTypeIcon } from './workoutTypeIcons';

/** 40px tinted rounded-square icon chip identifying a workout type. Each
 *  preset (Push/Pull/Legs/Other) gets its own distinct, semantically-fitting
 *  icon (see workoutTypeIcons.js) rather than the original design spec's
 *  "Dumbbell for all three, ring for Other" — per your call, since all three
 *  looked identical at a glance. Custom types get a keyword-matched icon
 *  where possible, otherwise a deterministic fallback so the same type name
 *  always gets the same icon. */
export default function TypeIconChip({ type, size = 40, className = '' }) {
  const styles = getTypeStyles(type);
  const Icon = getTypeIcon(type);
  return (
    <div
      className={`flex items-center justify-center rounded-chip shrink-0 ${styles.softBg} ${styles.text} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </div>
  );
}
