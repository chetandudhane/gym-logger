// ─────────────────────────────────────────────────────────────────────────────
// Gym Logger — Cleanup Script
// Deletes old anonymous UID data AFTER a successful migration.
//
// What gets deleted:
//   • Firestore: all private data under each old UID (workouts, exerciseHistory,
//     customWorkouts, profile) — using recursive delete
//   • Firebase Auth: the 4 anonymous user accounts themselves
//
// Usage:
//   node cleanup.mjs --dry-run    ← see what WILL be deleted (no writes)
//   node cleanup.mjs              ← execute the cleanup
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { getAuth }             from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = './serviceAccount.json';
const APP_ID               = 'default-gym-log';

const OLD_UIDS = [
  { uid: 'Nc9Ub5y3kZS5gPLrg4bDIiKKJVi1', label: '"chetan"  Jul 2025' },
  { uid: 'GBMgXY6wk9gf4Ba8aLh9OVl2mUq1', label: '"chetan"  Aug 2025' },
  { uid: 'cxGV1h7Ts2VyhtZYpwJvgfRTZ8s1', label: '"Chetan"  Jan–Apr 2026' },
  { uid: 'F63P4fUBxvgU8i8D8lJX6wrMcjs1', label: '"Chetan"  Jun 2026' },
];
// ─────────────────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');

async function deleteCollection(db, path) {
  const snap = await db.collection(path).get();
  if (snap.empty) return 0;
  if (!DRY_RUN) {
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  return snap.size;
}

async function main() {
  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`\n❌  serviceAccount.json not found. Run from ~/codes/gym-log-app/\n`);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db   = getFirestore();
  const auth = getAuth();

  console.log('\n🗑️   Gym Logger — Cleanup');
  console.log(`    Mode: ${DRY_RUN ? '🔍 DRY RUN — nothing will be deleted' : '⚡ LIVE — deleting from Firestore + Auth'}\n`);

  for (const { uid, label } of OLD_UIDS) {
    console.log(`  ┌─ ${label}  (${uid})`);

    const collections = ['workouts', 'exerciseHistory', 'customWorkouts', 'profile'];
    let total = 0;
    for (const col of collections) {
      const count = await deleteCollection(db, `artifacts/${APP_ID}/users/${uid}/${col}`);
      if (count > 0) console.log(`  │  ${col.padEnd(20)}: ${count} docs ${DRY_RUN ? '(would delete)' : 'deleted'}`);
    }

    // Delete the Firebase Auth user
    try {
      await auth.getUser(uid); // check if exists
      if (!DRY_RUN) {
        await auth.deleteUser(uid);
        console.log(`  │  Firebase Auth user : deleted`);
      } else {
        console.log(`  │  Firebase Auth user : (would delete)`);
      }
    } catch {
      console.log(`  │  Firebase Auth user : already gone or not found`);
    }

    console.log(`  └─ done\n`);
  }

  console.log('═'.repeat(55));
  if (DRY_RUN) {
    console.log('🔍  DRY RUN complete — nothing was deleted.');
    console.log('    Run without --dry-run to execute.\n');
  } else {
    console.log('✅  Cleanup complete. All old anonymous data removed.');
    console.log('    Your Google account is now the only active profile.\n');
  }

  process.exit(0);
}

main().catch(e => {
  console.error('\n❌  Error:', e.message);
  process.exit(1);
});
