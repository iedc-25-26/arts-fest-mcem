import React, { useState } from "react";
import { PROGRAM_DATA } from "../../utils/programData";
import "./Admin.css";

const ProgramManagement = () => {
    const [programs, setPrograms] = useState(PROGRAM_DATA);

    const [showModal, setShowModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        type: "Individual",
        categoryType: "Onstage"
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this program?")) {
            setPrograms(programs.filter(p => p.id !== id));
        }
    };

    const handleEdit = (program) => {
        setEditingProgram(program);
        setFormData({
            name: program.name,
            category: program.category,
            type: program.type,
            categoryType: program.categoryType || "Onstage" // Default to Onstage if null/undefined for form
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingProgram(null);
        setFormData({
            name: "",
            category: "",
            type: "Individual",
            categoryType: "Onstage"
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.category) {
            alert("Please fill in all fields");
            return;
        }

        const programData = {
            ...formData,
            categoryType: formData.type === 'Group' ? null : formData.categoryType,
            status: "Active"
        };

        if (editingProgram) {
            setPrograms(programs.map(p => p.id === editingProgram.id ? { ...p, ...programData } : p));
        } else {
            const newId = Math.max(...programs.map(p => p.id), 0) + 1;
            setPrograms([...programs, { id: newId, ...programData }]);
        }
        setShowModal(false);
    };

    const renderTable = (title, data) => (
        <div className="admin-table-section" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--admin-primary)', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>{title}</h3>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.category}</td>
                                <td>{p.type}{p.categoryType ? ` - ${p.categoryType}` : ''}</td>
                                <td>
                                    <span style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.9rem',
                                        backgroundColor: p.status === 'Active' ? '#e6f4ea' : '#fce8e6',
                                        color: p.status === 'Active' ? '#1e8e3e' : '#d93025'
                                    }}>
                                        {p.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="admin-btn" style={{ background: 'none', color: '#1a73e8' }} onClick={() => handleEdit(p)}>Edit</button>
                                    <button className="admin-btn" style={{ background: 'none', color: '#d93025' }} onClick={() => handleDelete(p.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No programs found in this category.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="admin-programs">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--admin-primary)' }}>Program List</h2>
                <button className="admin-btn admin-btn-primary" onClick={handleAdd}>
                    + Add New Program
                </button>
            </div>

            {renderTable("Individual Items - Offstage", programs.filter(p => p.type === 'Individual' && p.categoryType === 'Offstage'))}
            {renderTable("Individual Items - Onstage", programs.filter(p => p.type === 'Individual' && p.categoryType === 'Onstage'))}
            {renderTable("Group Items", programs.filter(p => p.type === 'Group'))}

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '1.5rem', width: '500px' }}>
                        <h2 style={{ color: 'var(--admin-primary)', marginBottom: '2rem' }}>{editingProgram ? "Edit Program" : "Add New Program"}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Program Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', flex: 1 }}
                                >
                                    <option value="Individual">Individual</option>
                                    <option value="Group">Group</option>
                                </select>
                                {formData.type === 'Individual' && (
                                    <select
                                        value={formData.categoryType}
                                        onChange={(e) => setFormData({ ...formData, categoryType: e.target.value })}
                                        style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', flex: 1 }}
                                    >
                                        <option value="Onstage">Onstage</option>
                                        <option value="Offstage">Offstage</option>
                                    </select>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="admin-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                                    {editingProgram ? "Update Program" : "Save Program"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramManagement;
