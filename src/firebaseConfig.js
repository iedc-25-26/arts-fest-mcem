// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDJ8Ye_iYK8HpP68zZLSEms2U8u2g4mKf4",
    authDomain: "artsfest-9af94.firebaseapp.com",
    projectId: "artsfest-9af94",
    storageBucket: "artsfest-9af94.firebasestorage.app",
    messagingSenderId: "749400528822",
    appId: "1:749400528822:web:e36fe55869c98e2ed31317",
    measurementId: "G-KQK8QX0J6V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
