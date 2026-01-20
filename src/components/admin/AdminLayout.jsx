import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import "./Admin.css";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem("adminAuth") === "true";
        if (!loggedIn) {
            navigate("/admin");
        } else {
            setIsAdmin(true);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminAuth");
        navigate("/admin");
    };

    if (!isAdmin) return null;

    const navItems = [
        { path: "/admin-panel/dashboard", label: "Dashboard", ml: "ഡാഷ്‌ബോർഡ്", icon: "📊" },
        { path: "/admin-panel/programs", label: "Programs", ml: "പ്രോഗ്രാമുകൾ", icon: "🎨" },
        { path: "/admin-panel/registrations", label: "Registrations", ml: "രജിസ്‌ട്രേഷൻ", icon: "📝" },
    ];

    return (
        <div className="admin-body">
            <div className="admin-layout">
                {/* Sidebar */}
                <aside className="admin-sidebar">
                    <div className="admin-sidebar-header">
                        <h2>ARTSFEST</h2>
                    </div>
                    <nav className="admin-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
                            >
                                <span style={{ marginRight: '1rem' }}>{item.icon}</span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1rem' }}>{item.label}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.ml}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="admin-main">
                    <header className="admin-header">
                        <div className="admin-header-title">
                            <h3 style={{ margin: 0 }}>
                                {navItems.find(item => item.path === location.pathname)?.label || "Admin Panel"}
                            </h3>
                        </div>
                        <button className="admin-btn admin-btn-secondary" onClick={handleLogout}>
                            Logout
                        </button>
                    </header>
                    <div className="admin-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
