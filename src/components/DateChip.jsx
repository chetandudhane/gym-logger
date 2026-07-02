import React from 'react';
import { Calendar } from 'lucide-react';

/** Header date affordance — "Today" (or the chosen date) in an accent-soft
 *  pill. Opens a calendar modal to back-log another date (WorkoutLogScreen
 *  only; read-only detail views don't show this). */
export default function DateChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-soft dark:bg-accent-soft-d text-accent dark:text-accent-d text-[12.5px] font-sans font-semibold shrink-0"
    >
      <Calendar size={14} />
      {label}
    </button>
  );
}
