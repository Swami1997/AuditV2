// Import the Firebase modules that you need in your app.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAntHNI4o-WKe8SnJ4wXCrdpg_YiNv0N-4",
  authDomain: "canis-in-25eae.firebaseapp.com",
  projectId: "canis-in-25eae",
  storageBucket: "canis-in-25eae.appspot.com",
  messagingSenderId: "229881686835",
  appId: "1:229881686835:web:b5858bab7df094b5962c46",
  measurementId: "G-HDCBSY3404",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
