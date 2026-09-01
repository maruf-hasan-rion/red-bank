import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import AppError from '../utils/AppError.js';

let firebaseAuth;

const getFirebaseAuth = () => {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new AppError('Firebase Admin configuration is missing', 503);
  }

  const app = getApps()[0] || initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  firebaseAuth = getAuth(app);
  return firebaseAuth;
};

export const verifyFirebaseIdToken = (token) =>
  getFirebaseAuth().verifyIdToken(token);
