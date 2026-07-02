import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import Button from './Button';
import { MIN_WEEKLY_TARGET, MAX_WEEKLY_TARGET } from '../lib/presets';

/**
 * Small modal for changing the weekly streak goal — the README calls this
 * out explicitly ("currently hardcoded... consider surfacing in a settings
 * screen"). Opened by tapping the "X of Y this week" area of StreakBanner.
 * A stepper (1-7 sessions/week) rather than a dropdown, matching the
 * −15/+15 pattern already used by RestTimer.
 */
export default function WeeklyGoalModal({ currentGoal, onSave, onClose }) {
  const [goal, setGoal] = useState(currentGoal);

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(11,9,7,0.6)] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface dark:bg-surface-d rounded-win shadow-modal w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold uppercase tracking-[0.5px] text-lg text-ink dark:text-ink-d">
            Weekly goal
          </h3>
          <button onClick={onClose} aria-label="Close" className="p-1 -m-1 text-muted dark:text-muted-d hover:text-ink dark:hover:text-ink-d transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-[13px] font-sans text-muted dark:text-muted-d mb-5">
          How many sessions a week keeps your streak alive?
        </p>

        <div className="flex items-center justify-center gap-5 mb-6">
          <button
            onClick={() => setGoal((g) => Math.max(MIN_WEEKLY_TARGET, g - 1))}
            disabled={goal <= MIN_WEEKLY_TARGET}
            aria-label="Decrease"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface2 dark:bg-surface2-d text-ink dark:text-ink-d disabled:opacity-40 transition-opacity"
          >
            <Minus size={18} />
          </button>
          <div className="text-center w-16">
            <span className="font-display font-extrabold text-5xl leading-none text-accent dark:text-accent-d">{goal}</span>
            <p className="text-[11px] font-sans text-muted dark:text-muted-d mt-1">per week</p>
          </div>
          <button
            onClick={() => setGoal((g) => Math.min(MAX_WEEKLY_TARGET, g + 1))}
            disabled={goal >= MAX_WEEKLY_TARGET}
            aria-label="Increase"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface2 dark:bg-surface2-d text-ink dark:text-ink-d disabled:opacity-40 transition-opacity"
          >
            <Plus size={18} />
          </button>
        </div>

        <Button variant="primary" fullWidth onClick={() => onSave(goal)}>
          Save
        </Button>
      </div>
    </div>
  );
}
