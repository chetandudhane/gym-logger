import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, appId } from './firebase';
import { PRESET_TYPES } from './presets';

/**
 * Drives the Log tab's "choose a workout" list (README §2 — the key layout
 * change). Renders the 4 presets first (even before their customWorkouts doc
 * exists, since it's created lazily on first open), then any additional
 * custom types found in the user's customWorkouts collection, alphabetically.
 * For each type, also surfaces "last performed" meta (date + exercise count)
 * derived from the user's workouts collection, for the row's meta line.
 */
export function useWorkoutTypesMeta(user) {
  const [customTypes, setCustomTypes] = useState([]);
  const [lastByType, setLastByType] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/customWorkouts`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomTypes(snapshot.docs.map((d) => d.id));
    }, () => {});
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/workouts`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map = {};
      snapshot.forEach((docSnap) => {
        const w = docSnap.data();
        const loggedExercises = (w.exercises || []).filter((ex) => ex.sets?.some((s) => s.reps && String(s.reps).length > 0));
        if (loggedExercises.length === 0 || !w.type) return;
        const existing = map[w.type];
        if (!existing || w.date > existing.date) {
          map[w.type] = { date: w.date, exerciseCount: loggedExercises.length };
        }
      });
      setLastByType(map);
    }, () => {});
    return () => unsubscribe();
  }, [user]);

  const allTypes = Array.from(new Set([...PRESET_TYPES, ...customTypes]));
  const ordered = [
    ...PRESET_TYPES.filter((t) => allTypes.includes(t)),
    ...allTypes.filter((t) => !PRESET_TYPES.includes(t)).sort(),
  ];

  return ordered.map((type) => ({
    type,
    isPreset: PRESET_TYPES.includes(type),
    last: lastByType[type] || null,
  }));
}
