import React from 'react';
import { getTypeStyles } from './workoutTypeTheme';

/** Small type-tinted pill label — used in FeedCard and WorkoutDetailModal.
 *  Distinct from TypeIconChip (which is the 40px square icon tile). */
export default function TypeChip({ type, className = '' }) {
  const styles = getTypeStyles(type);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-chip font-display font-bold uppercase tracking-[0.5px] text-[11px] ${styles.softBg} ${styles.text} ${className}`}
    >
      {type}
    </span>
  );
}
