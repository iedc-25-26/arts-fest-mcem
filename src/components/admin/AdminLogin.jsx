import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded admin credentials as per plan
        if (username === "sk" && password === "sk123") {
            localStorage.setItem("adminAuth", "true");
            navigate("/admin-panel/dashboard");
        } else {
            alert("Invalid Credentials");
        }
    };

    return (
        <div className="admin-body">
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <h1>ARTSFEST ADMIN</h1>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '2rem' }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    borderRadius: '0.8rem',
                                    border: '1px solid #ddd',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    borderRadius: '0.8rem',
                                    border: '1px solid #ddd',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            style={{ width: '100%', padding: '1.2rem' }}
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
