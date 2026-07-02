import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, updateDoc, query, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Calendar, Dumbbell, Plus, Trash2, CheckCircle, XCircle, Save, Shapes, CalendarIcon, Users, LogOut, UserPlus } from 'lucide-react';

// --- Firebase Configuration ---
// This is your specific configuration, hardcoded for deployment.
const firebaseConfig = {
    apiKey: "AIzaSyDjVRyOlc5PFfxbafBjQzlP123vql1vSXQ",
    authDomain: "gym-logger-by-cd.firebaseapp.com",
    projectId: "gym-logger-by-cd",
    storageBucket: "gym-logger-by-cd.firebasestorage.app",
    messagingSenderId: "520191512916",
    appId: "1:520191512916:web:819d1fb4913a9c278c78c1",
    measurementId: "G-2XZ0BKT8MF"
};
const appId = 'default-gym-log'; // A simple identifier for our app's data collections.

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Custom SVG Icons ---
const BenchPressIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 14h20" /><path d="M4 14v-4" /><path d="M20 14v-4" /><path d="M6 10h12" /><path d="M12 10V4" /><path d="M10 4h4" /><path d="M12 14l-2 4h4l-2-4z" /><path d="M10 18h4" />
    </svg>
);
const LatPulldownIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8" /><path d="M4 10h16" /><path d="M12 10l-2 4h4l-2-4z" /><path d="M10 14h4" /><path d="M12 18v2" /><path d="M10 20h4" /><path d="M6 22h12" /><path d="M7 14l-3 3" /><path d="M17 14l3 3" />
    </svg>
);
const SquatIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4h-2a2 2 0 00-2 2v2" /><path d="M12 4h2a2 2 0 012 2v2" /><path d="M4 8h16" /><path d="M12 8v8" /><path d="M12 16l-2 4" /><path d="M12 16l2 4" /><path d="M10 20h4" />
    </svg>
);

// --- Pre-defined Exercise Lists (as a fallback) ---
const exercisesByWorkout = {
  PUSH: ["Barbell Bench Press Flat/Incline", "DB Bench Press Flat/Incline", "Hi-to-Low Crossovers", "DB Shoulder Press", "Side Lateral Raises Single/One&Half", "Lying Tricep Extension", "DB Waiter's Curls", "Rotater Cuff External Rotator"],
  PULL: ["Barbell Deadlifts", "Chest supported Rows", "Lat Pulldown", "Seated Rows", "DB Lat Pullovers", "Biceps DB Curls", "Biceps Barbell Curls", "Biceps Cable Curls", "Biceps Cable Curls Single Hand", "Overhead Triceps Extension", "Angels and Devils"],
  LEGS: ["Barbell Squats", "Barbell Hip Thrusts", "Leg Extensions", "Seated Hamstrings", "DB Alternating Reverse Lunges", "DB Single leg RDLs", "Calf Raises", "Plank"],
  OTHER: []
};

