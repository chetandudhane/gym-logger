import React from 'react';

/** 11px, 700, uppercase, 1.4px tracking, muted. Used for "CHOOSE A WORKOUT",
 *  "SESSION NOTE", etc. Not one of the primitives explicitly requested, but every
 *  primitive that needs a section label (ExerciseCard's note, WorkoutRow lists)
 *  depends on it — included per the DESIGN_SYSTEM.md component inventory. */
export default function SectionLabel({ children, className = '' }) {
  return (
    <p
      className={`font-sans font-bold uppercase text-[11px] tracking-[1.4px] text-muted dark:text-muted-d ${className}`}
    >
      {children}
    </p>
  );
}
