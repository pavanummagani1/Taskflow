import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBd6hz1pkmH0Vu7cu4dvkIBlcMzb7TM9HQ",
  authDomain: "taskflow-e5658.firebaseapp.com",
  projectId: "taskflow-e5658",
  storageBucket: "taskflow-e5658.firebasestorage.app",
  messagingSenderId: "840604174019",
  appId: "1:840604174019:web:bec61e412e1fc92d888476"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();