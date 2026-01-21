import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";
import ProfileHeader from "./ProfileHeader";

const ThankYou = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const admissionNumber = location.state?.admissionNumber || sessionStorage.getItem("admissionNumber");
    const studentName = location.state?.studentName || sessionStorage.getItem("studentName");
    const selectedGroupPrograms = location.state?.selectedGroupPrograms;
    const groupMembers = location.state?.groupMembers;

    return (
        <section style={{
            minHeight: "100vh",
            width: "100%",
            background: "linear-gradient(160deg, rgba(0, 147, 233, 1) 0%, rgba(128, 208, 199, 1) 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative"
        }}>
            {/* Profile Header */}
            {/* Profile Header */}
            <ProfileHeader studentName={studentName} admissionNumber={admissionNumber} />

            <div className="auth" style={{ textAlign: "center", padding: "4rem", minWidth: "40rem" }}>
                <div style={{ fontSize: "8rem", marginBottom: "2rem" }}>🎉</div>

                {/* Group Details Section */}
                {selectedGroupPrograms && groupMembers && (
                    <div style={{
                        marginBottom: "3rem",
                        textAlign: "left"
                    }}>
                        <h2 style={{ color: "#0093E9", marginBottom: "1.5rem", borderBottom: "2px solid #0093E9", paddingBottom: "0.5rem" }}>
                            Registered Group Details
                        </h2>
                        {selectedGroupPrograms.map((program, progIndex) => {
                            // Find Team Leader Name for Summary
                            const members = groupMembers[program];
                            const leader = members.find(m => (typeof m === 'object' ? m.role === 'Team Leader' : false)) || members[0];
                            const leaderName = typeof leader === 'object' ? leader.name : leader;

                            return (
                                <details key={program} open={progIndex === 0} style={{
                                    marginBottom: "1.5rem",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    backgroundColor: "white",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                                }}>
                                    <summary style={{
                                        padding: "1.5rem",
                                        fontSize: "1.6rem",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        backgroundColor: "#f8f9fa",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        color: "#0093E9"
                                    }}>
                                        <span>{program}</span>
                                        <span style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}>
                                            Leader: <strong style={{ color: "#333" }}>{leaderName}</strong> (Click to view members)
                                        </span>
                                    </summary>

                                    <div style={{ padding: "1.5rem" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1.2rem" }}>
                                            <thead>
                                                <tr style={{ backgroundColor: "#f1f3f5", color: "#495057" }}>
                                                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Role</th>
                                                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Admission No</th>
                                                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Name</th>
                                                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Branch</th>
                                                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Sem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map((member, index) => {
                                                    if (!member) return null;
                                                    const isObject = typeof member === 'object';
                                                    const name = isObject ? member.name : member;
                                                    const admn = isObject ? member.admissionNumber : "N/A";
                                                    const branch = isObject ? member.branch : "-";
                                                    const semester = isObject ? member.semester : "-";

                                                    return (
                                                        <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                                                            <td style={{ padding: "10px", color: index === 0 ? "#0093E9" : "#666", fontWeight: index === 0 ? "bold" : "normal" }}>
                                                                {index === 0 ? "Leader" : `Member ${index + 1}`}
                                                            </td>
                                                            <td style={{ padding: "10px", color: "#333", fontWeight: "500" }}>
                                                                {admn}
                                                            </td>
                                                            <td style={{ padding: "10px", color: "#555" }}>
                                                                {name}
                                                            </td>
                                                            <td style={{ padding: "10px", color: "#555" }}>
                                                                {branch}
                                                            </td>
                                                            <td style={{ padding: "10px", color: "#555" }}>
                                                                {semester}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                )}
                <h1 style={{
                    fontSize: "4rem",
                    marginBottom: "1.5rem",
                    fontFamily: "'Righteous', cursive",
                    background: "-webkit-linear-gradient(#0093E9, #80D0C7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Thank You!
                </h1>
                <p style={{ fontSize: "1.8rem", color: "#666", marginBottom: "3rem" }}>
                    Your registration has been successfully submitted.
                </p>
                <button
                    className="dashboard-btn"
                    onClick={() => navigate("/dashboard", { state: { admissionNumber, studentName } })}
                    style={{ margin: "0 auto", width: "250px" }}
                >
                    BACK TO DASHBOARD
                </button>
            </div>
        </section>
    );
};

export default ThankYou;
