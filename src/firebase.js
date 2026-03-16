import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARJQ79KHf8SN1GHWA6PDjjCims_EpKxho",
  authDomain: "task-tracker-960df.firebaseapp.com",
  projectId: "task-tracker-960df",
  storageBucket: "task-tracker-960df.firebasestorage.app",
  messagingSenderId: "682468366096",
  appId: "1:682468366096:web:3adc1a3da7d93e165d7795"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore, and export them!
export const auth = getAuth(app);
export const db = getFirestore(app);