// --- Helper Functions ---
const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const sanitizeForId = (str) => str.replace(/\//g, '_');
function useDebounce(callback, delay) {
    const debouncedFn = useCallback((...args) => {
        const timer = setTimeout(() => { callback(...args); }, delay);
        return () => clearTimeout(timer);
    }, [callback, delay]);
    return debouncedFn;
}

// --- Components ---

const SetRow = ({ set, setIndex, onSetChange, onSetDelete, readOnly = false }) => {
    const [reps, setReps] = useState(set.reps || '');
    const [weight, setWeight] = useState(set.weight || '');
    const [isSetCompleted, setIsSetCompleted] = useState(set.completed || false);

    const debouncedSave = useDebounce((newReps, newWeight, completed) => {
        if (!readOnly) onSetChange(setIndex, { reps: newReps, weight: newWeight, completed });
    }, 500);

    useEffect(() => {
        setReps(set.reps || '');
        setWeight(set.weight || '');
        setIsSetCompleted(set.completed || false);
    }, [set]);

    const handleRepsChange = (e) => { const newReps = e.target.value; setReps(newReps); debouncedSave(newReps, weight, isSetCompleted); };
    const handleWeightChange = (e) => { const newWeight = e.target.value; setWeight(newWeight); debouncedSave(reps, newWeight, isSetCompleted); };
    const toggleComplete = () => { if (!readOnly) { const newCompleted = !isSetCompleted; setIsSetCompleted(newCompleted); onSetChange(setIndex, { reps, weight, completed: newCompleted }); } };

    return (
        <div className={`flex items-center space-x-2 md:space-x-4 p-2 rounded-lg transition-all duration-300 ${isSetCompleted ? 'bg-sky-100/50' : 'bg-gray-100/50'}`}>
            <span className="font-mono text-sm text-gray-500 w-6 text-center">{setIndex + 1}</span>
            <input type="number" placeholder="Reps" value={reps} onChange={handleRepsChange} disabled={readOnly} className="w-full p-2 text-center bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition disabled:bg-gray-100" aria-label={`Reps for set ${setIndex + 1}`} />
            <span className="text-gray-400 text-sm">x</span>
            <input type="number" placeholder="kg/lbs" value={weight} onChange={handleWeightChange} disabled={readOnly} className="w-full p-2 text-center bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition disabled:bg-gray-100" aria-label={`Weight for set ${setIndex + 1}`} />
            <button onClick={toggleComplete} disabled={readOnly} className="p-2 text-gray-500 hover:text-sky-500 transition-colors disabled:opacity-50">
                {isSetCompleted ? <CheckCircle className="text-sky-500" /> : <CheckCircle />}
            </button>
            {!readOnly && <button onClick={() => onSetDelete(setIndex)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>}
        </div>
    );
};

const ExerciseItem = ({ exercise, onExerciseUpdate, readOnly = false }) => {
    const [sets, setSets] = useState(exercise.sets || []);
    const { baseName, options } = useMemo(() => {
        const nameParts = exercise.name.split(' ');
        const optionsPart = nameParts.find(p => p.includes('/'));
        if (optionsPart) return { baseName: exercise.name.replace(optionsPart, '').trim(), options: optionsPart.split('/') };
        return { baseName: exercise.name, options: [] };
    }, [exercise.name]);

    const [selectedOption, setSelectedOption] = useState(() => {
        if (options.length > 0) {
            const lastSet = exercise.sets && exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1] : null;
            return lastSet?.variant && options.includes(lastSet.variant) ? lastSet.variant : options[0];
        }
        return null;
    });

    useEffect(() => { setSets(exercise.sets || []); }, [exercise.sets]);
    const updateParent = (newSets) => { if (!readOnly) onExerciseUpdate(exercise.name, { sets: newSets }); };
    const handleOptionChange = (newOption) => { setSelectedOption(newOption); const updatedSets = sets.map(s => ({ ...s, variant: newOption })); setSets(updatedSets); updateParent(updatedSets); };
    const handleSetChange = (index, updatedSet) => { const newSets = [...sets]; newSets[index] = { ...newSets[index], ...updatedSet, variant: selectedOption }; setSets(newSets); updateParent(newSets); };
    const addSet = () => { if (!readOnly) { const lastSet = sets.length > 0 ? sets[sets.length - 1] : { reps: '', weight: '', completed: false }; const newSet = { ...lastSet, completed: false, variant: selectedOption }; const newSets = [...sets, newSet]; setSets(newSets); updateParent(newSets); } };
    const deleteSet = (index) => { if (!readOnly) { const newSets = sets.filter((_, i) => i !== index); setSets(newSets); updateParent(newSets); } };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80">
            <h3 className="font-semibold text-gray-800 mb-2">{baseName}</h3>
            {options.length > 0 && (
                <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-1 rounded-lg">
                    {options.map(opt => <button key={opt} onClick={() => handleOptionChange(opt)} disabled={readOnly} className={`w-full text-center text-sm font-medium py-1.5 rounded-md transition-colors ${selectedOption === opt ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'} disabled:bg-gray-100 disabled:text-gray-400`}>{opt.replace(/&/g, ' & ')}</button>)}
                </div>
            )}
            <div className="space-y-2">{sets.map((set, index) => <SetRow key={index} set={set} setIndex={index} onSetChange={handleSetChange} onSetDelete={deleteSet} readOnly={readOnly} />)}</div>
            {!readOnly && <button onClick={addSet} className="mt-3 flex items-center justify-center w-full text-sm text-teal-600 hover:bg-teal-50 p-2 rounded-md transition-colors"><Plus size={16} className="mr-1" /> Add Set</button>}
        </div>
    );
};

