import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../index.css";
import ProfileHeader from "./ProfileHeader";

const GroupDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const admissionNumber = location.state?.admissionNumber || sessionStorage.getItem("admissionNumber");
    const studentName = location.state?.studentName || sessionStorage.getItem("studentName");
    const selectedGroupPrograms = location.state?.selectedGroupPrograms || [];

    // Helper to determine limits from program name (e.g., "Oppana (10)")
    const getProgramLimits = (program) => {
        // Special Case: "നാടകം" (Drama) -> strict 10 members
        if (program.includes("നാടകം")) {
            return { size: 10 };
        }

        // Special Case: "മുകാഭിനയം" (Mime) -> strict 7 members
        if (program.includes("മുകാഭിനയം")) {
            return { size: 7 };
        }

        // Parse from brackets, e.g., "Group Song (7)" or "Oppana (10)"
        // Fallback to "(\d+)\s*പേർ" for backward compat if brackets missing
        const match = program.match(/\((\d+)\)/) || program.match(/(\d+)\s*പേർ/);
        const size = match ? parseInt(match[1]) : 10; // Default to 10 if no number found

        return { size };
    };

    // Initialize state for each selected program
    // Logic: Pre-fill first slot with studentName (Team Leader).
    // Fill remaining slots to meet the EXACT size requirement.
    const [groupMembers, setGroupMembers] = useState(
        selectedGroupPrograms.reduce((acc, program) => {
            const { size } = getProgramLimits(program);
            // Create array needed: [studentName, "", "", ...]
            // Initial length should be exactly 'size'
            const initialMembers = [studentName];
            while (initialMembers.length < size) {
                initialMembers.push("");
            }
            // Just in case existing logic somehow overfilled (unlikely here but safety)
            if (initialMembers.length > size) {
                initialMembers.length = size;
            }
            acc[program] = initialMembers;
            return acc;
        }, {})
    );

    const handleMemberChange = (program, index, value) => {
        // Validation for admission numbers (index > 0)
        // Index 0 is Team Leader Name (read-only)

        if (index > 0) {
            // Only allow numbers
            const numericValue = value.replace(/[^0-9]/g, "");
            // Limit to 4 digits
            if (numericValue.length > 4) return;

            setGroupMembers(prev => ({
                ...prev,
                [program]: prev[program].map((m, i) => (i === index ? numericValue : m))
            }));
        }
        // No else block needed as index 0 is readOnly and shouldn't change
    };

    const handleSubmit = async () => {
        const allAdmissionNumbers = [];

        // First pass: Local validation (empty fields, format, duplicates in form)
        for (const program of selectedGroupPrograms) {
            const { size } = getProgramLimits(program);
            const members = groupMembers[program];

            // 1. Check for empty fields
            if (members.some(value => value.trim() === "")) {
                alert(`All ${size} member fields must be filled for project "${program}".`);
                return;
            }

            // 2. Check and collect admission numbers
            const invalidMember = members.find((value, index) => {
                if (index === 0) return false; // Skip leader name
                // strictly equal to 4
                return value.length !== 4;
            });

            if (invalidMember) {
                alert(`Admission numbers must be exactly 4 digits. Check project "${program}".`);
                return;
            }

            // DUPLICATE CHECK (In Form)
            const currentProgramAdmissions = members.slice(1); // All entered numbers (skip name at index 0)

            const uniqueAdmissions = new Set(currentProgramAdmissions);
            if (uniqueAdmissions.size !== currentProgramAdmissions.length) {
                alert(`Duplicate admission numbers found in project "${program}". Please ensure all members are unique.`);
                return;
            }

            if (currentProgramAdmissions.includes(admissionNumber)) {
                alert(`You (Team Leader) are automatically included. Do not enter your admission number (${admissionNumber}) again in the member fields for project "${program}".`);
                return;
            }

            // Collect for server validation
            members.forEach((value, index) => {
                if (index > 0) {
                    allAdmissionNumbers.push(value);
                }
            });
        }

        if (admissionNumber) {
            allAdmissionNumbers.push(admissionNumber);
        }

        // 3. Server-side ID Validation (Check if students exist)
        let finalGroupMembers = groupMembers;

        if (allAdmissionNumbers.length > 0) {
            try {
                const response = await fetch("/validate-admission", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ admissionNumbers: allAdmissionNumbers }),
                });

                if (!response.ok) throw new Error("Validation server error");
                const data = await response.json();

                if (!data.success) {
                    alert(data.message);
                    return;
                }

                // Resolve admission numbers to names/details
                const resolvedGroupMembers = {};
                for (const program of selectedGroupPrograms) {
                    resolvedGroupMembers[program] = groupMembers[program].map((member, index) => {
                        let lookupKey = member;
                        if (index === 0) lookupKey = admissionNumber;

                        if (data.studentDetails && data.studentDetails[lookupKey]) {
                            const detail = data.studentDetails[lookupKey];
                            if (typeof detail === 'string') {
                                return {
                                    name: detail,
                                    admissionNumber: lookupKey,
                                    semester: "N/A",
                                    branch: "N/A"
                                };
                            }
                            return { ...detail, admissionNumber: lookupKey };
                        }
                        return {
                            name: index === 0 ? studentName : member,
                            admissionNumber: lookupKey,
                            semester: "N/A",
                            branch: "N/A"
                        };
                    });
                }
                finalGroupMembers = resolvedGroupMembers;

            } catch (error) {
                console.error("Validation error:", error);
                alert("Error connecting to server for validation. Please try again.");
                return;
            }
        }

        // 4. FIREBASE VALIDATION (Strict Rules)
        // Rule: Each member/leader cannot be already registered for THIS event.
        // Rule: Each member/leader cannot be in more than 2 group events TOTAL (inc this one).
        try {
            const { db } = await import("../firebaseConfig");
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const registrationsRef = collection(db, "registrations");

            for (const program of selectedGroupPrograms) {
                const members = finalGroupMembers[program];

                // Check limits for EACH member involved in this group registration
                for (const member of members) {
                    const admNo = member.admissionNumber;

                    // Query 1: Is this specific admission number already registered for THIS program?
                    const qExistingProgram = query(
                        registrationsRef,
                        where("admissionNumber", "==", admNo),
                        where("program", "==", program)
                    );
                    const snapshotExistingProgram = await getDocs(qExistingProgram);

                    if (!snapshotExistingProgram.empty) {
                        alert(`Member ${member.name} (${admNo}) is already registered for "${program}".`);
                        return;
                    }

                    // Query 2: How many Group events is this admission number already in?
                    const qGroupCount = query(
                        registrationsRef,
                        where("admissionNumber", "==", admNo),
                        where("category", "==", "Group")
                    );
                    const snapshotGroupCount = await getDocs(qGroupCount);

                    // Limit is 2. If they are already in 2, they cannot join another.
                    // Note: If we are submitting multiple programs in this batch, we need to account for that.
                    // For simplicity, we check existing DB count.
                    // Ideally we should also check against *other programs currently being submitted in this loop* 
                    // if the user selected 2 new programs at once.
                    // But `selectedGroupPrograms` loop handles them sequentially here. 
                    // Wait, if I select 2 programs A and B, and I am in 1 existing C.
                    // Loop A: Check C -> Count 1. OK.
                    // Loop B: Check C -> Count 1. OK. 
                    // Result: I am in A, B, C -> Total 3. FAIL.
                    // FIX: We need to count accumulated NEW registrations too, or just check "current batch index + existing count".

                    // Simple robust fix: Calculate `existingCount` + `batchCountForThisUser`.
                    const existingCount = snapshotGroupCount.size;

                    // Check how many times this user appears in `selectedGroupPrograms` BEFORE this current program.
                    // Since specific user might be in multiple selected programs.
                    let batchCount = 0;
                    const programIndex = selectedGroupPrograms.indexOf(program);

                    // Iterate programs processed SO FAR in this batch (0 to current index)
                    // If this member is part of those previous programs, increment batchCount.
                    // Actually, `finalGroupMembers` contains all drafted members.
                    for (let i = 0; i < programIndex; i++) {
                        const prevProg = selectedGroupPrograms[i];
                        const prevMembers = finalGroupMembers[prevProg];
                        if (prevMembers.some(m => m.admissionNumber === admNo)) {
                            batchCount++;
                        }
                    }

                    if (existingCount + batchCount >= 2) {
                        alert(`Member ${member.name} (${admNo}) has reached the limit of 2 group events.`);
                        return;
                    }
                }
            }

            // 5. FIREBASE SUBMISSION
            // If we reach here, all validations passed.
            const { addDoc } = await import("firebase/firestore");
            const batchPromises = [];

            for (const program of selectedGroupPrograms) {
                const members = finalGroupMembers[program];
                members.forEach(member => {
                    const docData = {
                        name: member.name,
                        admissionNumber: member.admissionNumber,
                        program: program,
                        category: "Group",
                        role: member.admissionNumber === admissionNumber ? "Team Leader" : "Member",
                        teamLeaderId: admissionNumber,
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: "Registered",
                        timestamp: new Date()
                    };
                    batchPromises.push(addDoc(collection(db, "registrations"), docData));
                });
            }

            await Promise.all(batchPromises);

            navigate("/thank-you", {
                state: {
                    admissionNumber,
                    studentName,
                    selectedGroupPrograms,
                    groupMembers: finalGroupMembers
                }
            });

        } catch (firebaseError) {
            console.error("Firebase submitting error:", firebaseError);
            alert(`Error saving registration to database: ${firebaseError.message}`);
        }
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
                maxWidth: "1000px",
                minHeight: "80vh",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                margin: "4rem auto"
            }}>
                <h1 style={{
                    fontSize: "3.5rem",
                    marginBottom: "3rem",
                    textAlign: "center",
                    fontFamily: "'Righteous', cursive",
                    background: "-webkit-linear-gradient(#0093E9, #80D0C7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    GROUP MEMBERS DETAILS
                </h1>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "4rem"
                }}>
                    {selectedGroupPrograms.map(program => {
                        const { size } = getProgramLimits(program);
                        return (
                            <div key={program} style={{
                                backgroundColor: "#f9fcff",
                                padding: "2rem",
                                borderRadius: "1rem",
                                border: "1px solid #e0eefd"
                            }}>
                                <h3 style={{ fontSize: "2rem", color: "#0093E9", marginBottom: "0.5rem", borderBottom: "2px solid #0093E9", paddingBottom: "0.5rem" }}>
                                    {program}
                                </h3>
                                <p style={{ fontSize: "1.4rem", color: "#666", marginBottom: "2rem", fontStyle: "italic" }}>
                                    Required Members: {size}
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {groupMembers[program].map((member, index) => (
                                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#666", width: "12rem" }}>
                                                {index === 0 ? "Team Leader:" : `Member ${index + 1}:`}
                                            </span>
                                            <input
                                                type="text"
                                                placeholder={index === 0 ? "Team Leader Name" : "Enter Admission Number"}
                                                value={member}
                                                onChange={(e) => handleMemberChange(program, index, e.target.value)}
                                                readOnly={index === 0} // Team Leader Read Only
                                                maxLength={index === 0 ? undefined : 4} // Strict Max Length HTML attribute
                                                style={{
                                                    flex: 1,
                                                    padding: "1rem",
                                                    fontSize: "1.4rem",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "0.5rem",
                                                    outline: "none",
                                                    backgroundColor: index === 0 ? "#e9ecef" : "white", // Gray out read-only
                                                    cursor: index === 0 ? "not-allowed" : "text",
                                                    color: index === 0 ? "#6c757d" : "inherit"
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{
                    display: "flex",
                    gap: "2rem",
                    marginTop: "5rem",
                    justifyContent: "center",
                    borderTop: "2px solid #eee",
                    paddingTop: "3rem"
                }}>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, width: "200px", backgroundColor: "#666" }}
                        onClick={() => navigate("/group", { state: { selectedGroupPrograms, admissionNumber, studentName } })}
                    >
                        BACK
                    </button>
                    <button
                        className="dashboard-btn"
                        style={{ margin: 0, width: "300px" }}
                        onClick={handleSubmit}
                    >
                        SUBMIT REGISTRATION
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GroupDetails;
