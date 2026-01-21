import React, { useState } from "react";
import { PROGRAM_DATA } from "../../utils/programData";
import { downloadCSV } from "../../utils/exportUtils";
import "./Admin.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RegistrationManagement = () => {
    const [registrations, setRegistrations] = useState([]);

    // Import firebase hook effect
    React.useEffect(() => {
        let unsubscribe = () => { };

        const fetchRegistrations = async () => {
            try {
                // Dynamically import to avoid top-level issues if any
                const { db } = await import("../../firebaseConfig");
                const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");

                const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const regs = snapshot.docs.map(doc => ({
                        regId: doc.id,
                        ...doc.data()
                    }));
                    setRegistrations(regs);
                }, (error) => {
                    console.error("Error fetching registrations:", error);
                });

            } catch (err) {
                console.error("Error initializing firebase listener:", err);
            }
        };

        fetchRegistrations();

        return () => unsubscribe();
    }, []);

    // Auto-sync missing details
    React.useEffect(() => {
        if (registrations.length === 0) return;

        const syncData = async () => {
            // Find records with missing data
            const missing = registrations.filter(r =>
                (!r.branch || r.branch === "N/A" || !r.semester || r.semester === "N/A")
            );

            if (missing.length === 0) return;

            const distinctAdms = [...new Set(missing.map(r => r.admissionNumber))].filter(Boolean);
            if (distinctAdms.length === 0) return;

            try {
                const response = await fetch('/validate-admission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admissionNumbers: distinctAdms })
                });
                const data = await response.json();

                if (data.success && data.studentDetails) {
                    const { db } = await import("../../firebaseConfig");
                    const { doc, updateDoc } = await import("firebase/firestore");

                    const updates = [];
                    for (const reg of missing) {
                        const details = data.studentDetails[reg.admissionNumber];
                        if (details) {
                            const newBranch = details.branch || "N/A";
                            const newSem = details.semester || "N/A";
                            const newName = details.name || reg.name;

                            // Prevent infinite loop: Only update if value actually changes
                            if (newBranch !== (reg.branch || "N/A") || newSem !== (reg.semester || "N/A")) {
                                updates.push(updateDoc(doc(db, "registrations", reg.regId), {
                                    branch: newBranch,
                                    semester: newSem,
                                    name: newName
                                }));
                            }
                        }
                    }
                    if (updates.length > 0) {
                        await Promise.all(updates);
                        console.log(`Auto-synced ${updates.length} registrations.`);
                    }
                }
            } catch (error) {
                console.error("Auto-sync error:", error);
            }
        };

        syncData();
    }, [registrations]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterProgram, setFilterProgram] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [newRegData, setNewRegData] = useState({
        name: "", // Will be fetched
        admissionNumber: "",
        category: "Individual-Onstage",
        program: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);

    // Helper to get program size (duplicated from GroupDetails to avoid breaking changes there)
    const getProgramLimits = (program) => {
        if (!program) return { size: 1 };

        // Special Case: "നാടകം" always 10
        if (program.includes("നാടകം")) {
            return { size: 10 };
        }

        // Special Case: "മുകാഭിനയം" (Mime) -> strict 7 members
        if (program.includes("മുകാഭിനയം")) {
            return { size: 7 };
        }

        const match = program.match(/\((\d+)\)/); // Look for (number)
        const size = match ? parseInt(match[1]) : 1;

        // Fallback for older format "7 പേർ"
        if (!match) {
            const matchOld = program.match(/(\d+)\s*പേർ/);
            if (matchOld) return { size: parseInt(matchOld[1]) };
            // Default fallback if no number found, though most have it
            return { size: 1 };
        }

        return { size };
    };

    const handleAddRegistration = () => {
        setEditingId(null);
        setNewRegData({
            name: "", // Will be fetched
            admissionNumber: "",
            category: "Individual-Onstage",
            program: ""
        });
        setGroupMembers([]); // Reset group members
        setShowModal(true);
    };

    const handleEdit = (reg) => {
        setEditingId(reg.regId);
        const progInfo = PROGRAM_DATA.find(p => p.name === reg.program);
        let category = "Individual-Onstage";
        if (progInfo) {
            if (progInfo.type === "Group") category = "Group";
            else if (progInfo.categoryType === "Offstage") category = "Individual-Offstage";
        } else if (reg.category === "Group") {
            category = "Group";
        } else if (reg.category === "Individual") {
            category = "Individual-Onstage";
        }

        // Note: Formatting for edit is tricky if we move to complex group storage.
        // For now, "Edit" on a Team Leader could potentially pull up the team, 
        // but simplification: Admin "Edit" primarily fixes typos in the simplified row.
        // We won't support full Team structure editing in this simple modal yet, 
        // as re-linking members is complex. 
        // Edit will behave as "Edit this single entry".

        setNewRegData({
            name: reg.name,
            admissionNumber: reg.admissionNumber || "",
            category: category,
            program: reg.program
        });
        setGroupMembers([]); // Edit mode for single row doesn't trigger group logic yet
        setShowModal(true);
    };



    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this registration?")) {
            try {
                const { db } = await import("../../firebaseConfig");
                const { doc, deleteDoc } = await import("firebase/firestore");

                await deleteDoc(doc(db, "registrations", id));
                // State updates automatically via onSnapshot
            } catch (err) {
                console.error("Error deleting registration:", err);
                alert("Failed to delete registration");
            }
        }
    };

    const handleSaveRegistration = async () => {
        // 1. Prepare Admission Numbers for Validation
        let admissionNumbersToValidate = [];

        if (newRegData.category === "Group" && !editingId) {
            if (!newRegData.program) {
                alert("Please select a program.");
                return;
            }
            // Check all members (Admission Numbers) filled
            for (let i = 0; i < groupMembers.length; i++) {
                if (!groupMembers[i].admissionNumber) {
                    alert(`Please enter Admission Number for Member ${i + 1} (${i === 0 ? 'Team Leader' : 'Member'}).`);
                    return;
                }
                admissionNumbersToValidate.push(groupMembers[i].admissionNumber.trim());
            }
        } else {
            // Individual / Single Edit
            if (!newRegData.program || (newRegData.category !== "Group" && !newRegData.admissionNumber)) {
                alert("Please fill in all fields including Admission Number.");
                return;
            }
            admissionNumbersToValidate.push(newRegData.admissionNumber.trim());
        }

        // 2. Validate with Backend and Fetch Names
        let studentDetailsMap = {};
        try {
            const response = await fetch('/validate-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNumbers: admissionNumbersToValidate })
            });

            const data = await response.json();
            if (!data.success) {
                alert(data.message);
                return; // Stop if invalid
            }
            studentDetailsMap = data.studentDetails;

        } catch (err) {
            console.error("Validation error:", err);
            alert("Could not validate admission numbers. Is the server running?");
            return;
        }

        // --- NEW: CHECK INDIVIDUAL EVENT LIMIT (MAX 4) ---
        // Only applicable if we are adding a NEW Individual registration
        if (!editingId && newRegData.category.startsWith("Individual")) {
            const admNoToCheck = newRegData.admissionNumber;
            // Count how many individual registrations this student already has
            const existingIndividualCount = registrations.filter(r =>
                r.admissionNumber === admNoToCheck &&
                r.category.startsWith("Individual")
            ).length;

            if (existingIndividualCount >= 4) {
                alert(`Student ${admNoToCheck} has already registered for ${existingIndividualCount} individual events. The limit is 4.`);
                return;
            }
        }

        // --- NEW: CHECK GROUP EVENT LIMIT (MAX 2) ---
        if (!editingId && newRegData.category === "Group") {
            for (const member of groupMembers) {
                const admNoToCheck = member.admissionNumber;
                if (!admNoToCheck) continue; // Should be caught by earlier validation, but safety first

                const existingGroupCount = registrations.filter(r =>
                    r.admissionNumber === admNoToCheck &&
                    r.category === "Group"
                ).length;

                if (existingGroupCount >= 2) {
                    alert(`Member ${admNoToCheck} (${studentDetailsMap[admNoToCheck]?.name || 'Unknown'}) is already in ${existingGroupCount} group events. The limit is 2.`);
                    return;
                }
            }
        }
        // ------------------------------------------------

        // 3. Confirmation Step
        let confirmMessage = "";
        const mainAdmNo = admissionNumbersToValidate[0];
        const studentName = studentDetailsMap[mainAdmNo]?.name || "Unknown Student";

        if (newRegData.category === "Group" && !editingId) {
            confirmMessage = `Confirm Group Registration?\n\n` +
                `Program: ${newRegData.program}\n` +
                `Team Leader: ${studentName} (${mainAdmNo})\n` +
                `Total Members: ${groupMembers.length}\n\n` +
                `Proceed to save?`;
        } else {
            const typeLabel = editingId ? "Edit" : "New";
            confirmMessage = `Confirm ${typeLabel} Registration?\n\n` +
                `Name: ${studentName}\n` +
                `Admission No: ${mainAdmNo}\n` +
                `Program: ${newRegData.program}\n\n` +
                `Proceed to save?`;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        // 4. Save to Firebase using Authenticated Data
        try {
            const { db } = await import("../../firebaseConfig");
            const { collection, addDoc, doc, updateDoc } = await import("firebase/firestore");
            const now = new Date();

            if (newRegData.category === "Group" && !editingId) {
                // BATCH SAVE GROUP
                const leaderId = groupMembers[0].admissionNumber;

                const batchPromises = groupMembers.map((member, index) => {
                    const admNo = member.admissionNumber.trim();
                    const details = studentDetailsMap[admNo];

                    if (!details) {
                        console.error(`Missing details for ${admNo}`);
                        throw new Error(`Missing details for ${admNo}`);
                    }

                    return addDoc(collection(db, "registrations"), {
                        name: details.name,
                        admissionNumber: admNo,
                        program: newRegData.program,
                        branch: details.branch || "N/A",
                        semester: details.semester || "N/A",
                        category: "Group",
                        role: index === 0 ? "Team Leader" : "Member",
                        teamLeaderId: leaderId,
                        date: now.toLocaleDateString(),
                        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: "Registered",
                        timestamp: now
                    });
                });

                await Promise.all(batchPromises);

            } else {
                // SINGLE SAVE / EDIT
                const admNo = newRegData.admissionNumber.trim();
                const details = studentDetailsMap[admNo];

                if (!details) {
                    alert(`Could not find details for ${admNo}`);
                    return;
                }

                const docData = {
                    name: details.name,
                    admissionNumber: admNo,
                    branch: details.branch || "N/A",
                    semester: details.semester || "N/A",
                    program: newRegData.program,
                    category: newRegData.category,
                };

                if (newRegData.category !== "Group") {
                    docData.role = "Individual";
                    docData.teamLeaderId = admNo;
                }

                if (editingId) {
                    const regRef = doc(db, "registrations", editingId);
                    await updateDoc(regRef, docData);
                } else {
                    await addDoc(collection(db, "registrations"), {
                        ...docData,
                        date: now.toLocaleDateString(),
                        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: "Registered",
                        timestamp: now
                    });
                }
            }

            setShowModal(false);

        } catch (err) {
            console.error("Error saving registration:", err);
            alert("Error saving to database");
        }
    };

    // Handle Program Change to gen inputs
    const handleProgramChange = (e) => {
        const prog = e.target.value;
        const cat = newRegData.category; // current cat

        setNewRegData({ ...newRegData, program: prog });

        if (cat === "Group" && !editingId) {
            const { size } = getProgramLimits(prog);
            // Init array
            const initialMembers = Array(size).fill(null).map(() => ({ name: "", admissionNumber: "" }));
            setGroupMembers(initialMembers);
        }
    };

    // Update member field
    const updateMember = (index, field, value) => {
        const updated = [...groupMembers];
        updated[index][field] = value;
        setGroupMembers(updated);
    };

    // Get available programs based on selected category
    const availablePrograms = PROGRAM_DATA.filter(p => {
        if (filterCategory === "All") return true;
        if (filterCategory === "Individual-Onstage") return p.type === "Individual" && p.categoryType === "Onstage";
        if (filterCategory === "Individual-Offstage") return p.type === "Individual" && p.categoryType === "Offstage";
        if (filterCategory === "Group") return p.type === "Group";
        return true;
    }).map(p => p.name).sort();

    const filteredRegs = registrations.filter(reg => {
        const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.regId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProgram = filterProgram === "All" || reg.program === filterProgram;

        let matchesCategory = true;
        if (filterCategory !== "All") {
            const programInfo = PROGRAM_DATA.find(p => p.name === reg.program);
            if (programInfo) {
                if (filterCategory === "Individual-Onstage") matchesCategory = programInfo.type === "Individual" && programInfo.categoryType === "Onstage";
                else if (filterCategory === "Individual-Offstage") matchesCategory = programInfo.type === "Individual" && programInfo.categoryType === "Offstage";
                else if (filterCategory === "Group") matchesCategory = programInfo.type === "Group";
            } else {
                matchesCategory = false;
            }
        }

        // GROUP FILTER: Only show Team Leaders in the main list for Groups
        let isGroupLeaderOrIndividual = true;
        // Check if it's a group program from data OR from category field
        let isGroup = reg.category === "Group";
        if (!isGroup) {
            const pInfo = PROGRAM_DATA.find(p => p.name === reg.program);
            if (pInfo && pInfo.type === "Group") isGroup = true;
        }

        if (isGroup) {
            isGroupLeaderOrIndividual = reg.role === "Team Leader";
        }

        return matchesSearch && matchesProgram && matchesCategory && isGroupLeaderOrIndividual;
    });

    const [teamModalData, setTeamModalData] = useState(null);

    const handleViewTeam = (leaderReg) => {
        // Find all members with same teamLeaderId and program
        const members = registrations.filter(r =>
            r.teamLeaderId === leaderReg.teamLeaderId &&
            r.program === leaderReg.program
        );
        // Sort: Leader first
        members.sort((a, b) => {
            if (a.role === "Team Leader") return -1;
            if (b.role === "Team Leader") return 1;
            return a.name.localeCompare(b.name);
        });

        setTeamModalData({
            leader: leaderReg,
            members: members
        });
    };

    const closeTeamModal = () => setTeamModalData(null);

    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Registration List", 14, 22);

        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["SL.NO", "Admission No", "Name", "Program", "Branch", "Semester", "Type", "Status"];
        const tableRows = [];

        filteredRegs.forEach((reg, index) => {
            const regData = [
                index + 1,
                reg.admissionNumber,
                reg.name + (reg.role === "Team Leader" ? " (L)" : ""),
                reg.program,
                reg.branch || '-',
                reg.semester || '-',
                reg.category,
                reg.status
            ];
            tableRows.push(regData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        doc.save("registrations_list.pdf");
    };

    const downloadTeamPDF = () => {
        if (!teamModalData) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Team Details: ${teamModalData.leader.program}`, 14, 22);

        doc.setFontSize(12);
        doc.text(`Team Leader: ${teamModalData.leader.name} (${teamModalData.leader.admissionNumber})`, 14, 32);
        doc.text(`Total Members: ${teamModalData.members.length}`, 14, 40);

        const tableColumn = ["SL", "Name", "Admission No", "Branch", "Semester", "Role"];
        const tableRows = teamModalData.members.map((m, i) => [
            i + 1,
            m.name,
            m.admissionNumber,
            m.branch || "N/A",
            m.semester || "N/A",
            m.role
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save(`Team_${teamModalData.leader.admissionNumber}.pdf`);
    };

    return (
        <div className="admin-registrations">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--admin-primary)' }}>Registration Management</h2>
                <button className="admin-btn admin-btn-primary" onClick={handleAddRegistration} style={{ marginRight: '1rem' }}>
                    + Add New
                </button>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            setFilterProgram("All"); // Reset program filter when category changes
                        }}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '0.8rem', border: '1px solid #ddd', minWidth: '180px' }}
                    >
                        <option value="All">All Categories</option>
                        <option value="Individual-Offstage">Individual - Offstage</option>
                        <option value="Individual-Onstage">Individual - Onstage</option>
                        <option value="Group">Group</option>
                    </select>
                    <select
                        value={filterProgram}
                        onChange={(e) => setFilterProgram(e.target.value)}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '0.8rem', border: '1px solid #ddd', minWidth: '200px', maxWidth: '300px' }}
                    >
                        <option value="All">All Programs</option>
                        {availablePrograms.map(prog => (
                            <option key={prog} value={prog}>{prog}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '0.8rem', border: '1px solid #ddd', width: '250px' }}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>SL.NO</th>
                            <th>Admission Number</th>
                            <th>Name</th>
                            <th>Program</th>
                            <th>Branch</th>
                            <th>Semester</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegs.map((reg, index) => (
                            <tr key={reg.regId}>
                                <td style={{ fontWeight: 'bold' }}>{index + 1}</td>
                                <td>{reg.admissionNumber}</td>
                                <td>
                                    {reg.name}
                                    {reg.role === "Team Leader" && <span style={{ fontSize: '0.8em', marginLeft: '5px', color: 'green' }}>(Leader)</span>}
                                </td>
                                <td>{reg.program}</td>
                                <td>{reg.branch || "N/A"}</td>
                                <td>{reg.semester || "N/A"}</td>
                                <td>{reg.date}</td>
                                <td>{reg.category}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.9rem',
                                            backgroundColor: '#e3f2fd',
                                        }}>
                                            {reg.status}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    {reg.category === "Group" && reg.role === "Team Leader" && (
                                        <button className="admin-btn" style={{ background: '#e3f2fd', color: '#1a73e8', padding: '0.5rem', marginRight: '5px' }} onClick={() => handleViewTeam(reg)}>View Team</button>
                                    )}
                                    <button className="admin-btn" style={{ background: 'none', color: '#1a73e8', padding: '0.5rem' }} onClick={() => handleEdit(reg)}>Edit</button>
                                    <button className="admin-btn" style={{ background: 'none', color: '#d93025', padding: '0.5rem' }} onClick={() => handleDelete(reg.regId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => downloadCSV(filteredRegs, 'registrations.csv')}
                >
                    Download List CSV
                </button>
                <button
                    className="admin-btn admin-btn-primary"
                    style={{ marginLeft: '1rem' }}
                    onClick={downloadPDF}
                >
                    Download List PDF
                </button>
                <button
                    className="admin-btn"
                    style={{ marginLeft: '1rem', background: 'none', border: '1px solid #ccc' }}
                    onClick={() => window.print()}
                >
                    Print View
                </button>
            </div>

            {/* TEAM DETAILS MODAL */}
            {teamModalData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div id="team-details-content">
                            <h2 style={{ color: 'var(--admin-primary)', marginBottom: '1rem' }}>Team Details</h2>
                            <p><strong>Program:</strong> {teamModalData.leader.program}</p>
                            <p><strong>Team Leader:</strong> {teamModalData.leader.name} ({teamModalData.leader.admissionNumber})</p>
                            <p><strong>Total Members:</strong> {teamModalData.members.length}</p>

                            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}>Name</th>
                                        <th style={{ padding: '10px' }}>Admission No</th>
                                        <th style={{ padding: '10px' }}>Branch</th>
                                        <th style={{ padding: '10px' }}>Semester</th>
                                        <th style={{ padding: '10px' }}>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamModalData.members.map(m => (
                                        <tr key={m.regId} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{m.name}</td>
                                            <td style={{ padding: '10px' }}>{m.admissionNumber}</td>
                                            <td style={{ padding: '10px' }}>{m.branch || "N/A"}</td>
                                            <td style={{ padding: '10px' }}>{m.semester || "N/A"}</td>
                                            <td style={{ padding: '10px' }}>{m.role}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button className="admin-btn admin-btn-secondary" onClick={() => downloadCSV(teamModalData.members, `Team_${teamModalData.leader.name}.csv`)}>Download CSV</button>
                            <button className="admin-btn admin-btn-primary" onClick={downloadTeamPDF}>Download PDF</button>
                            <button className="admin-btn" onClick={closeTeamModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '1.5rem', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ color: 'var(--admin-primary)', marginBottom: '2rem' }}>{editingId ? "Edit Registration" : "Add New Registration"}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <select
                                value={newRegData.category}
                                onChange={(e) => {
                                    setNewRegData({ ...newRegData, category: e.target.value, program: "" });
                                    setGroupMembers([]); // Reset members on category change
                                }}
                                style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                                disabled={!!editingId} // Disable category switch on edit to avoid data mismatch
                            >
                                <option value="Individual-Onstage">Individual - Onstage</option>
                                <option value="Individual-Offstage">Individual - Offstage</option>
                                <option value="Group">Group</option>
                            </select>

                            <select
                                value={newRegData.program}
                                onChange={handleProgramChange}
                                style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                            >
                                <option value="">Select Program</option>
                                {PROGRAM_DATA.filter(p => {
                                    if (newRegData.category === "Individual-Onstage") return p.type === "Individual" && p.categoryType === "Onstage";
                                    if (newRegData.category === "Individual-Offstage") return p.type === "Individual" && p.categoryType === "Offstage";
                                    if (newRegData.category === "Group") return p.type === "Group";
                                    return false;
                                }).map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>

                            {/* DYNAMIC FORM RENDERING */}
                            {newRegData.category === "Group" && !editingId ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {groupMembers.map((member, index) => (
                                        <div key={index} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#f9f9f9' }}>
                                            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {index === 0 ? "Team Leader" : `Member ${index + 1}`}
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {/* Removed Name Input */}
                                                <input
                                                    type="text"
                                                    placeholder="Admission No."
                                                    value={member.admissionNumber}
                                                    onChange={(e) => updateMember(index, 'admissionNumber', e.target.value)}
                                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {newRegData.program && groupMembers.length === 0 && <p style={{ color: 'red' }}>Error: No members limit found for this program.</p>}
                                </div>
                            ) : (
                                // INDIVIDUAL OR EDIT MODE
                                <>
                                    {/* Removed Name Input */}
                                    <input
                                        type="text"
                                        placeholder="Admission Number"
                                        value={newRegData.admissionNumber}
                                        onChange={(e) => setNewRegData({ ...newRegData, admissionNumber: e.target.value })}
                                        style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                                    />
                                    {editingId && <p style={{ fontSize: '0.8rem', color: '#666' }}>Name: {newRegData.name} (Updates automatically on save)</p>}
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="admin-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="admin-btn admin-btn-primary" onClick={handleSaveRegistration}>
                                    {editingId ? "Verify & Update" : "Verify & Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default RegistrationManagement;
