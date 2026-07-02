import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from './Card';
import TypeIconChip from './TypeIconChip';

/** A single row in the Log tab's "choose a workout" vertical list (README §2).
 *  `meta` is a freeform string, e.g. "Last · Jun 28 · 6 exercises". Renders one
 *  per entry in `customWorkouts` — the caller maps over that list, this component
 *  doesn't know how many types exist. */
export default function WorkoutRow({ type, meta, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card padding="py-3.5 px-4" className="flex items-center gap-3 hover:shadow-dock transition-shadow">
        <TypeIconChip type={type} />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold uppercase tracking-[0.5px] text-[23px] leading-tight text-ink dark:text-ink-d truncate">
            {type}
          </p>
          {meta && (
            <p className="text-[11.5px] font-sans font-medium text-muted dark:text-muted-d truncate">
              {meta}
            </p>
          )}
        </div>
        <ChevronRight className="text-muted dark:text-muted-d shrink-0" size={20} />
      </Card>
    </button>
  );
}
