import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase client safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use custom firestoreDatabaseId if specified, otherwise default database
const configAny = firebaseConfig as Record<string, any>;
export const db = configAny.firestoreDatabaseId && configAny.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, configAny.firestoreDatabaseId)
  : getFirestore(app);

export default app;
