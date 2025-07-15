import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAZ0c_xP_IYotsryKbe60GwYekez7-C2xA",
  authDomain: "easy-khata-889e1.firebaseapp.com",
  projectId: "easy-khata-889e1",
  storageBucket: "easy-khata-889e1.firebasestorage.app",
  messagingSenderId: "846544135562",
  appId: "1:846544135562:web:1f2dbf223dc81f91f51473",
  measurementId: "G-LE3YBW0XDW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;