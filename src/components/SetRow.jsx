import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import CompleteToggle from './CompleteToggle';
import { useRestTimer } from './RestTimer';
import { useDebounce } from '../lib/helpers';

/** One reps/weight/complete row inside an ExerciseCard: index chip + reps input +
 *  weight input + CompleteToggle + delete. Autosaves (debounced) — no Save
 *  button. Completing a set starts the floating RestTimer, matching current
 *  behavior exactly. */
export default function SetRow({ set, setIndex, onSetChange, onSetDelete, readOnly = false }) {
  const [reps, setReps] = useState(set.reps || '');
  const [weight, setWeight] = useState(set.weight || '');
  const [isSetCompleted, setIsSetCompleted] = useState(set.completed || false);
  const { start: startRest } = useRestTimer();

  const debouncedSave = useDebounce((newReps, newWeight, completed) => {
    if (!readOnly) onSetChange(setIndex, { reps: newReps, weight: newWeight, completed });
  }, 500);

  useEffect(() => {
    setReps(set.reps || '');
    setWeight(set.weight || '');
    setIsSetCompleted(set.completed || false);
  }, [set]);

  const handleRepsChange = (e) => {
    const newReps = e.target.value;
    setReps(newReps);
    debouncedSave(newReps, weight, isSetCompleted);
  };

  const handleWeightChange = (e) => {
    const newWeight = e.target.value;
    setWeight(newWeight);
    debouncedSave(reps, newWeight, isSetCompleted);
  };

  const toggleComplete = () => {
    if (readOnly) return;
    const newCompleted = !isSetCompleted;
    setIsSetCompleted(newCompleted);
    onSetChange(setIndex, { reps, weight, completed: newCompleted });
    if (newCompleted) startRest(); // kick off the rest timer when a set is logged
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center w-8 h-8 rounded-chip bg-surface2 dark:bg-surface2-d font-display font-semibold text-sm text-muted dark:text-muted-d shrink-0">
        {setIndex + 1}
      </span>
      <input
        type="number"
        inputMode="numeric"
        placeholder="Reps"
        value={reps}
        onChange={handleRepsChange}
        disabled={readOnly}
        aria-label={`Reps for set ${setIndex + 1}`}
        className="w-full text-center font-display font-bold text-xl border border-line-input dark:border-line-input-d rounded-chip py-1.5 bg-surface dark:bg-surface-d text-ink dark:text-ink-d focus:outline-none focus:ring-2 focus:ring-accent/40 dark:focus:ring-accent-d/40 disabled:opacity-60"
      />
      <span className="text-muted dark:text-muted-d text-sm shrink-0">×</span>
      <div className="w-full flex items-baseline justify-center gap-1 border border-line-input dark:border-line-input-d rounded-chip py-1.5 bg-surface dark:bg-surface-d">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={weight}
          onChange={handleWeightChange}
          disabled={readOnly}
          aria-label={`Weight for set ${setIndex + 1}`}
          className="w-full text-center font-display font-bold text-xl bg-transparent text-ink dark:text-ink-d focus:outline-none disabled:opacity-60"
        />
        <span className="text-[11px] text-muted dark:text-muted-d pr-1">kg</span>
      </div>
      <CompleteToggle completed={isSetCompleted} onClick={toggleComplete} disabled={readOnly} />
      {!readOnly && (
        <button
          onClick={() => onSetDelete(setIndex)}
          className="p-2 text-faint dark:text-muted-2d hover:text-accent dark:hover:text-accent-d transition-colors shrink-0"
          aria-label="Delete set"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
