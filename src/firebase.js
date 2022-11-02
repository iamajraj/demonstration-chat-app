import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyASMlTGfUnHyGFyrXUu2qr480ItDjBnS80",
    authDomain: "fir-practice-7c34d.firebaseapp.com",
    projectId: "fir-practice-7c34d",
    storageBucket: "fir-practice-7c34d.appspot.com",
    messagingSenderId: "482129041359",
    appId: "1:482129041359:web:68a87207ba311ecdd3a4ba",
};

const app = getApps.length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();

export { auth, db };
