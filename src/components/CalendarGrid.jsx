import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card';
import { getTypeStyles } from './workoutTypeTheme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** 7-column month grid for the Calendar tab (README §6). Logged days get a
 *  2px ring colored by that day's workout type (a soft tinted *fill* was the
 *  original treatment, but the soft dark-mode tints sit too close to the
 *  dark surface color to read clearly — a ring, like the Today treatment,
 *  stays legible in both themes). Today gets a 2px accent ring and takes
 *  priority if a day is both today and logged. Tapping a colored day hands
 *  the workout back to the caller, which opens WorkoutDetailModal. */
export default function CalendarGrid({ monthDate, onChangeMonth, workoutsByDate, todayStr, onSelectDay, getLocalDateString }) {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onChangeMonth(-1)} className="p-2 rounded-chip hover:bg-surface2 dark:hover:bg-surface2-d text-muted dark:text-muted-d transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-display font-extrabold uppercase tracking-[0.5px] text-xl text-ink dark:text-ink-d">
          {monthDate.toLocaleString('default', { month: 'long' })} {monthDate.getFullYear()}
        </h3>
        <button onClick={() => onChangeMonth(1)} className="p-2 rounded-chip hover:bg-surface2 dark:hover:bg-surface2-d text-muted dark:text-muted-d transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-sans font-semibold text-muted dark:text-muted-d mb-2">
        {WEEKDAYS.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dateStr = getLocalDateString(d);
          const isCurrentMonth = d.getMonth() === monthDate.getMonth();
          const isToday = dateStr === todayStr;
          const workout = workoutsByDate.get(dateStr);
          const styles = workout ? getTypeStyles(workout.type) : null;
          const ringClass = isToday
            ? 'ring-2 ring-accent dark:ring-accent-d'
            : styles
              ? `ring-2 ${styles.ring}`
              : '';
          return (
            <div key={i} className="h-11 flex items-center justify-center">
              <button
                disabled={!workout}
                onClick={() => workout && onSelectDay(workout)}
                className={`w-9 h-9 flex items-center justify-center rounded-full font-sans text-sm transition-colors ${
                  !isCurrentMonth ? 'text-faint dark:text-muted-2d' : 'text-ink dark:text-ink-d'
                } ${styles ? `${styles.text} font-semibold` : ''} ${ringClass}`}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
