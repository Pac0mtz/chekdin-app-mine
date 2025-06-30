import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCYw_bzdlcz8qpnWaX2-wtEKOyqhz3oSqM",
    authDomain: "chekdin-e7f0b.firebaseapp.com",
    projectId: "chekdin-e7f0b",
    storageBucket: "chekdin-e7f0b.appspot.com",
    messagingSenderId: "864646753923",
    appId: "1:864646753923:web:ec0b1bca4c84c1254c75b6"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    db,
    app,
}
