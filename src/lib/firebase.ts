
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "courtbell",
  "appId": "1:534647613176:web:94a5adf181e4d2182c3d0d",
  "storageBucket": "courtbell.firebasestorage.app",
  "apiKey": "AIzaSyA_2tzAd3PhEJH3lBZwXQ0ku-rxWbSPel4",
  "authDomain": "courtbell.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "534647613176"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
