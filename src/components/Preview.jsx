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

    // Import needed locally if top-level import is tricky with multi-edit, 
    // but better to add top level imports in a separate block if possible or use full replace if safe.
    // I will use full file replace logic here essentially by replacing the component body.
    // Wait, I need to add imports. `replace_file_content` targets a block. 
    // I'll assume I can edit the whole file or I need to add imports at top. 
    // Let's use multi_replace for imports + component logic to be safe.

    // Since I'm in `replace_file_content`, I'll replace the Confirm button handler logic primarily?
    // Actually, I can replace the whole component function to include the async handler.

    const handleConfirm = async () => {
        try {
            const { db } = await import("../firebaseConfig");
            const { collection, addDoc } = await import("firebase/firestore");

            if (!admissionNumber || !studentName) {
                alert("Missing student details. Please login again.");
                return;
            }

            const registrationPromises = selectedPrograms.map(program => {
                return addDoc(collection(db, "registrations"), {
                    name: studentName,
                    admissionNumber: admissionNumber, // stored as string usually
                    program: program,
                    // Check if program is Onstage or Offstage? 
                    // The UI doesn't explicitly pass this, but we can infer or just save "Individual".
                    // The Admin logic filters by lookup anyway.
                    category: "Individual",
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "Registered",
                    timestamp: new Date() // for sorting
                });
            });

            await Promise.all(registrationPromises);

            navigate("/thank-you", { state: { admissionNumber, studentName } });
        } catch (error) {
            console.error("Error adding document: ", error);
            alert(`Error submitting registration: ${error.message}`);
        }
    };

    return (
        <section style={{ position: "relative", minHeight: "100vh", background: "linear-gradient(160deg, rgba(0, 147, 233, 1) 0%, rgba(128, 208, 199, 1) 100%)", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                    >
                        EDIT
                    </button>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, flex: 2 }}
                        onClick={handleConfirm}
                    >
                        CONFIRM
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Preview;
