// firebase.js - Updated Configuration
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCncdKCueeYyap6kexxkSi31-MlkTGQOmk",
  authDomain: "dairy-190d1.firebaseapp.com",
  projectId: "dairy-190d1",
  storageBucket: "dairy-190d1.firebasestorage.app",
  messagingSenderId: "257059150324",
  appId: "1:257059150324:web:889d2464a4524e975401a1",
  measurementId: "G-PFRD9PCG3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics only if not in development
let analytics = null;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Export auth instance
export { auth };
export default app;