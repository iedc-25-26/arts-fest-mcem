import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../index.css";
import ProfileHeader from "./ProfileHeader";

import { ONSTAGE_PROGRAMS, OFFSTAGE_PROGRAMS } from "../utils/programData";

const Individual = () => {
    const [selectedPrograms, setSelectedPrograms] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const admissionNumber = location.state?.admissionNumber || sessionStorage.getItem("admissionNumber");
    const studentName = location.state?.studentName || sessionStorage.getItem("studentName");

    const [existingCount, setExistingCount] = useState(0);
    const [alreadyRegistered, setAlreadyRegistered] = useState([]); // Array of program names
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchExisting = async () => {
            if (!admissionNumber) return;
            try {
                const { db } = await import("../firebaseConfig");
                const { collection, query, where, getDocs } = await import("firebase/firestore");

                const q = query(collection(db, "registrations"), where("admissionNumber", "==", admissionNumber));
                const querySnapshot = await getDocs(q);

                const registeredPrograms = [];
                let count = 0;

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.category && data.category.startsWith("Individual")) {
                        count++;
                        if (data.program) registeredPrograms.push(data.program);
                    }
                });

                setExistingCount(count);
                setAlreadyRegistered(registeredPrograms);

            } catch (error) {
                console.error("Error fetching existing registrations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExisting();
    }, [admissionNumber]);

    const toggleProgram = (program) => {
        if (alreadyRegistered.includes(program)) {
            alert("You have already registered for this program.");
            return;
        }

        if (selectedPrograms.includes(program)) {
            setSelectedPrograms(selectedPrograms.filter(p => p !== program));
        } else {
            if (selectedPrograms.length + existingCount >= 4) {
                alert(`You have already registered/selected ${existingCount + selectedPrograms.length} individual programs. The limit is 4.`);
                return;
            }
            setSelectedPrograms([...selectedPrograms, program]);
        }
    };

    const handlePreview = () => {
        if (selectedPrograms.length === 0) {
            alert("Please select at least one program.");
            return;
        }
        navigate("/preview", { state: { selectedPrograms, admissionNumber, studentName } });
    };

    const ProgramItem = ({ program }) => {
        const isSelected = selectedPrograms.includes(program);
        const isRegistered = alreadyRegistered.includes(program);

        return (
            <li key={program} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.8rem 0",
                borderBottom: "1px solid #eee",
                fontSize: "1.4rem",
                opacity: isRegistered ? 0.6 : 1
            }}>
                <span style={{ textDecoration: isRegistered ? "line-through" : "none" }}>{program} {isRegistered && "(Registered)"}</span>
                <button
                    onClick={() => !isRegistered && toggleProgram(program)}
                    title={isRegistered ? "Already Registered" : isSelected ? "Remove program" : "Add program"}
                    disabled={isRegistered}
                    style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: isRegistered ? "#ccc" : isSelected ? "#ff4d4d" : "#0093E9",
                        color: "white",
                        fontSize: "1.8rem",
                        cursor: isRegistered ? "not-allowed" : "pointer",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "background-color 0.2s"
                    }}
                >
                    {isSelected || isRegistered ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    )}
                </button>
            </li>
        );
    };

    const ProgramList = ({ title, programs }) => (
        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
            {title && (
                <h3 style={{ fontSize: "1.8rem", color: "#0093E9", borderBottom: "2px solid #80D0C7", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{title}</h3>
            )}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {programs.map((program, idx) => {
                    // Check if program is a string (simple item) or object (category)
                    // The Arrays provided above are Arrays of Objects (Categories). 
                    // But in the original code, sometimes it passed single objects to ProgramList.
                    // Here we will handle the array of categories.

                    if (typeof program === 'string') {
                        return <ProgramItem key={program} program={program} />;
                    } else if (program.category) {
                        return (
                            <div key={idx} style={{ marginTop: idx > 0 ? "2rem" : "1.5rem" }}>
                                <h4 style={{ fontSize: "1.7rem", color: "#666", marginBottom: "1rem", borderLeft: "4px solid #80D0C7", paddingLeft: "1rem" }}>{program.category}</h4>
                                <ul style={{ listStyle: "none", padding: "0 0 0 1rem" }}>
                                    {program.items.map(item => (
                                        <ProgramItem key={item} program={item} />
                                    ))}
                                </ul>
                            </div>
                        );
                    }
                    return null;
                })}
            </ul>
        </div>
    );

    return (
        <section style={{
            minHeight: "100vh",
            width: "100%",
            background: "linear-gradient(160deg, rgba(0, 147, 233, 1) 0%, rgba(128, 208, 199, 1) 100%)",
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            position: "relative"
        }}>
            {/* Profile Header */}
            <ProfileHeader studentName={studentName} admissionNumber={admissionNumber} />

            <div style={{
                backgroundColor: "#ffffff",
                padding: "3rem",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "1000px",
                minHeight: "80vh",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                margin: "4rem auto"
            }}>
                <h1 style={{
                    fontSize: "3.5rem",
                    marginBottom: "2rem",
                    textAlign: "center",
                    fontFamily: "'Righteous', cursive",
                    background: "-webkit-linear-gradient(#0093E9, #80D0C7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    INDIVIDUAL PROGRAMS
                </h1>

                <div style={{
                    textAlign: "center",
                    fontSize: "1.6rem",
                    fontWeight: "600",
                    color: selectedPrograms.length === 4 ? "#ff4d4d" : "#0093E9",
                    marginBottom: "3rem",
                    padding: "1rem",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "0.5rem"
                }}>
                    Selected Programs: {selectedPrograms.length} / 4
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "4rem"
                }}>
                    {/* Render ONSTAGE and OFFSTAGE sections */}
                    {/* We can split them or render all. The Arts code split them specifically. */}
                    {/* Let's render two columns roughly corresponding to Onstage and Offstage if possible, or just two generic columns distributing the data. */}
                    {/* The Arts component manually placed specific indices. That's fragile. */}
                    {/* I'll use the generic ProgramList for ONSTAGE and OFFSTAGE arrays. */}

                    <div>
                        <ProgramList title="ONSTAGE" programs={ONSTAGE_PROGRAMS} />
                    </div>
                    <div>
                        <ProgramList title="OFFSTAGE" programs={OFFSTAGE_PROGRAMS} />
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    gap: "2rem",
                    marginTop: "4rem",
                    justifyContent: "center",
                    borderTop: "2px solid #eee",
                    paddingTop: "3rem"
                }}>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, width: "200px", backgroundColor: "#666" }}
                        onClick={() => navigate("/dashboard", { state: { admissionNumber, studentName } })}
                    >
                        BACK TO DASHBOARD
                    </button>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, width: "300px" }}
                        onClick={handlePreview}
                        disabled={selectedPrograms.length === 0}
                    >
                        PREVIEW SELECTION
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Individual;
