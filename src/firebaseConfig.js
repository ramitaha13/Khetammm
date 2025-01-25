import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Added storage if needed

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9JCaS9ug6d4MmOGnOah4kkxIQKzUckpA",
  authDomain: "calendar-7e112.firebaseapp.com",
  projectId: "calendar-7e112",
  storageBucket: "calendar-7e112.firebasestorage.app",
  messagingSenderId: "527689077746",
  appId: "1:527689077746:web:9573d6d1fa5498474f116b",
  measurementId: "G-RJMLRW8Y7R",
  databaseURL: "https://calendar-7e112-default-rtdb.firebaseio.com", // Add Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage }; // Export all services
