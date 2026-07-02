import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { db, appId } from '../lib/firebase';
import { relativeTimeFromNow, summarizeWorkoutForFeed } from '../lib/helpers';
import FeedCard from '../components/FeedCard';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import EmptyState from '../components/EmptyState';

/** Community tab (README §8): global public feed, newest first. Only
 *  workouts with ≥1 real logged set ever land here (enforced upstream by
 *  publishWorkout in WorkoutLogScreen), so no extra filtering needed. */
export default function CommunityScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    const q = query(collection(db, `artifacts/${appId}/public/data/workouts`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkouts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-2 border-line dark:border-line-d border-t-accent dark:border-t-accent-d rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-5 md:px-10 md:py-10 max-w-[600px] mx-auto">
      {selectedWorkout && <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} showOwner />}

      <h1 className="font-display font-extrabold uppercase tracking-[0.5px] text-[34px] leading-none text-ink dark:text-ink-d mb-5">
        Community
      </h1>

      {workouts.length === 0 ? (
        <EmptyState icon={Users} title="No community workouts yet" subtitle="Be the first to log one!" />
      ) : (
        <div className="space-y-2.5">
          {workouts.map((workout) => (
            <FeedCard
              key={workout.id}
              workout={workout}
              summary={summarizeWorkoutForFeed(workout)}
              relativeTime={workout.createdAt?.toDate ? relativeTimeFromNow(workout.createdAt.toDate()) : ''}
              onClick={() => setSelectedWorkout(workout)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
