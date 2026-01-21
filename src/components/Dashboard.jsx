import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";
import ProfileHeader from "./ProfileHeader"; // Ensure styles are available

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Provide a fallback in case the user navigates directly to /dashboard without logging in
    const admissionNumber = location.state?.admissionNumber || sessionStorage.getItem("admissionNumber");
    const studentName = location.state?.studentName || sessionStorage.getItem("studentName");

    const [userRegistrations, setUserRegistrations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showInstructions, setShowInstructions] = React.useState(true);

    const InstructionsModal = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            opacity: showInstructions ? 1 : 0,
            pointerEvents: showInstructions ? 'auto' : 'none',
            transition: 'opacity 0.3s ease'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <button
                    onClick={() => setShowInstructions(false)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ textAlign: 'center', color: '#d32f2f', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
                    IMPORTANT INSTRUCTIONS
                </h2>

                <h3 style={{ textAlign: 'center', color: '#0093E9', marginBottom: '1rem' }}>
                    Ma'din College of Engineering & Management Arts Fest 2K26
                </h3>

                <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        📍2026 ഫെബ്രുവരി 11,12 തീയതികളിലായി നടത്തുന്ന കോളേജ് ആർട്സ് ഫെസ്റ്റിനുള്ള രെജിസ്ട്രേഷൻ ലിങ്ക് ആണ് ഇതോടൊപ്പം ഷെയർ ചെയ്യുന്നത്.
                        ഇതോടൊപ്പം നൽകിയിട്ടുള്ള നിയമാവലി കൂടെ വായിച്ചു ബോധ്യപ്പെട്ടതിനു ശേഷം മാത്രം വിദ്യാർഥികൾ രെജിസ്ട്രേഷൻ പ്രോസസ്സ് ആരംഭിക്കേണ്ടതാണ്. മത്സരങ്ങൾ നടത്തുന്നത് branch wise/year wise/house wise ഇങ്ങനെ ഒരു രീതിയിലും അല്ല.
                        താഴെ തന്നിരിക്കുന്ന നിയമങ്ങൾ പാലിച്ചു കൊണ്ട് താല്പര്യമുള്ള ഏത് വിദ്യാർത്ഥിക്കും രജിസ്റ്റർ ചെയ്യാവുന്നതാണ്.
                    </p>

                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ ചുവടെ ചേർക്കുന്നു:</p>

                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>
                            1. ഒരു വിദ്യാർത്ഥിക്ക് <strong>നാല് INDIVIDUAL EVENTS</strong> - ലും , <strong>രണ്ട് GROUP EVENTS</strong>- ലും ആണ് രജിസ്റ്റർ ചെയ്യുവാൻ സാധിക്കുക. ഇതിന് വ്യത്യസ്ത ഓപ്ഷനുകൾ നൽകിയിട്ടുണ്ട്.
                        </li>
                        <li>
                            2. രജിസ്റ്റർ ചെയ്യുവാൻ വിദ്യാർത്ഥിയുടെ അഡ്മിഷൻ നമ്പർ നിർബന്ധമാണ്.
                        </li>
                        <li>
                            3. ടീം ലീഡറിനു മാത്രമാണ് ഗ്രൂപ്പ് ഇവന്റ്സിന്റെ രജിസ്ട്രേഷൻ നടത്തുവാൻ സാധിക്കുക. ഗ്രൂപ്പ് ഏത് രീതിയിലും ഫോം ചെയ്യാവുന്നതാണ്. ഏത് ബ്രാഞ്ചിൽ നിന്നുള്ള വിദ്യാർത്ഥികളെയോ ഏത് വർഷത്തെ വിദ്യാർത്ഥികളെയോ select ചെയ്യാവുന്നതാണ്.
                        </li>
                        <li>
                            4. ടീം ലീഡർ നിങ്ങളുടെ ടീമിലെ എല്ലാ അംഗങ്ങളുടെയും അഡ്മിഷൻ നമ്പർ മുൻകൂട്ടി വാങ്ങിയതിന് ശേഷം മാത്രം രജിസ്ട്രേഷൻ നടപടികൾ ആരംഭിക്കുക.
                        </li>
                        <li>
                            5. LAST DATE for event Registration will be 23.01.2026
                        </li>
                    </ul>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => setShowInstructions(false)}
                        style={{
                            backgroundColor: '#0093E9',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 2rem',
                            borderRadius: '2rem',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        I Understand, Proceed
                    </button>
                </div>
            </div>
        </div>
    );

    React.useEffect(() => {
        const fetchUserRegs = async () => {
            if (!admissionNumber) return;
            try {
                const { db } = await import("../firebaseConfig");
                const { collection, query, where, getDocs } = await import("firebase/firestore");

                // Fetch where admissionNumber is the main registrant OR maybe a group member?
                // The current schema saves each member as a separate document with their admissionNumber.
                // So simple query by admissionNumber should work for both Individual and Group members.

                const q = query(collection(db, "registrations"), where("admissionNumber", "==", admissionNumber));
                const querySnapshot = await getDocs(q);
                const regs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserRegistrations(regs);
            } catch (error) {
                console.error("Error fetching user registrations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserRegs();
    }, [admissionNumber]);

    return (
        <>
            <InstructionsModal />
            <section style={{ minHeight: "100vh", padding: "2rem" }}>
                <div style={{
                    position: "absolute",
                    top: "2rem",
                    right: "2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    color: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    padding: "1rem",
                    borderRadius: "15px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    zIndex: 10
                }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#0093E9",
                        fontWeight: "bold",
                        fontSize: "1.5rem"
                    }}>
                        {studentName ? studentName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <h2 style={{ fontSize: "1.6rem", margin: 0 }}>{studentName}</h2>
                        <span style={{ fontSize: "1rem", fontWeight: "bold" }}>{admissionNumber}</span>
                        <button
                            type="button"
                            className="logout-btn"
                            style={{
                                marginTop: "0.5rem",
                                padding: "0.5rem 1.2rem",
                                borderRadius: "10px",
                                border: "none",
                                backgroundColor: "#fff",
                                color: "#0093E9",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "1rem"
                            }}
                            onClick={() => navigate('/')}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="auth" style={{ textAlign: "center", marginTop: "5rem" }}>
                    <h1>ART FEST 2K26</h1>
                    <div style={{ margin: "3rem 0", fontSize: "1.5rem", display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                        <button
                            className="dashboard-btn"
                            onClick={() => navigate("/individual", { state: { admissionNumber, studentName } })}
                        >
                            INDIVIDUAL
                        </button>
                        <button
                            className="dashboard-btn"
                            onClick={() => navigate("/group", { state: { admissionNumber, studentName } })}
                        >
                            GROUP
                        </button>
                    </div>

                    {/* User Registrations View */}
                    <div style={{
                        marginTop: "4rem",
                        textAlign: "center", // Centered text
                        backgroundColor: "rgba(255,255,255,0.9)",
                        padding: "2rem",
                        borderRadius: "1rem",
                        maxWidth: "800px",
                        margin: "4rem auto"
                    }}>
                        <h2 style={{ color: "#0093E9", borderBottom: "2px solid #ddd", paddingBottom: "1rem" }}>My Registrations</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : userRegistrations.length === 0 ? (
                            <p style={{ fontSize: "1.2rem", color: "#666", padding: "1rem 0" }}>You have not registered for any events yet.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f0f0f0", textAlign: "center" }}> {/* Center headers */}
                                        <th style={{ padding: "1rem" }}>Program</th>
                                        <th style={{ padding: "1rem" }}>Category</th>
                                        <th style={{ padding: "1rem" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRegistrations.map((reg) => (
                                        <tr key={reg.id} style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                                            <td style={{ padding: "1rem", fontSize: "1.2rem" }}>{reg.program}</td>
                                            <td style={{ padding: "1rem", fontSize: "1.2rem" }}>{reg.category}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <span style={{
                                                    backgroundColor: "#e6fcf5",
                                                    color: "#0ca678",
                                                    padding: "0.4rem 0.8rem",
                                                    borderRadius: "1rem",
                                                    fontSize: "0.9rem",
                                                    fontWeight: "bold"
                                                }}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Dashboard;
