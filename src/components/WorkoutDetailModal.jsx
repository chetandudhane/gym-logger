import React from 'react';
import { X } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import TypeChip from './TypeChip';
import SectionLabel from './SectionLabel';

/**
 * Full-screen read-only detail overlay for a past workout. Opened the same
 * way from all three entry points that the design spec calls out — Calendar
 * (tap a day), Me (tap a history row), Community (tap a feed card) — so
 * read-only rendering (disabled inputs, no Add Set/Add Exercise, note as
 * static text) only has to be built once instead of three slightly-different
 * ways, which is how the original app had it (two separate inline modals in
 * MyWorkouts/CommunityFeed, plus a third full-navigation path from Calendar).
 */
export default function WorkoutDetailModal({ workout, onClose, showOwner = false }) {
  if (!workout) return null;
  const dateLabel = new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  return (
    <div className="fixed inset-0 z-50 bg-[rgba(11,9,7,0.6)] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-cream dark:bg-night rounded-win shadow-modal w-full max-w-2xl max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <TypeChip type={workout.type} />
              <p className="mt-2 text-sm font-sans text-muted dark:text-muted-d">{dateLabel}</p>
              {showOwner && workout.ownerName && (
                <p className="text-[11.5px] font-sans text-muted dark:text-muted-d">By {workout.ownerName}</p>
              )}
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2 -m-2 text-muted dark:text-muted-d hover:text-ink dark:hover:text-ink-d transition-colors">
              <X size={20} />
            </button>
          </div>

          {workout.note && (
            <div className="mt-4">
              <SectionLabel className="mb-1">Session note</SectionLabel>
              <p className="text-[13.5px] font-sans text-ink dark:text-ink-d whitespace-pre-wrap">{workout.note}</p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {(workout.exercises || []).map((exercise, index) => (
              <ExerciseCard key={exercise.name + index} exercise={exercise} readOnly />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
