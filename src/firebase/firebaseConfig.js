import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBUfrKYWY2XB2Z5M3BS8ugZ-h6nrnL5PGU",
  authDomain: "inventory-c6f62.firebaseapp.com",
  projectId: "inventory-c6f62",
  storageBucket: "inventory-c6f62.appspot.com",
  messagingSenderId: "666215177540",
  appId: "1:666215177540:web:c701a6f47e877ddcee0b11",
  measurementId: "G-KZWVECG5VQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;