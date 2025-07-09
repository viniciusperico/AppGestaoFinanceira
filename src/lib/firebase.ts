import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase if all config values are provided
const areAllConfigValuesPresent = Object.values(firebaseConfig).every(value => !!value);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (areAllConfigValuesPresent) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Firebase config is incomplete. Firebase services will be disabled.");
    }
}

// @ts-ignore - These might be uninitialized if config is missing, which is handled by the check.
export { app, auth, db };
