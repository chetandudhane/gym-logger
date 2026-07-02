import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { getLocalDateString, getMonday } from '../lib/helpers';
import { DEFAULT_WEEKLY_TARGET } from '../lib/presets';
import Card from './Card';
import WeeklyGoalModal from './WeeklyGoalModal';

/** Inverse ink card: flame + big condensed streak count + this-week session
 *  dots. Streak math and dot count both use the user's weekly goal
 *  (user.weeklyGoal, falling back to DEFAULT_WEEKLY_TARGET) instead of a
 *  hardcoded constant. Tapping the "X of Y this week" area opens
 *  WeeklyGoalModal to change it — `onUpdateWeeklyGoal` is optional so this
 *  component still renders read-only if a caller doesn't wire it up. */
export default function StreakBanner({ user, onUpdateWeeklyGoal }) {
  const [info, setInfo] = useState({ streak: 0, weekCount: 0 });
  const [editingGoal, setEditingGoal] = useState(false);
  const weeklyGoal = user?.weeklyGoal || DEFAULT_WEEKLY_TARGET;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/workouts`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = {}; // weekKey -> sessions
      snapshot.forEach((docSnap) => {
        const w = docSnap.data();
        const logged = w?.exercises?.some((ex) => ex.sets?.some((s) => s.reps && String(s.reps).length > 0));
        if (logged && w.date) {
          const key = getLocalDateString(getMonday(new Date(w.date + 'T00:00:00')));
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      const curMonday = getMonday(new Date());
      const curKey = getLocalDateString(curMonday);
      const weekCount = counts[curKey] || 0;

      let streak = 0;
      const cursor = new Date(curMonday);
      // Current week still in progress: don't break the streak if target not yet met
      if ((counts[curKey] || 0) < weeklyGoal) {
        cursor.setDate(cursor.getDate() - 7);
      }
      while ((counts[getLocalDateString(cursor)] || 0) >= weeklyGoal) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 7);
      }
      setInfo({ streak, weekCount });
    }, () => {});
    return () => unsubscribe();
    // Re-subscribes when weeklyGoal changes so a just-changed goal is
    // reflected immediately rather than waiting for the next Firestore event.
  }, [user, weeklyGoal]);

  const handleSaveGoal = (newGoal) => {
    setEditingGoal(false);
    if (onUpdateWeeklyGoal && newGoal !== weeklyGoal) onUpdateWeeklyGoal(newGoal);
  };

  return (
    <Card variant="inverse" className="flex items-center justify-between gap-3">
      {editingGoal && (
        <WeeklyGoalModal currentGoal={weeklyGoal} onSave={handleSaveGoal} onClose={() => setEditingGoal(false)} />
      )}
      <div>
        <p className="text-[11px] font-sans font-bold uppercase tracking-[1.4px] text-muted-d">Weekly streak</p>
        <p className="mt-1.5 flex items-baseline gap-1.5">
          <Flame className="text-accent dark:text-accent-d shrink-0 self-center" size={20} />
          <span className="font-display font-extrabold text-3xl leading-none">{info.streak}</span>
          <span className="font-sans text-sm text-muted-d">week{info.streak === 1 ? '' : 's'}</span>
        </p>
      </div>
      <button
        onClick={() => onUpdateWeeklyGoal && setEditingGoal(true)}
        className="flex flex-col items-end gap-1.5 max-w-[110px]"
        aria-label="Change weekly goal"
      >
        <div className="flex items-center flex-wrap justify-end gap-1">
          {Array.from({ length: weeklyGoal }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i < info.weekCount ? 'bg-accent dark:bg-accent-d' : 'border border-muted-d'}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-muted-d">{info.weekCount} of {weeklyGoal} this week</span>
      </button>
    </Card>
  );
}
