// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDXO-bAMwhOWZDxU3vK1En9gys0sbfKFmM",
    authDomain: "lumieregyn-auth.firebaseapp.com",
    projectId: "lumieregyn-auth",
    storageBucket: "lumieregyn-auth.firebasestorage.app",
    messagingSenderId: "256468406583",
    appId: "1:256468406583:web:948ba943990a52fa01cab2"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider }; // <- esse é o ponto chave
