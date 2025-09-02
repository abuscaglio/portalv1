import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQzM0gRszIVNhewhUrdImOEqR18pMYWso",
  authDomain: "portfolio-f84fb.firebaseapp.com",
  projectId: "portfolio-f84fb",
  storageBucket: "portfolio-f84fb.firebasestorage.app",
  messagingSenderId: "758951606684",
  appId: "1:758951606684:web:6b7f666b9fc9296422f059",
  measurementId: "G-95HSXKTQBY"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);