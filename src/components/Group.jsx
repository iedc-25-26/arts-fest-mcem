import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../index.css";
import ProfileHeader from "./ProfileHeader";

import { GROUP_PROGRAMS } from "../utils/programData";

const Group = () => {
    const [selectedGroupPrograms, setSelectedGroupPrograms] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const admissionNumber = location.state?.admissionNumber || sessionStorage.getItem("admissionNumber");
    const studentName = location.state?.studentName || sessionStorage.getItem("studentName");

    const [existingCount, setExistingCount] = useState(0);
    const [alreadyRegistered, setAlreadyRegistered] = useState([]);

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
                    if (data.category === "Group") {
                        count++;
                        if (data.program) registeredPrograms.push(data.program);
                    }
                });

                setExistingCount(count);
                setAlreadyRegistered(registeredPrograms);

            } catch (error) {
                console.error("Error fetching existing registrations:", error);
            }
        };
        fetchExisting();
    }, [admissionNumber]);

    const toggleProgram = (program) => {
        if (alreadyRegistered.includes(program)) {
            alert("You have already registered for this program.");
            return;
        }

        if (selectedGroupPrograms.includes(program)) {
            setSelectedGroupPrograms(selectedGroupPrograms.filter(p => p !== program));
        } else {
            if (selectedGroupPrograms.length + existingCount >= 2) {
                alert(`You have already registered/selected ${existingCount + selectedGroupPrograms.length} group programs. The limit is 2.`);
                return;
            }
            setSelectedGroupPrograms([...selectedGroupPrograms, program]);
        }
    };

    const handleNext = () => {
        if (selectedGroupPrograms.length === 0) {
            alert("Please select at least one program.");
            return;
        }
        navigate("/group-details", { state: { selectedGroupPrograms, admissionNumber, studentName } });
    };

    const ProgramItem = ({ program }) => {
        const isSelected = selectedGroupPrograms.includes(program);
        const isRegistered = alreadyRegistered.includes(program);

        return (
            <li key={program} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.2rem 2rem",
                borderBottom: "1px solid #eee",
                fontSize: "1.6rem",
                backgroundColor: isSelected ? "#f9f9f9" : "transparent",
                opacity: isRegistered ? 0.6 : 1
            }}>
                <span style={{ textDecoration: isRegistered ? "line-through" : "none" }}>{program} {isRegistered && "(Registered)"}</span>
                <button
                    onClick={() => !isRegistered && toggleProgram(program)}
                    // className={`select-btn ${isSelected ? 'minus' : 'plus'}`}
                    disabled={isRegistered}
                    style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: isRegistered ? "#ccc" : isSelected ? "#ff4d4d" : "#0093E9",
                        color: "white",
                        fontSize: "2rem",
                        cursor: isRegistered ? "not-allowed" : "pointer",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "all 0.2s"
                    }}
                    title={isRegistered ? "Already Registered" : isSelected ? "Remove program" : "Add program"}
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
                maxWidth: "800px",
                minHeight: "70vh",
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
                    GROUP PROGRAMS
                </h1>

                <div style={{
                    textAlign: "center",
                    fontSize: "1.6rem",
                    fontWeight: "600",
                    color: selectedGroupPrograms.length === 2 ? "#ff4d4d" : "#0093E9",
                    marginBottom: "3rem",
                    padding: "1rem",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "0.5rem"
                }}>
                    Selected Programs: {selectedGroupPrograms.length} / 2
                </div>

                <ul style={{ listStyle: "none", padding: 0 }}>
                    {GROUP_PROGRAMS.map((group, idx) => (
                        <div key={idx} style={{ marginTop: idx > 0 ? "3rem" : "0" }}>
                            <h3 style={{
                                fontSize: "2.0rem",
                                color: "#0093E9",
                                borderBottom: "2px solid #80D0C7",
                                paddingBottom: "0.5rem",
                                marginBottom: "1.5rem",
                                textAlign: "left"
                            }}>
                                {group.category}
                            </h3>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {group.items.map(item => (
                                    <ProgramItem key={item} program={item} />
                                ))}
                            </ul>
                        </div>
                    ))}
                </ul>

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
                        BACK
                    </button>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, width: "200px" }}
                        onClick={handleNext}
                        disabled={selectedGroupPrograms.length === 0}
                    >
                        NEXT
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Group;
