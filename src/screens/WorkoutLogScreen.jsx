import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, collection, updateDoc, Timestamp } from 'firebase/firestore';
import { ChevronLeft, Plus, Save, X } from 'lucide-react';
import { db, appId } from '../lib/firebase';
import { getLocalDateString, sanitizeForId, getBaseName, toTitleCase, useDebouncedCallback } from '../lib/helpers';
import { exercisesByWorkout } from '../lib/presets';
import ExerciseCard from '../components/ExerciseCard';
import DateChip from '../components/DateChip';
import CalendarPickerModal from '../components/CalendarPickerModal';
import PrCelebration from '../components/PrCelebration';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import Button from '../components/Button';

/**
 * The core, high-frequency logging screen (README §3). This is always the
 * live/editable session — read-only viewing of past sessions (from Calendar,
 * Me, or Community) now goes through WorkoutDetailModal instead, so unlike
 * the original WorkoutLog this component no longer needs a `fromCalendar`
 * prop or a read-only mode. Everything else — autosave, history/PR tracking,
 * publish-to-feed, back-logging via the date chip — is a direct behavioral
 * port of the original.
 */
export default function WorkoutLogScreen({ user, workoutType, onBack }) {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [masterExerciseList, setMasterExerciseList] = useState([]);
  const [masterListLoaded, setMasterListLoaded] = useState(false);
  const [workoutData, setWorkoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [prevMap, setPrevMap] = useState({});
  const [prCelebration, setPrCelebration] = useState(null);

  const [isSavingExercise, setIsSavingExercise] = useState(false);

  const prMapRef = useRef({});
  const histMapRef = useRef({});
  const workoutDataRef = useRef(null);
  const metaReadyRef = useRef(false);
  const masterExerciseListRef = useRef([]);

  useEffect(() => { workoutDataRef.current = workoutData; }, [workoutData]);
  useEffect(() => { masterExerciseListRef.current = masterExerciseList; }, [masterExerciseList]);

  const workoutDocRef = useMemo(() => doc(db, `artifacts/${appId}/users/${user.uid}/workouts`, selectedDate), [user.uid, selectedDate]);
  const customWorkoutDocRef = useMemo(() => doc(db, `artifacts/${appId}/users/${user.uid}/customWorkouts`, workoutType), [user.uid, workoutType]);

  // Load (or lazily create) this type's exercise list. Presets fall back to
  // their starter list; a brand-new custom type (created empty from LogScreen)
  // legitimately loads an empty list here — masterListLoaded (not list length)
  // is what gates the next effect, so an empty type doesn't get stuck loading.
  useEffect(() => {
    let active = true;
    setMasterListLoaded(false);
    const getMasterList = async () => {
      const docSnap = await getDoc(customWorkoutDocRef);
      const stored = docSnap.exists() ? docSnap.data().exercises : null;
      const list = (stored && stored.length > 0) ? stored : (exercisesByWorkout[workoutType] || []);
      if (!docSnap.exists()) await setDoc(customWorkoutDocRef, { exercises: list });
      if (!active) return;
      setMasterExerciseList(list);
      setMasterListLoaded(true);
    };
    getMasterList();
    return () => { active = false; };
  }, [workoutType, customWorkoutDocRef]);

  // Load exercise history for previous-session display + PR baselines
  useEffect(() => {
    let active = true;
    metaReadyRef.current = false;
    const loadMeta = async () => {
      if (!masterExerciseList || masterExerciseList.length === 0) return;
      try {
        const historyCol = collection(db, `artifacts/${appId}/users/${user.uid}/exerciseHistory`);
        const docs = await Promise.all(masterExerciseList.map((n) => getDoc(doc(historyCol, sanitizeForId(n)))));
        if (!active) return;
        const prev = {};
        const pr = {};
        const hist = {};
        masterExerciseList.forEach((name, i) => {
          const d = docs[i].exists() ? docs[i].data() : null;
          hist[name] = d || {};
          pr[name] = d && d.pr && d.pr.maxWeight ? Number(d.pr.maxWeight) : 0;
          let p = null;
          if (d) {
            if (d.lastPerformed && d.lastPerformed.date !== selectedDate) p = d.lastPerformed;
            else if (d.previousPerformed) p = d.previousPerformed;
          }
          prev[name] = p;
        });
        prMapRef.current = pr;
        histMapRef.current = hist;
        metaReadyRef.current = true;
        setPrevMap(prev);
      } catch (err) {
        console.error('history load failed (non-fatal):', err);
      }
    };
    loadMeta();
    return () => { active = false; };
  }, [masterExerciseList, user.uid, selectedDate]);

  // Fetches-or-creates the day's workout doc. Deliberately keyed off
  // `masterListLoaded` (a one-shot flag) rather than `masterExerciseList`
  // itself: the list changes locally every time an exercise is added or
  // deleted, and if this effect re-ran on every one of those edits, its
  // getDoc(workoutDocRef) could race the setDoc that same edit just fired,
  // occasionally winning and clobbering the just-added/removed exercise with
  // stale data (the bug where a new exercise "disappeared" until a manual
  // refresh). masterExerciseListRef gives it the current list without being
  // a reactive dependency.
  useEffect(() => {
    if (!masterListLoaded) return;
    let active = true;
    const setupWorkout = async () => {
      setIsLoading(true);
      const docSnap = await getDoc(workoutDocRef);
      if (docSnap.exists() && docSnap.data().type === workoutType) {
        if (active) setWorkoutData(docSnap.data());
      } else {
        const list = masterExerciseListRef.current;
        const exerciseHistoryCollection = collection(db, `artifacts/${appId}/users/${user.uid}/exerciseHistory`);
        const historyPromises = list.map((name) => getDoc(doc(exerciseHistoryCollection, sanitizeForId(name))));
        const historyDocs = await Promise.all(historyPromises);
        const newExercises = list.map((name, index) => {
          const history = historyDocs[index].exists() ? historyDocs[index].data().lastPerformed : null;
          return {
            name,
            sets: history ? history.sets.map((s) => ({ ...s, completed: false })) : [{ reps: '', weight: '', completed: false }],
          };
        });
        const newWorkoutData = {
          type: workoutType,
          date: selectedDate,
          exercises: newExercises,
          note: '',
          ownerId: user.uid,
          ownerName: user.displayName,
        };
        await setDoc(workoutDocRef, newWorkoutData);
        if (active) setWorkoutData(newWorkoutData);
      }
      if (active) setIsLoading(false);
    };
    setupWorkout();
    return () => { active = false; };
  }, [masterListLoaded, user.uid, workoutType, selectedDate, workoutDocRef]);

  const publishWorkout = async (dataToPublish) => {
    const isLogged = dataToPublish.exercises.some((ex) => ex.sets.some((s) => s.reps && String(s.reps).length > 0));
    if (isLogged) {
      const publicDocRef = doc(db, `artifacts/${appId}/public/data/workouts`, `${dataToPublish.date}_${user.uid}`);
      await setDoc(publicDocRef, { ...dataToPublish, createdAt: Timestamp.now() });
    }
  };

  const handleExerciseUpdate = async (exerciseName, updatedData) => {
    if (!workoutData) return;
    const newExercises = workoutData.exercises.map((ex) => (ex.name === exerciseName ? { ...ex, ...updatedData } : ex));
    const newWorkoutData = { ...workoutData, exercises: newExercises };
    setWorkoutData(newWorkoutData);
    await updateDoc(workoutDocRef, { exercises: newExercises });
    await publishWorkout(newWorkoutData);

    // --- History + previous-session tracking + PR detection ---
    const sets = updatedData.sets || [];
    const historyDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/exerciseHistory`, sanitizeForId(exerciseName));

    if (!metaReadyRef.current || !histMapRef.current[exerciseName]) {
      try {
        await setDoc(historyDocRef, { name: exerciseName, lastPerformed: { date: selectedDate, sets } }, { merge: true });
      } catch (err) {
        console.error('history write skipped (non-fatal):', err);
      }
      return;
    }

    const existing = histMapRef.current[exerciseName] || {};
    let previousPerformed = existing.previousPerformed || null;
    if (existing.lastPerformed && existing.lastPerformed.date !== selectedDate) {
      previousPerformed = existing.lastPerformed;
    }

    const completedWeights = sets
      .filter((s) => s.completed && s.reps && s.weight !== '' && s.weight != null)
      .map((s) => Number(s.weight))
      .filter((w) => !isNaN(w));
    const candidate = completedWeights.length ? Math.max(...completedWeights) : 0;
    const prevPR = prMapRef.current[exerciseName] || 0;
    let prField = existing.pr || null;
    if (candidate > prevPR) {
      prField = { maxWeight: candidate, date: selectedDate };
      if (prevPR > 0) {
        setPrCelebration({ exercise: getBaseName(exerciseName), weight: candidate, previousBest: prevPR });
      }
      prMapRef.current[exerciseName] = candidate;
    }

    const newHist = {
      name: exerciseName,
      lastPerformed: { date: selectedDate, sets },
      previousPerformed,
      ...(prField ? { pr: prField } : {}),
    };
    histMapRef.current[exerciseName] = newHist;
    try {
      await setDoc(historyDocRef, newHist, { merge: true });
    } catch (err) {
      console.error('history write failed (non-fatal):', err);
    }
  };

  const persistNote = useDebouncedCallback(async (val) => {
    try {
      await setDoc(workoutDocRef, { note: val }, { merge: true });
      const current = workoutDataRef.current;
      if (current?.exercises?.some((ex) => ex.sets?.some((s) => s.reps && String(s.reps).length > 0))) {
        const publicDocRef = doc(db, `artifacts/${appId}/public/data/workouts`, `${selectedDate}_${user.uid}`);
        await setDoc(publicDocRef, { note: val }, { merge: true });
      }
    } catch (err) {
      console.error('note save failed (non-fatal):', err);
    }
  }, 700);

  const handleNoteChange = (val) => {
    setWorkoutData((prev) => ({
      ...(prev || { type: workoutType, date: selectedDate, exercises: [], ownerId: user.uid, ownerName: user.displayName }),
      note: val,
    }));
    persistNote(val);
  };

  const handleSaveNewExercise = async () => {
    // Title Case, matching the preset exercise list's style ("Barbell Bench
    // Press") the same way "Add workout type" auto-uppercases its input.
    const trimmedName = toTitleCase(newExerciseName);
    // Guards against the double-submit bug: a disabled-while-saving button
    // plus a same-name check, so a double-click (or clicking again because
    // the UI didn't seem to respond) can't write the exercise twice.
    if (!trimmedName || isSavingExercise) return;
    if (masterExerciseList.some((n) => n.toLowerCase() === trimmedName.toLowerCase())) {
      setNewExerciseName('');
      setIsAddingExercise(false);
      return;
    }
    setIsSavingExercise(true);
    try {
      const newExercise = { name: trimmedName, sets: [{ reps: '', weight: '', completed: false }] };
      const newExercises = [...(workoutData?.exercises || []), newExercise];
      const newMasterList = [...masterExerciseList, trimmedName];
      const newWorkoutData = { ...(workoutData || { type: workoutType, date: selectedDate, note: '', ownerId: user.uid, ownerName: user.displayName }), exercises: newExercises };
      setWorkoutData(newWorkoutData);
      setMasterExerciseList(newMasterList);
      setNewExerciseName('');
      setIsAddingExercise(false);
      await setDoc(customWorkoutDocRef, { exercises: newMasterList });
      await setDoc(workoutDocRef, newWorkoutData);
    } finally {
      setIsSavingExercise(false);
    }
  };

  // Removes an exercise entirely — from today's session AND from the type's
  // master list, so it doesn't reappear next time this workout type is
  // opened. exerciseHistory (PR data) is left alone in case the exercise
  // gets re-added later.
  const handleExerciseDelete = async (exerciseName) => {
    const newExercises = (workoutData?.exercises || []).filter((ex) => ex.name !== exerciseName);
    const newMasterList = masterExerciseList.filter((n) => n !== exerciseName);
    const newWorkoutData = workoutData ? { ...workoutData, exercises: newExercises } : null;
    if (newWorkoutData) setWorkoutData(newWorkoutData);
    setMasterExerciseList(newMasterList);
    await setDoc(customWorkoutDocRef, { exercises: newMasterList });
    if (newWorkoutData) {
      await updateDoc(workoutDocRef, { exercises: newExercises });
      await publishWorkout(newWorkoutData);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const isToday = selectedDate === getLocalDateString(new Date());
  const dateLabel = isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const exerciseCount = workoutData?.exercises?.length || 0;

  return (
    <div className="px-5 py-5 md:px-10 md:py-10 max-w-[600px] mx-auto">
      {prCelebration && <PrCelebration pr={prCelebration} onDone={() => setPrCelebration(null)} />}
      {isDatePickerOpen && (
        <CalendarPickerModal currentDate={selectedDate} onDateSelect={handleDateSelect} onClose={() => setIsDatePickerOpen(false)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} aria-label="Back" className="p-2 -ml-2 rounded-full text-ink dark:text-ink-d hover:bg-surface2 dark:hover:bg-surface2-d transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          <h2 className="font-display font-bold uppercase tracking-[0.5px] text-xl text-ink dark:text-ink-d leading-tight">
            {workoutType}
          </h2>
          <p className="text-[11.5px] font-sans text-muted dark:text-muted-d">
            {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
          </p>
        </div>
        <DateChip label={dateLabel} onClick={() => setIsDatePickerOpen(true)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-line dark:border-line-d border-t-accent dark:border-t-accent-d rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {workoutData?.exercises?.map((exercise, index) => (
              <ExerciseCard
                key={exercise.name + index}
                exercise={exercise}
                onExerciseUpdate={handleExerciseUpdate}
                onExerciseDelete={handleExerciseDelete}
                lastPerformed={prevMap[exercise.name]}
              />
            ))}
          </div>

          {exerciseCount === 0 && (
            <p className="text-center text-sm text-muted dark:text-muted-d py-6">
              No exercises yet — add your first one below.
            </p>
          )}

          <Card className="mt-4">
            <SectionLabel className="mb-2">Session note</SectionLabel>
            <textarea
              value={(workoutData && workoutData.note) || ''}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="How did it feel? e.g. felt strong, left shoulder twinge…"
              rows={2}
              className="w-full bg-transparent text-[13.5px] font-sans text-ink dark:text-ink-d placeholder:text-faint dark:placeholder:text-muted-2d focus:outline-none resize-none"
            />
          </Card>

          <div className="mt-4 mb-8">
            {isAddingExercise ? (
              <Card className="flex items-center gap-2">
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNewExercise()}
                  placeholder="Enter new exercise name"
                  autoFocus
                  disabled={isSavingExercise}
                  className="w-full bg-transparent text-sm font-sans text-ink dark:text-ink-d focus:outline-none disabled:opacity-60"
                />
                <button onClick={handleSaveNewExercise} disabled={isSavingExercise} className="p-2 text-accent dark:text-accent-d hover:bg-accent-soft dark:hover:bg-accent-soft-d rounded-chip transition-colors disabled:opacity-50">
                  <Save size={18} />
                </button>
                <button onClick={() => setIsAddingExercise(false)} disabled={isSavingExercise} className="p-2 text-muted dark:text-muted-d hover:bg-surface2 dark:hover:bg-surface2-d rounded-chip transition-colors disabled:opacity-50">
                  <X size={18} />
                </button>
              </Card>
            ) : (
              <Button variant="dashed" fullWidth onClick={() => setIsAddingExercise(true)} className="justify-center">
                <Plus size={16} /> Add exercise
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
