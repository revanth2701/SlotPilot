// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhqK6NVe98OuOs_hfqfTqm3l83teykE",
  authDomain: "messages-ddd2c.firebaseapp.com",
  projectId: "messages-ddd2c",
  storageBucket: "messages-ddd2c.appspot.com",
  messagingSenderId: "1015630686257",
  appId: "1:1015630686257:web:92aa305964d9b9d77c4d10",
  measurementId: "G-55DSEF4WRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection };