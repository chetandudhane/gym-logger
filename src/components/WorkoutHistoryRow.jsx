import React, { useState, useRef } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import Card from './Card';
import { getTypeStyles } from './workoutTypeTheme';

/**
 * Me-tab history row (README §7). Tap opens the read-only detail modal. Unlike
 * the current app — which deletes with no confirmation — this always requires
 * a deliberate "Delete this workout? Confirm / Cancel" step before anything is
 * removed. A touch swipe-left reveals that step directly (approximating the
 * mock's swipe gesture); the trash icon is the always-available, non-touch
 * equivalent so the confirm step is reachable with mouse/keyboard too.
 */
export default function WorkoutHistoryRow({ workout, meta, onView, onDelete, deleting = false }) {
  const [confirming, setConfirming] = useState(false);
  const touchStartX = useRef(null);

  const styles = getTypeStyles(workout.type);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -60) setConfirming(true);
  };

  if (confirming) {
    return (
      <Card className="flex items-center justify-between gap-3 border-accent/40 dark:border-accent-d/40">
        <span className="text-sm font-sans font-medium text-ink dark:text-ink-d">Delete this workout?</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setConfirming(false)}
            className="px-3 py-1.5 text-sm font-sans font-medium rounded-chip bg-surface2 dark:bg-surface2-d text-ink dark:text-ink-d"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(workout)}
            disabled={deleting}
            className="px-3 py-1.5 text-sm font-sans font-semibold rounded-chip bg-accent dark:bg-accent-d text-white disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Confirm'}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="flex items-center gap-2">
      <button onClick={() => onView(workout)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${styles.dot}`} />
        <div className="min-w-0">
          <p className="font-display font-bold uppercase tracking-[0.5px] text-[19px] leading-tight text-ink dark:text-ink-d truncate">
            {workout.type}
          </p>
          <p className="text-[11.5px] font-sans font-medium text-muted dark:text-muted-d truncate">{meta}</p>
        </div>
      </button>
      <button
        onClick={() => setConfirming(true)}
        aria-label="Delete workout"
        className="p-2 text-faint dark:text-muted-2d hover:text-accent dark:hover:text-accent-d transition-colors shrink-0"
      >
        <Trash2 size={16} />
      </button>
      <button onClick={() => onView(workout)} aria-label="View workout" className="p-1 shrink-0">
        <ChevronRight className="text-muted dark:text-muted-d" size={18} />
      </button>
    </Card>
  );
}
