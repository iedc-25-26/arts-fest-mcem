import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Config from src/firebaseConfig.js (Manual copy to ensure isolation)
const firebaseConfig = {
    apiKey: "   ",
    authDomain: "artsfest-9af94.firebaseapp.com",
    projectId: "artsfest-9af94",
    storageBucket: "artsfest-9af94.firebasestorage.app",
    messagingSenderId: "749400528822",
    appId: "1:749400528822:web:e36fe55869c98e2ed31317",
    measurementId: "G-KQK8QX0J6V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
    console.log("Testing Firestore connection...");
    try {
        const docRef = await addDoc(collection(db, "test_connection"), {
            timestamp: new Date(),
            message: "Hello form terminal!"
        });
        console.log("SUCCESS: Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("ERROR: Failed to write to Firestore.");
        console.error(e.message);
        if (e.code) console.error("Error Code:", e.code);
    }
}

testConnection();
