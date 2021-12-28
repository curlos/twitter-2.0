export { }

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "${config.measurementId}"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyC-8BsNwn9Xnyz6I6Eu5P6DfHIpRSlgp8M",
//   authDomain: "twitter-clone-ece43.firebaseapp.com",
//   projectId: "twitter-clone-ece43",
//   storageBucket: "twitter-clone-ece43.appspot.com",
//   messagingSenderId: "108127960265",
//   appId: "1:108127960265:web:675bd0177319866c996118",
//   measurementId: "${config.measurementId}"
// };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export default app;
export { db, storage };