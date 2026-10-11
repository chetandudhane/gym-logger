import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';

initializeApp();
const db = getFirestore();
const corsHandler = cors({ origin: true });

export const getWorkoutData = onRequest(
  { invoker: 'public' },
  (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { uid, dateFrom, dateTo } = req.query;

        if (!uid) {
          return res.status(400).json({ error: 'Missing required parameter: uid' });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const fromStr = (dateFrom || thirtyDaysAgo.toISOString().split('T')[0]);
        const toStr = (dateTo || now.toISOString().split('T')[0]);

        const userDocPath = `artifacts/default-gym-log/users/${uid}`;

        // Fetch ALL workouts — filter by doc ID (date string) client-side
        const workoutsSnapshot = await db
          .collection(`${userDocPath}/workouts`)
          .get();

        const workouts = {};
        workoutsSnapshot.forEach((doc) => {
          const dateId = doc.id; // e.g. "2024-10-10"
          if (dateId >= fromStr && dateId <= toStr) {
            workouts[dateId] = doc.data();
          }
        });

        const exerciseHistorySnapshot = await db
          .collection(`${userDocPath}/exerciseHistory`)
          .get();
        const exerciseHistory = {};
        exerciseHistorySnapshot.forEach((doc) => {
          exerciseHistory[doc.id] = doc.data();
        });

        const customWorkoutsSnapshot = await db
          .collection(`${userDocPath}/customWorkouts`)
          .get();
        const customWorkouts = {};
        customWorkoutsSnapshot.forEach((doc) => {
          customWorkouts[doc.id] = doc.data();
        });

        const sortedDates = Object.keys(workouts).sort();

        return res.status(200).json({
          uid,
          dateRange: { from: fromStr, to: toStr },
          workouts,
          exerciseHistory,
          customWorkouts,
          summary: {
            totalWorkouts: sortedDates.length,
            dateRange: {
              earliest: sortedDates[0] || null,
              latest: sortedDates[sortedDates.length - 1] || null,
            },
          },
        });
      } catch (error) {
        console.error('Error fetching workout data:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
      }
    });
  }
);