const DatePickerModal = ({ currentDate, onDateSelect, onclose }) => {
    const [viewDate, setViewDate] = useState(new Date(currentDate));
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const days = [];
    for (let i = 0; i < startOfMonth.getDay(); i++) days.push(null);
    for (let i = 1; i <= new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate(); i++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
    const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onclose}>
            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                    <h3 className="font-semibold text-lg text-gray-700">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">{days.map((day, i) => <div key={i} className="h-10 flex items-center justify-center">{day && <button onClick={() => onDateSelect(getLocalDateString(day))} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${getLocalDateString(day) === currentDate ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'}`}>{day.getDate()}</button>}</div>)}</div>
            </div>
        </div>
    );
};

const WorkoutLog = ({ user, workoutType, onBack, selectedDate: initialDate, fromCalendar = false }) => {
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState("");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(initialDate || getLocalDateString(new Date()));

    useEffect(() => {
        const setupWorkout = async () => {
            if (!user.uid) return;
            setIsLoading(true);
            try {
                const customWorkoutDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/customWorkouts`, workoutType);
                const masterListSnap = await getDoc(customWorkoutDocRef);
                const masterExerciseList = masterListSnap.exists() ? masterListSnap.data().exercises : exercisesByWorkout[workoutType];

                if (!masterListSnap.exists()) {
                    await setDoc(customWorkoutDocRef, { exercises: masterExerciseList });
                }

                const workoutDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/workouts`, selectedDate);
                const workoutSnap = await getDoc(workoutDocRef);

                if (workoutSnap.exists() && workoutSnap.data().type === workoutType) {
                    setWorkoutData(workoutSnap.data());
                } else {
                    const exerciseHistoryCollection = collection(db, `artifacts/${appId}/users/${user.uid}/exerciseHistory`);
                    const historyPromises = masterExerciseList.map(name => getDoc(doc(exerciseHistoryCollection, sanitizeForId(name))));
                    const historyDocs = await Promise.all(historyPromises);
                    const newExercises = masterExerciseList.map((name, index) => {
                        const history = historyDocs[index].exists() ? historyDocs[index].data().lastPerformed : null;
                        return { name, sets: history ? history.sets.map(s => ({...s, completed: false})) : [{ reps: '', weight: '', completed: false }] };
                    });
                    const newWorkoutData = { type: workoutType, date: selectedDate, exercises: newExercises, ownerId: user.uid, ownerName: user.displayName };
                    if (!fromCalendar) {
                        await setDoc(workoutDocRef, newWorkoutData);
                    }
                    setWorkoutData(newWorkoutData);
                }
            } catch (error) {
                console.error("Error setting up workout:", error);
            } finally {
                setIsLoading(false);
            }
        };

        setupWorkout();
    }, [user.uid, user.displayName, workoutType, selectedDate, fromCalendar]);

    const publishWorkout = async (dataToPublish) => { const isLogged = dataToPublish.exercises.some(ex => ex.sets.some(s => s.reps && String(s.reps).length > 0)); if (isLogged) { const publicDocRef = doc(db, `artifacts/${appId}/public/data/workouts`, `${dataToPublish.date}_${user.uid}`); await setDoc(publicDocRef, { ...dataToPublish, createdAt: Timestamp.now() }); } };
    const handleExerciseUpdate = async (exerciseName, updatedData) => { if (workoutData) { const newExercises = workoutData.exercises.map(ex => ex.name === exerciseName ? { ...ex, ...updatedData } : ex); const newWorkoutData = { ...workoutData, exercises: newExercises }; setWorkoutData(newWorkoutData); const workoutDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/workouts`, selectedDate); await updateDoc(workoutDocRef, { exercises: newExercises }); await publishWorkout(newWorkoutData); const historyDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/exerciseHistory`, sanitizeForId(exerciseName)); await setDoc(historyDocRef, { name: exerciseName, lastPerformed: { date: selectedDate, sets: updatedData.sets }}, { merge: true }); } };
    const handleSaveNewExercise = async () => { const trimmedName = newExerciseName.trim(); if (trimmedName && workoutData) { const newExercise = { name: trimmedName, sets: [{ reps: '', weight: '', completed: false }] }; const newExercises = [...workoutData.exercises, newExercise]; const newMasterList = [...workoutData.exercises.map(e => e.name), trimmedName]; const newWorkoutData = { ...workoutData, exercises: newExercises }; setWorkoutData(newWorkoutData); setNewExerciseName(""); setIsAddingExercise(false); const customWorkoutDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/customWorkouts`, workoutType); await setDoc(customWorkoutDocRef, { exercises: newMasterList }); const workoutDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/workouts`, selectedDate); await setDoc(workoutDocRef, newWorkoutData); } };
    const handleDateSelect = (date) => { setSelectedDate(date); setIsDatePickerOpen(false); };

    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div></div>;

    return (
        <div className="p-4 md:p-6">
            {isDatePickerOpen && <DatePickerModal currentDate={selectedDate} onDateSelect={handleDateSelect} onclose={() => setIsDatePickerOpen(false)} />}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-teal-600 hover:text-teal-800 transition-colors">&larr; Back</button>
                <h2 className="text-2xl font-bold text-gray-800">{workoutType} Day</h2>
                <button onClick={() => !fromCalendar && setIsDatePickerOpen(true)} disabled={fromCalendar} className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 p-2 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"><CalendarIcon size={16} /><span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></button>
            </div>
            <div className="space-y-4">{workoutData && workoutData.exercises.map((exercise, index) => <ExerciseItem key={exercise.name + index} exercise={exercise} onExerciseUpdate={handleExerciseUpdate} readOnly={fromCalendar} />)}</div>
            {!fromCalendar && <div className="mt-6">{isAddingExercise ? <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 flex items-center gap-2"><input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} placeholder="Enter new exercise name" className="w-full p-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" autoFocus={true} /><button onClick={handleSaveNewExercise} className="p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"><Save size={20} /></button><button onClick={() => setIsAddingExercise(false)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"><XCircle size={20} /></button></div> : <button onClick={() => setIsAddingExercise(true)} className="flex items-center justify-center w-full text-sm text-teal-600 border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50 p-3 rounded-md transition-colors"><Plus size={16} className="mr-1" /> Add Exercise</button>}</div>}
        </div>
    );
};

