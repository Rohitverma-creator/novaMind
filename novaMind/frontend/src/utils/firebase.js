// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "novamind-8aec3.firebaseapp.com",
  projectId: "novamind-8aec3",
  storageBucket: "novamind-8aec3.firebasestorage.app",
  messagingSenderId: "546582260187",
  appId: "1:546582260187:web:d74ecc7e57493b809d5ffe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()
