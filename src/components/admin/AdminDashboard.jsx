import React, { useState, useEffect } from "react";
import { PROGRAM_DATA } from "../../utils/programData";
import "./Admin.css";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        totalPrograms: 0,
        individualOnstage: 0,
        individualOffstage: 0,
        groupPrograms: 0,
        todayRegistrations: 0
    });

    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        let unsubscribe = () => { };

        const fetchStats = async () => {
            try {
                const { db } = await import("../../firebaseConfig");
                const { collection, onSnapshot, query, orderBy, limit } = await import("firebase/firestore");

                const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const regs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const today = new Date().toLocaleDateString();

                    setStats({
                        totalRegistrations: regs.length,
                        totalPrograms: PROGRAM_DATA.length,
                        individualOnstage: PROGRAM_DATA.filter(p => p.type === 'Individual' && p.categoryType === 'Onstage').length,
                        individualOffstage: PROGRAM_DATA.filter(p => p.type === 'Individual' && p.categoryType === 'Offstage').length,
                        groupPrograms: PROGRAM_DATA.filter(p => p.type === 'Group').length,
                        todayRegistrations: regs.filter(r => r.date === today).length
                    });

                    setRecentActivities(regs.slice(0, 5));
                });

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };
        fetchStats();

        return () => unsubscribe();
    }, []);

    return (
        <div className="admin-dashboard">
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <h3>Total Registrations</h3>
                    <div className="value">{stats.totalRegistrations}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Programs</h3>
                    <div className="value">{stats.totalPrograms}</div>
                </div>
                <div className="stat-card">
                    <h3>Individual Offstage</h3>
                    <div className="value" style={{ color: '#e37400' }}>{stats.individualOffstage}</div>
                </div>
                <div className="stat-card">
                    <h3>Individual Onstage</h3>
                    <div className="value" style={{ color: '#1a73e8' }}>{stats.individualOnstage}</div>
                </div>
                <div className="stat-card">
                    <h3>Group Programs</h3>
                    <div className="value" style={{ color: '#a50e0e' }}>{stats.groupPrograms}</div>
                </div>

                <div className="stat-card">
                    <h3>Today's Registrations</h3>
                    <div className="value" style={{ color: '#008000' }}>{stats.todayRegistrations}</div>
                </div>
            </div>

            <div className="admin-table-container">
                <h3 style={{ marginBottom: '2rem', color: 'var(--admin-primary)' }}>Recent Activities</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Program</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivities.map(activity => (
                            <tr key={activity.id}>
                                <td>{activity.name}</td>
                                <td>{activity.program}</td>
                                <td>{activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleString() : activity.date}</td>
                                <td>
                                    <span style={{
                                        backgroundColor: '#e6fcf5',
                                        color: '#0ca678',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem'
                                    }}>
                                        {activity.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {recentActivities.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No recent registrations</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
