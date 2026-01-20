import { db } from './src/firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';

const sampleRegistrations = [
    {
        name: "Abhay P",
        admissionNumber: "5205",
        program: "ശാസ്ത്രീയ സംഗീതം (ആൺ)",
        category: "Individual-Onstage",
        role: "Individual",
        teamLeaderId: "5205",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Registered",
        timestamp: new Date()
    },
    {
        name: "Abhinav P",
        admissionNumber: "5150",
        program: "ചിത്രരചന പെൻസിൽ",
        category: "Individual-Offstage",
        role: "Individual",
        teamLeaderId: "5150",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Registered",
        timestamp: new Date()
    },
    // TEAM ALPHA
    {
        name: "Adharsh M", // Leader
        admissionNumber: "4776",
        program: "തിരുവാതിര (10 പേർ) (8+2) (പെൺ)",
        category: "Group",
        role: "Team Leader",
        teamLeaderId: "4776",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Registered",
        timestamp: new Date()
    },
    {
        name: "Adwaith A", // Member
        admissionNumber: "5142",
        program: "തിരുവാതിര (10 പേർ) (8+2) (പെൺ)",
        category: "Group",
        role: "Member",
        teamLeaderId: "4776",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Registered",
        timestamp: new Date()
    },
    // TEAM BETA
    {
        name: "Ajaykrishnan", // Leader
        admissionNumber: "5198",
        program: "നാടകം (മലയാളം)",
        category: "Group",
        role: "Team Leader",
        teamLeaderId: "5198",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Registered",
        timestamp: new Date()
    },
    {
        name: "Amal Krishna", // Member
        admissionNumber: "5233",
        program: "നാടകം (മലയാളം)",
        category: "Group",
        role: "Member",
        teamLeaderId: "5198",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Registered",
        timestamp: new Date()
    }
];

const seedData = async () => {
    console.log("Starting seed process...");
    try {
        const registrationsRef = collection(db, "registrations");

        for (const reg of sampleRegistrations) {
            const docRef = await addDoc(registrationsRef, reg);
            console.log(`Added document with ID: ${docRef.id}`);
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Error adding document: ", e);
        process.exit(1);
    }
};

seedData();
