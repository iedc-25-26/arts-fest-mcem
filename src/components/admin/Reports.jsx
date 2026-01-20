import { PROGRAM_DATA } from "../../utils/programData";
import { downloadCSV } from "../../utils/exportUtils";
import "./Admin.css";

const Reports = () => {
    // Get real data from localStorage
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');

    // Calculate Program-wise counts
    const programCounts = {};
    registrations.forEach(reg => {
        programCounts[reg.program] = (programCounts[reg.program] || 0) + 1;
    });

    const programWiseCount = Object.entries(programCounts)
        .map(([program, count]) => ({ program, count }))
        .sort((a, b) => b.count - a.count); // Sort by highest count

    // Calculate Category-wise counts
    const categoryCounts = {};
    registrations.forEach(reg => {
        const programInfo = PROGRAM_DATA.find(p => p.name === reg.program);
        if (programInfo) {
            // Use 'category' (e.g., Music, Dance) or 'categoryType' (Onstage/Offstage) depending on preference.
            // Using 'category' field for broader grouping as per original mock data type.
            const cat = programInfo.category || "Other";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    const categoryWiseCount = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="admin-reports">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--admin-primary)' }}>Analytics & Reports</h2>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => window.print()}
                >
                    Generate Full Report (PDF)
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Program Wise */}
                <div className="admin-table-container">
                    <h3 style={{ marginBottom: '2rem', color: 'var(--admin-primary)' }}>Program-wise Registrations</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Program</th>
                                <th style={{ textAlign: 'right' }}>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programWiseCount.map(item => (
                                <tr key={item.program}>
                                    <td>{item.program}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '2rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ width: '100%' }}>Export CSV</button>
                    </div>
                </div>

                {/* Category Wise */}
                <div className="admin-table-container">
                    <h3 style={{ marginBottom: '2rem', color: 'var(--admin-primary)' }}>Category-wise Registrations</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th style={{ textAlign: 'right' }}>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryWiseCount.map(item => (
                                <tr key={item.category}>
                                    <td>{item.category}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '2rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ width: '100%' }}>Export CSV</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
