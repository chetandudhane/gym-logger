import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import { Dumbbell } from 'lucide-react';
import { db, appId } from '../lib/firebase';
import { getLocalDateString, getMonday, isWorkoutLogged } from '../lib/helpers';
import WorkoutHistoryRow from '../components/WorkoutHistoryRow';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import SectionLabel from '../components/SectionLabel';
import EmptyState from '../components/EmptyState';

/** Me tab (README §7): reverse-chronological history grouped by week, with a
 *  deliberate delete-confirm step the original app didn't have. */
export default function MyWorkoutsScreen({ user }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/workouts`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        const w = docSnap.data();
        if (isWorkoutLogged(w)) list.push({ id: docSnap.id, ...w });
      });
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  const groups = useMemo(() => {
    const thisMonday = getLocalDateString(getMonday(new Date()));
    const lastWeekRef = new Date();
    lastWeekRef.setDate(lastWeekRef.getDate() - 7);
    const lastMonday = getLocalDateString(getMonday(lastWeekRef));
    const buckets = { 'This week': [], 'Last week': [], Earlier: [] };
    workouts.forEach((w) => {
      const weekKey = getLocalDateString(getMonday(new Date(w.date + 'T00:00:00')));
      if (weekKey === thisMonday) buckets['This week'].push(w);
      else if (weekKey === lastMonday) buckets['Last week'].push(w);
      else buckets.Earlier.push(w);
    });
    return buckets;
  }, [workouts]);

  const handleDelete = async (workout) => {
    setDeletingId(workout.id);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/workouts`, workout.id));
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/workouts`, `${workout.date}_${user.uid}`));
      } catch { /* public workout might not exist, that's ok */ }
    } catch (err) {
      console.error('Error deleting workout:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-2 border-line dark:border-line-d border-t-accent dark:border-t-accent-d rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-5 md:px-10 md:py-10 max-w-[600px] mx-auto">
      {selectedWorkout && <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />}

      <h1 className="font-display font-extrabold uppercase tracking-[0.5px] text-[34px] leading-none text-ink dark:text-ink-d mb-5">
        My Workouts
      </h1>

      {workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts logged yet"
          subtitle="Start logging to see your workout history here."
        />
      ) : (
        Object.entries(groups).map(([label, list]) => {
          if (list.length === 0) return null;
          return (
            <div key={label} className="mb-6">
              <SectionLabel className="mb-2.5">{label}</SectionLabel>
              <div className="space-y-2.5">
                {list.map((workout) => (
                  <WorkoutHistoryRow
                    key={workout.id}
                    workout={workout}
                    meta={`${new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${workout.exercises.length} exercise${workout.exercises.length === 1 ? '' : 's'}`}
                    onView={setSelectedWorkout}
                    onDelete={handleDelete}
                    deleting={deletingId === workout.id}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