const WorkoutSelector = ({ onSelect }) => {
    const workoutTypes = [{ name: 'PUSH', icon: <BenchPressIcon className="w-8 h-8"/> }, { name: 'PULL', icon: <LatPulldownIcon className="w-8 h-8"/> }, { name: 'LEGS', icon: <SquatIcon className="w-8 h-8"/> }, { name: 'OTHER', icon: <Shapes className="w-8 h-8"/> }];
    const colors = { PUSH: 'bg-sky-100 hover:bg-sky-200 text-sky-800', PULL: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800', LEGS: 'bg-teal-100 hover:bg-teal-200 text-teal-800', OTHER: 'bg-gray-100 hover:bg-gray-200 text-gray-800' };
    return <div className="flex flex-col items-center justify-center h-full p-8"><Dumbbell className="w-16 h-16 mb-6 text-teal-500" /><h1 className="text-3xl font-bold text-gray-800 mb-2">Log your workout</h1><p className="text-gray-500 mb-8">Choose your workout type for today.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">{workoutTypes.map(type => <button key={type.name} onClick={() => onSelect(type.name)} className={`p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm flex flex-col items-center justify-center gap-2 ${colors[type.name]}`}>{type.icon}<span className="text-2xl font-semibold">{type.name}</span></button>)}</div></div>;
};

const CalendarView = ({ user, onBack, onViewWorkout }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [workoutDays, setWorkoutDays] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const workoutColors = { PUSH: 'bg-sky-200', PULL: 'bg-indigo-200', LEGS: 'bg-teal-200', OTHER: 'bg-gray-200' };
    useEffect(() => { if (user) { setLoading(true); const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/workouts`)); const unsubscribe = onSnapshot(q, (snapshot) => { const daysWithLoggedWorkouts = new Map(); snapshot.forEach(doc => { const workoutData = doc.data(); if (workoutData?.exercises?.some(ex => ex.sets?.some(s => s.reps && String(s.reps).length > 0))) { daysWithLoggedWorkouts.set(doc.id, workoutData); } }); setWorkoutDays(daysWithLoggedWorkouts); setLoading(false); }, () => setLoading(false)); return () => unsubscribe(); } }, [user]);
    
    const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    const todayStr = getLocalDateString(new Date());
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(startDate); d.setDate(d.getDate() + i); return d; });

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800">Workout Calendar</h2><button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 transition-colors">Back to logging</button></div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80">
                <div className="flex items-center justify-between mb-4"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button><h3 className="font-semibold text-lg text-gray-700">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button></div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">{days.map((d, i) => { const dateStr = getLocalDateString(d); const isCurrentMonth = d.getMonth() === currentDate.getMonth(); const isToday = dateStr === todayStr; const workout = workoutDays.get(dateStr); return <div key={i} className={`h-12 flex items-center justify-center rounded-lg`}><button disabled={!workout} onClick={() => workout && onViewWorkout(workout)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'} ${isToday ? 'ring-2 ring-teal-500' : ''} ${workout ? `${workoutColors[workout.type]} hover:ring-2 hover:ring-offset-2 hover:ring-teal-400` : ''}`}>{d.getDate()}</button></div>; })}</div>
                {loading && <div className="text-center text-sm text-gray-400 mt-2">Loading calendar...</div>}
            </div>
        </div>
    );
};

