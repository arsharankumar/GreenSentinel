// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// Import doc, setDoc, serverTimestamp from firestore for createUserProfile
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBs9KlTYdPYHyzFVR7uCaKGx6qJwjsxYSs",
  authDomain: "greensentinel-70472.firebaseapp.com",
  projectId: "greensentinel-70472",
  storageBucket: "greensentinel-70472.firebasestorage.app",
  messagingSenderId: "246847607150",
  appId: "1:246847607150:web:768bd2d2aa4034012a717f",
  measurementId: "G-HL0PE8L7F2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app); // `db` is now defined here
export const storage = getStorage(app);

// Now define createUserProfile AFTER db is initialized
export const createUserProfile = async (user, extraData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid); // `db` is available here

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? "",
    createdAt: serverTimestamp(),
    ...extraData, // e.g. role: "citizen"
  });
};