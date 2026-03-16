import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkzGJsbyiYCpDMqlcqc1KSrE5ftTN4Igo",
  authDomain: "iris-afa07.firebaseapp.com",
  projectId: "iris-afa07",
  storageBucket: "iris-afa07.firebasestorage.app",
  messagingSenderId: "787505301146",
  appId: "1:787505301146:web:2e2d98d9f60211c5d44123"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;