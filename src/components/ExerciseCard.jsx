import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Card from './Card';
import SetRow from './SetRow';
import SegmentedToggle from './SegmentedToggle';
import Button from './Button';
import { formatShortDate, summarizeSets } from '../lib/helpers';

/** Exercise name + optional variant SegmentedToggle + "last performed" meta + a
 *  stack of SetRows + "+ Add set". This is a 1:1 behavioral port of the current
 *  ExerciseItem — same props, same update/variant/add/delete logic, only the
 *  visuals change. `onExerciseDelete`, if provided, adds a trash icon next to
 *  the name that removes the whole exercise (behind a "Delete this exercise?"
 *  confirm step, same pattern as WorkoutHistoryRow) — separate from
 *  `SetRow`'s per-set delete. */
export default function ExerciseCard({ exercise, onExerciseUpdate, onExerciseDelete, readOnly = false, lastPerformed = null }) {
  const [sets, setSets] = useState(exercise.sets || []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { baseName, options } = useMemo(() => {
    const nameParts = exercise.name.split(' ');
    const optionsPart = nameParts.find((p) => p.includes('/'));
    if (optionsPart) {
      return {
        baseName: exercise.name.replace(optionsPart, '').trim(),
        options: optionsPart.split('/'),
      };
    }
    return { baseName: exercise.name, options: [] };
  }, [exercise.name]);

  const [selectedOption, setSelectedOption] = useState(() => {
    if (options.length > 0) {
      const lastSet = exercise.sets && exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1] : null;
      return (lastSet && lastSet.variant && options.includes(lastSet.variant)) ? lastSet.variant : options[0];
    }
    return null;
  });

  useEffect(() => { setSets(exercise.sets || []); }, [exercise.sets]);

  const updateParent = (newSets) => { if (!readOnly) onExerciseUpdate(exercise.name, { sets: newSets }); };

  const handleOptionChange = (newOption) => {
    setSelectedOption(newOption);
    const updatedSets = sets.map((s) => ({ ...s, variant: newOption }));
    setSets(updatedSets);
    updateParent(updatedSets);
  };

  const handleSetChange = (index, updatedSet) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], ...updatedSet, variant: selectedOption };
    setSets(newSets);
    updateParent(newSets);
  };

  const addSet = () => {
    if (readOnly) return;
    const lastSet = sets.length > 0 ? sets[sets.length - 1] : { reps: '', weight: '', completed: false };
    const newSet = { ...lastSet, completed: false, variant: selectedOption };
    const newSets = [...sets, newSet];
    setSets(newSets);
    updateParent(newSets);
  };

  const deleteSet = (index) => {
    if (readOnly) return;
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
    updateParent(newSets);
  };

  const lastSummary = lastPerformed ? summarizeSets(lastPerformed.sets) : '';

  if (confirmingDelete) {
    return (
      <Card className="border-accent/40 dark:border-accent-d/40">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-sans font-medium text-ink dark:text-ink-d">
            Delete "{baseName}" from this workout type?
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirmingDelete(false)}
              className="px-3 py-1.5 text-sm font-sans font-medium rounded-chip bg-surface2 dark:bg-surface2-d text-ink dark:text-ink-d"
            >
              Cancel
            </button>
            <button
              onClick={() => onExerciseDelete(exercise.name)}
              className="px-3 py-1.5 text-sm font-sans font-semibold rounded-chip bg-accent dark:bg-accent-d text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-sans font-semibold text-[16px] text-ink dark:text-ink-d">{baseName}</h3>
        {!readOnly && onExerciseDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            aria-label="Delete exercise"
            className="p-1 -m-1 text-faint dark:text-muted-2d hover:text-accent dark:hover:text-accent-d transition-colors shrink-0"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {!readOnly && lastSummary && (
        <p className="text-[11.5px] text-muted dark:text-muted-d mb-3">
          <span className="font-medium">Last{lastPerformed.date ? ` · ${formatShortDate(lastPerformed.date)}` : ''}:</span>{' '}
          {lastSummary}
        </p>
      )}
      {options.length > 0 && (
        <div className="mb-4">
          <SegmentedToggle options={options} value={selectedOption} onChange={handleOptionChange} disabled={readOnly} />
        </div>
      )}
      <div className="space-y-2">
        {sets.map((set, index) => (
          <SetRow
            key={index}
            set={set}
            setIndex={index}
            onSetChange={handleSetChange}
            onSetDelete={deleteSet}
            readOnly={readOnly}
          />
        ))}
      </div>
      {!readOnly && (
        <Button variant="ghost" onClick={addSet} className="mt-3 w-full">
          <Plus size={16} /> Add set
        </Button>
      )}
    </Card>
  );
}
