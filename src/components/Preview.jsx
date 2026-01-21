import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";
import ProfileHeader from "./ProfileHeader";

const Preview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedPrograms = location.state?.selectedPrograms || [];
    const admissionNumber = location.state?.admissionNumber || sessionStorage.getItem("admissionNumber");
    const studentName = location.state?.studentName || sessionStorage.getItem("studentName");
    const [isSubmitting, setIsSubmitting] = React.useState(false); // Add Loading State

    const handleConfirm = async () => {
        if (isSubmitting) return; // Prevent extra clicks

        setIsSubmitting(true); // Disable button
        try {
            const { db } = await import("../firebaseConfig");
            const { collection, addDoc } = await import("firebase/firestore");

            if (!admissionNumber || !studentName) {
                alert("Missing student details. Please login again.");
                return;
            }

            // Check for existing registrations for these specific programs
            const { query, where, getDocs } = await import("firebase/firestore");
            const registrationsRef = collection(db, "registrations");

            for (const program of selectedPrograms) {
                const q = query(
                    registrationsRef,
                    where("admissionNumber", "==", admissionNumber),
                    where("program", "==", program)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    alert(`You are already registered for "${program}".`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const registrationPromises = selectedPrograms.map(program => {
                return addDoc(collection(db, "registrations"), {
                    name: studentName,
                    admissionNumber: admissionNumber, // stored as string usually
                    program: program,
                    category: "Individual",
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "Registered",
                    timestamp: new Date() // for sorting
                });
            });

            await Promise.all(registrationPromises);

            navigate("/thank-you", { state: { admissionNumber, studentName }, replace: true });
        } catch (error) {
            console.error("Error adding document: ", error);
            alert(`Error submitting registration: ${error.message}`);
            setIsSubmitting(false); // Re-enable only on error
        }
    };

    return (
        <section style={{ flex: 1, position: "relative", background: "linear-gradient(160deg, rgba(0, 147, 233, 1) 0%, rgba(128, 208, 199, 1) 100%)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* Profile Header */}
            <ProfileHeader studentName={studentName} admissionNumber={admissionNumber} />
            <div className="auth" style={{ minWidth: "35rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>SELECTION PREVIEW</h1>

                <div style={{ textAlign: "left", marginBottom: "2.5rem" }}>
                    <p style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "1rem", color: "#666" }}>
                        You have selected the following programs:
                    </p>
                    <ul style={{ listStyle: "circle", paddingLeft: "2rem" }}>
                        {selectedPrograms.length > 0 ? (
                            selectedPrograms.map((program, index) => (
                                <li key={index} style={{ fontSize: "1.6rem", padding: "0.5rem 0", color: "#333" }}>
                                    {program}
                                </li>
                            ))
                        ) : (
                            <li style={{ color: "red", fontSize: "1.4rem" }}>No programs selected.</li>
                        )}
                    </ul>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, flex: 1, backgroundColor: "#666" }}
                        onClick={() => navigate("/individual", { state: { selectedPrograms, admissionNumber, studentName } })}
                        disabled={isSubmitting}
                    >
                        EDIT
                    </button>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, flex: 2, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
                        onClick={handleConfirm}
                        disabled={isSubmitting} // Disable button
                    >
                        {isSubmitting ? "PROCESSING..." : "CONFIRM"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Preview;
