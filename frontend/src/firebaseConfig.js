import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyD3_iWsUrtBxTBiWZ7leF28IDPjJMaQhJ0",

  authDomain: "iris-ab47e.firebaseapp.com",

  projectId: "iris-ab47e",

  storageBucket: "iris-ab47e.firebasestorage.app",

  messagingSenderId: "432958340999",

  appId: "1:432958340999:web:409f789222fab2a5b45d22",

  measurementId: "G-J1HR0DTGV0"

};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;