import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { getLocalDateString, isWorkoutLogged } from '../lib/helpers';
import { PRESET_TYPES } from '../lib/presets';
import CalendarGrid from '../components/CalendarGrid';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import { getTypeStyles } from '../components/workoutTypeTheme';

const PRESET_LABELS = { PUSH: 'Push', PULL: 'Pull', LEGS: 'Legs', OTHER: 'Other' };

/** Calendar tab (README §6): month grid with type-tinted logged days + a
 *  legend. Tapping a colored day opens the shared read-only detail modal.
 *  The legend always shows the 4 presets, plus any custom workout types that
 *  actually appear in the loaded history — so a custom type's auto-assigned
 *  color is still explained, not just silently different. */
export default function CalendarScreen({ user }) {
  const [monthDate, setMonthDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/workouts`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const days = new Map();
      snapshot.forEach((docSnap) => {
        const w = docSnap.data();
        if (isWorkoutLogged(w)) days.set(docSnap.id, w);
      });
      setWorkoutDays(days);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  const todayStr = getLocalDateString(new Date());

  const legendTypes = useMemo(() => {
    const customTypes = Array.from(new Set(Array.from(workoutDays.values()).map((w) => w.type)))
      .filter((t) => !PRESET_TYPES.includes(t))
      .sort();
    return [...PRESET_TYPES, ...customTypes];
  }, [workoutDays]);

  return (
    <div className="px-5 py-5 md:px-10 md:py-10 max-w-[600px] mx-auto">
      {selectedWorkout && <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />}

      <h1 className="font-display font-extrabold uppercase tracking-[0.5px] text-[34px] leading-none text-ink dark:text-ink-d mb-5">
        Calendar
      </h1>

      <CalendarGrid
        monthDate={monthDate}
        onChangeMonth={(offset) => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1))}
        workoutsByDate={workoutDays}
        todayStr={todayStr}
        onSelectDay={setSelectedWorkout}
        getLocalDateString={getLocalDateString}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 bg-surface dark:bg-surface-d border border-line dark:border-line-d rounded-card p-4">
        {legendTypes.map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ring-2 ${getTypeStyles(type).ring}`} />
            <span className="text-[11.5px] font-sans font-medium text-muted dark:text-muted-d">{PRESET_LABELS[type] || type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-accent dark:ring-accent-d" />
          <span className="text-[11.5px] font-sans font-medium text-muted dark:text-muted-d">Today</span>
        </div>
      </div>

      {loading && <p className="text-center text-sm text-muted dark:text-muted-d mt-3">Loading calendar…</p>}
    </div>
  );
}