const CommunityFeed = ({ onBack }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    useEffect(() => {
        const q = query(collection(db, `artifacts/${appId}/public/data/workouts`), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => { const fetchedWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setWorkouts(fetchedWorkouts); setLoading(false); }, () => setLoading(false));
        return () => unsubscribe();
    }, []);
    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div></div>;
    return (
        <div className="p-4 md:p-6">
            {selectedWorkout && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setSelectedWorkout(null)}>
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-800">{selectedWorkout.type} Day</h2><span className="text-sm text-gray-500">{new Date(selectedWorkout.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                            <p className="text-xs text-gray-500 mb-4 break-all">User: {selectedWorkout.ownerName}</p>
                            <div className="space-y-4">{selectedWorkout.exercises.map((exercise, index) => <ExerciseItem key={index} exercise={exercise} readOnly={true} />)}</div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800">Community Feed</h2></div>
            <div className="space-y-4">
                {workouts.length === 0 && !loading && <p className="text-center text-gray-500">No community workouts yet. Be the first to log one!</p>}
                {workouts.map(workout => (
                    <div key={workout.id} onClick={() => setSelectedWorkout(workout)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 hover:shadow-md hover:border-teal-300 cursor-pointer transition-all">
                        <div className="flex justify-between items-center">
                            <div><p className="font-semibold text-teal-700">{workout.type} Day</p><p className="text-xs text-gray-500 mt-1 break-all">User: {workout.ownerName}</p></div>
                            <div className="text-right"><p className="text-sm font-medium text-gray-800">{new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p><p className="text-xs text-gray-400">{new Date(workout.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfileSelector = ({ onProfileSelect, onShowCreate }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const profilesCol = collection(db, `artifacts/${appId}/public/data/profiles`);
        const q = query(profilesCol, orderBy("name"));
        const unsubscribe = onSnapshot(q, snapshot => {
            const profilesData = snapshot.docs.map(doc => ({ ...doc.data() }));
            setProfiles(profilesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching profiles:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><Dumbbell className="w-16 h-16 text-teal-500 animate-bounce" /></div>;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md text-center">
                <Dumbbell className="w-20 h-20 mb-6 text-teal-500 mx-auto" />
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
                <p className="text-gray-500 mb-8">Select your profile to continue.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4 p-1">
                    {profiles.map(p => <button key={p.ownerId} onClick={() => onProfileSelect(p)} className="w-full bg-white p-4 rounded-lg text-lg font-semibold text-gray-700 hover:bg-teal-100 border border-gray-200 transition">{p.name}</button>)}
                </div>
                <button onClick={onShowCreate} className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white p-4 rounded-lg text-lg font-semibold hover:bg-teal-600 transition"><UserPlus size={24}/> Create New Profile</button>
            </div>
        </div>
    );
};


const CreateProfile = ({ user, onProfileCreated, onBack }) => {
    const [alias, setAlias] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleCreateProfile = async () => {
        const trimmedAlias = alias.trim();
        if (!trimmedAlias) { setError('Alias cannot be empty.'); return; }
        setLoading(true);
        setError('');
        const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
        const publicProfileDocRef = doc(db, `artifacts/${appId}/public/data/profiles`, user.uid);
        try {
            const profileData = { displayName: trimmedAlias, createdAt: Timestamp.now() };
            const publicProfileData = { name: trimmedAlias, ownerId: user.uid };
            
            const batch = writeBatch(db);
            batch.set(profileDocRef, profileData);
            batch.set(publicProfileDocRef, publicProfileData);
            await batch.commit();

            onProfileCreated({ uid: user.uid, ...profileData });
        } catch (err) { console.error("Error creating profile:", err); setError('Could not create profile. Please try again.'); setLoading(false); }
    };
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
            <div className="w-full max-w-sm text-center">
                <Dumbbell className="w-20 h-20 mb-6 text-teal-500 mx-auto" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Profile</h1>
                <p className="text-gray-500 mb-8">Choose a unique public alias to share your progress.</p>
                <div className="flex gap-2">
                    <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Enter your alias" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400" />
                    <button onClick={handleCreateProfile} disabled={loading} className="bg-teal-500 text-white p-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:bg-gray-400">
                        {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={24}/>}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button onClick={onBack} className="mt-4 text-sm text-gray-500 hover:text-teal-600">← Back to profiles</button>
            </div>
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [authStatus, setAuthStatus] = useState('loading'); // loading, needsProfile, creatingProfile, ready
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [currentView, setCurrentView] = useState('log');
    const [viewingWorkoutFromCalendar, setViewingWorkoutFromCalendar] = useState(null);

    useEffect(() => {
        const localProfile = localStorage.getItem('gymLogUserProfile');
        if (localProfile) {
            setUser(JSON.parse(localProfile));
            setAuthStatus('ready');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setAuthStatus('needsProfile');
            } else {
                signInAnonymously(auth).catch(err => {
                    console.error("Anonymous sign-in failed", err);
                    setAuthStatus('error');
                });
            }
        });
        return () => unsubscribe();
    }, []);
    
    const handleLogin = (profile) => {
        localStorage.setItem('gymLogUserProfile', JSON.stringify(profile));
        setUser(profile);
        setAuthStatus('ready');
    };
    
    const handleProfileSelect = async (profile) => {
        const fullUserProfile = { uid: profile.ownerId, displayName: profile.name };
        handleLogin(fullUserProfile);
    };

    const handleSignOut = () => {
        localStorage.removeItem('gymLogUserProfile');
        setUser(auth.currentUser); 
        setAuthStatus('needsProfile');
        setSelectedWorkout(null);
        setViewingWorkoutFromCalendar(null);
        setCurrentView('log');
    };
    
    const handleSelectWorkout = (type) => {
        setSelectedWorkout(type);
        setViewingWorkoutFromCalendar(null);
    };
    const handleBackToSelector = () => {
        setSelectedWorkout(null);
        setViewingWorkoutFromCalendar(null);
    };
    const handleViewWorkoutFromCalendar = (workout) => {
        setViewingWorkoutFromCalendar(workout);
        setCurrentView('log');
    };
    
    if (authStatus === 'loading') {
        return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="text-center"><Dumbbell className="w-16 h-16 text-teal-500 animate-bounce" /><p className="text-gray-600 mt-4">Getting things ready...</p></div></div>;
    }
    if (authStatus === 'needsProfile') {
        return <ProfileSelector onProfileSelect={handleProfileSelect} onShowCreate={() => setAuthStatus('creatingProfile')} />;
    }
    if (authStatus === 'creatingProfile') {
        return <CreateProfile user={user} onProfileCreated={handleLogin} onBack={() => setAuthStatus('needsProfile')} />;
    }
    if (!user || authStatus === 'error') {
        return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="text-center"><p className="text-red-500">Authentication session could not be started. Please refresh the page.</p></div></div>;
    }

    const renderView = () => {
        if (viewingWorkoutFromCalendar) {
            return <WorkoutLog user={user} workoutType={viewingWorkoutFromCalendar.type} onBack={handleBackToSelector} selectedDate={viewingWorkoutFromCalendar.date} fromCalendar={true} />;
        }
        switch (currentView) {
            case 'log':
                return selectedWorkout ? <WorkoutLog user={user} workoutType={selectedWorkout} onBack={handleBackToSelector} /> : <WorkoutSelector onSelect={handleSelectWorkout} />;
            case 'calendar':
                return <CalendarView user={user} onBack={() => setCurrentView('log')} onViewWorkout={handleViewWorkoutFromCalendar} />;
            case 'community':
                return <CommunityFeed onBack={() => setCurrentView('log')} />;
            default:
                return <WorkoutSelector onSelect={handleSelectWorkout} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <div className="container mx-auto max-w-4xl">
                <nav className="p-4 flex justify-center border-b border-gray-200">
                    <div className="flex space-x-2 bg-gray-200 p-1 rounded-full">
                        <button onClick={() => { setCurrentView('log'); setViewingWorkoutFromCalendar(null); }} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${currentView === 'log' && !viewingWorkoutFromCalendar ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600'}`}><Dumbbell size={16}/> Log</button>
                        <button onClick={() => setCurrentView('calendar')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${currentView === 'calendar' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600'}`}><Calendar size={16}/> Calendar</button>
                        <button onClick={() => setCurrentView('community')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${currentView === 'community' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600'}`}><Users size={16}/> Community</button>
                    </div>
                </nav>
                <main>{renderView()}</main>
                 <footer className="text-center p-4 text-xs text-gray-400 flex items-center justify-center gap-4">
                    <p>Profile: <span className="font-semibold text-gray-600">{user.displayName}</span></p>
                    <button onClick={handleSignOut} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold"><LogOut size={12}/>Switch Profile</button>
                 </footer>
            </div>
        </div>
    );
}
