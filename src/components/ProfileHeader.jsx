import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({ studentName, admissionNumber }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{
                position: "absolute",
                top: "2rem",
                right: "2rem",
                zIndex: 1000
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                backgroundColor: isHovered ? "rgba(255, 255, 255, 0.95)" : "transparent",
                padding: isHovered ? "1rem" : "0",
                borderRadius: "50px", // Rounded when hovering
                transition: "all 0.3s ease",
                boxShadow: isHovered ? "0 4px 15px rgba(0,0,0,0.2)" : "none",
                cursor: "pointer",
                maxWidth: isHovered ? "400px" : "60px", // Expand width
                overflow: "hidden" // Hide details when collapsed
            }}>
                {/* Avatar always visible */}
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
                    fontSize: "1.5rem",
                    flexShrink: 0, // Prevent shrinking
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}>
                    {studentName ? studentName.charAt(0).toUpperCase() : "P"}
                </div>

                {/* Details - Visible on hover or hidden */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    opacity: isHovered ? 1 : 0,
                    width: isHovered ? "auto" : "0",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap"
                }}>
                    <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#333" }}>{studentName}</h2>
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#666" }}>Admission.No: {admissionNumber}</span>
                    <button
                        type="button"
                        style={{
                            marginTop: "0.5rem",
                            padding: "0.3rem 1rem",
                            borderRadius: "15px",
                            border: "none",
                            backgroundColor: "#ff4d4d",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            sessionStorage.clear();
                            navigate('/');
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
