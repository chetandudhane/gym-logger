// The four built-in workout types + their starter exercise lists (unchanged
// from the original App.jsx). Any additional types a user creates via "Add
// workout type" start with an empty list and grow via "Add exercise".
export const PRESET_TYPES = ['PUSH', 'PULL', 'LEGS', 'OTHER'];

// Default weekly-streak goal (sessions/week) — used until a user sets their
// own via the "X of Y this week" tap-to-edit on StreakBanner, which persists
// to profile.weeklyGoal.
export const DEFAULT_WEEKLY_TARGET = 3;
export const MIN_WEEKLY_TARGET = 1;
export const MAX_WEEKLY_TARGET = 7;

export const exercisesByWorkout = {
  PUSH: ["Barbell Bench Press Flat/Incline", "DB Bench Press Flat/Incline", "Hi-to-Low Crossovers", "DB Shoulder Press", "Side Lateral Raises Single/One&Half", "Lying Tricep Extension", "DB Waiter's Curls", "Rotater Cuff External Rotator"],
  PULL: ["Barbell Deadlifts", "Chest supported Rows", "Lat Pulldown", "Seated Rows", "DB Lat Pullovers", "Biceps DB Curls", "Biceps Barbell Curls", "Biceps Cable Curls", "Biceps Cable Curls Single Hand", "Overhead Triceps Extension", "Angels and Devils"],
  LEGS: ["Barbell Squats", "Barbell Hip Thrusts", "Leg Extensions", "Seated Hamstrings", "DB Alternating Reverse Lunges", "DB Single leg RDLs", "Calf Raises", "Plank"],
  OTHER: ["Running", "Walking", "Yoga", "Badminton"],
};
