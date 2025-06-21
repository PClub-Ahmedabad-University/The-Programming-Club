"use client";

import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdAdd, MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";

const RecruitmentSection = () => {
    const [roles, setRoles] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [newMember, setNewMember] = useState({ name: "", linkedin: "" });
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
        const [formData, setFormData] = useState({
        title: "",
        image: "",
        google_form: "",
        isRecruitmentOpen: false,
        leader: { name: "", linkedin: "" },
        members: []
    });
    const [newTeamMember, setNewTeamMember] = useState({ name: "", linkedin: "" });

    const fetchRecruitmentRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/recruitment/get');
            if (!response.ok) throw new Error('Failed to fetch roles');
            const data = await response.json();
            setRoles(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Failed to load recruitment roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruitmentRoles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLeaderChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            leader: {
                ...prev.leader,
                [name]: value
            }
        }));
    };

    const handleAddTeamMember = () => {
        if (!newTeamMember.name || !newTeamMember.linkedin) {
            toast.error('Please fill all member fields');
            return;
        }
        setFormData(prev => ({
            ...prev,
            members: [...prev.members, { ...newTeamMember }]
        }));
        setNewTeamMember({ name: "", linkedin: "" });
    };

    const handleRemoveTeamMember = (index) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/recruitment/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add role');
            }

            toast.success('Role added successfully');
            setShowAddForm(false);
            setFormData({
                title: "",
                image: "",
                google_form: "",
                isRecruitmentOpen: false,
                leader: { name: "", linkedin: "" },
                members: []
            });
            fetchRecruitmentRoles();
        } catch (error) {
            console.error('Error adding role:', error);
            toast.error(error.message || 'Failed to add role');
        }
    };

    const toggleRecruitmentStatus = async (id, currentStatus) => {
        try {
            const response = await fetch(`/api/recruitment/update/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRecruitmentOpen: !currentStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            toast.success(`Recruitment ${!currentStatus ? 'opened' : 'closed'} successfully`);
            fetchRecruitmentRoles();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update recruitment status');
        }
    };

    const openEditModal = (role) => {
        setEditRole({ ...role });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditRole(null);
        setNewMember({ name: "", linkedin: "" });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditRole(prev => ({ ...prev, [name]: value }));
    };

    const handleEditLeaderChange = (e) => {
        const { name, value } = e.target;
        setEditRole(prev => ({ ...prev, leader: { ...prev.leader, [name]: value } }));
    };

    const saveRoleChanges = async () => {
        if (!editRole) return;
        try {
            const response = await fetch(`/api/recruitment/update/${editRole._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editRole.title,
                    google_form: editRole.google_form,
                    image: editRole.image,
                    isRecruitmentOpen: editRole.isRecruitmentOpen,
                    leader: editRole.leader
                })
            });
            if (!response.ok) throw new Error('Failed to update role');
            toast.success('Role updated');
            closeEditModal();
            fetchRecruitmentRoles();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to update role');
        }
    };

    const addMember = async () => {
        if (!newMember.name || !newMember.linkedin) return toast.error('Fill member details');
        try {
            const response = await fetch(`/api/recruitment/update/${editRole._id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            if (!response.ok) throw new Error('Failed to add member');
            toast.success('Member added');
            setNewMember({ name: "", linkedin: "" });
            const updated = await response.json();
            setEditRole(updated);
            fetchRecruitmentRoles();
        } catch (error) {
            toast.error(error.message || 'Failed to add member');
        }
    };

    const removeMember = async (memberId) => {
        try {
            const response = await fetch(`/api/recruitment/update/${editRole._id}/members`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });
            if (!response.ok) throw new Error('Failed to remove member');
            toast.success('Member removed');
            setEditRole(prev => ({ ...prev, members: prev.members.filter(m => m._id !== memberId) }));
            fetchRecruitmentRoles();
        } catch (error) {
            toast.error(error.message || 'Failed to remove member');
        }
    };

    const deleteRole = async (id) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            const response = await fetch(`/api/recruitment/delete/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete role');

            toast.success('Role deleted successfully');
            fetchRecruitmentRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error('Failed to delete role');
        }
    };

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await toBase64(file);
            setFormData(prev => ({ ...prev, image: base64 }));
        }
    };

    const handleEditFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await toBase64(file);
            setEditRole(prev => ({ ...prev, image: base64 }));
        }
    };

    return (
        <div className="w-full p-4 bg-pclub-bg-dark rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recruitment Management</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <MdAdd size={20} />
                    {showAddForm ? 'Cancel' : 'Add New Role'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 bg-pclub-bg-light rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">Add New Role</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Role Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Google Form URL</label>
                            <input
                                type="url"
                                name="google_form"
                                value={formData.google_form}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white"
                                required
                            />
                            {formData.image && (
                                <img src={formData.image} alt="preview" className="mt-2 h-24 object-contain rounded" />
                            )}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isRecruitmentOpen"
                                name="isRecruitmentOpen"
                                checked={formData.isRecruitmentOpen}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isRecruitmentOpen: e.target.checked
                                }))}
                                className="h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor="isRecruitmentOpen" className="ml-2 text-gray-300">
                                Recruitment Open
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-lg font-medium text-white mb-2">Team Leader</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.leader.name}
                                        onChange={handleLeaderChange}
                                        className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.leader.linkedin}
                                        onChange={handleLeaderChange}
                                        className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-lg font-medium text-white mb-2">Team Members</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                            {formData.members?.map((member, index) => (
                                <div key={index} className="flex items-center justify-between bg-pclub-bg rounded p-2">
                                    <span className="text-white">{member.name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveTeamMember(index)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <MdDelete size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                            <input 
                                type="text" 
                                placeholder="Name" 
                                value={newTeamMember.name}
                                onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                                className="p-2 rounded bg-pclub-bg border border-gray-600 text-white md:col-span-2" 
                            />
                            <input 
                                type="url" 
                                placeholder="LinkedIn" 
                                value={newTeamMember.linkedin}
                                onChange={(e) => setNewTeamMember(prev => ({ ...prev, linkedin: e.target.value }))}
                                className="p-2 rounded bg-pclub-bg border border-gray-600 text-white md:col-span-2"
                            />
                            <button 
                                type="button"
                                onClick={handleAddTeamMember}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Add Member
                            </button>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Add Role
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No recruitment roles found. Add your first role to get started.
                    </div>
                ) : (
                    <table className="min-w-full bg-pclub-bg-light rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-pclub-bg text-left text-gray-300">
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Leader</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {roles.map((role) => (
                                <tr key={role._id} className="hover:bg-pclub-bg">
                                    <td className="p-4 text-white">{role.title}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleRecruitmentStatus(role._id, role.isRecruitmentOpen)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${role.isRecruitmentOpen
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {role.isRecruitmentOpen ? 'Open' : 'Closed'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {role.leader?.name || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <button onClick={() => openEditModal(role)} className="text-blue-400 hover:text-blue-300">
                                                <MdEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => deleteRole(role._id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showEditModal && editRole && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-pclub-bg-light/80 backdrop-blur-lg border border-gray-700/50 shadow-2xl shadow-black/30 w-full max-w-2xl rounded-xl p-6 relative">
                        <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <MdClose size={24} />
                        </button>
                        <h3 className="text-xl font-semibold text-white mb-4">Edit Role</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2">Role Title</label>
                                <input type="text" name="title" value={editRole.title} onChange={handleEditChange} className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Google Form URL</label>
                                <input type="url" name="google_form" value={editRole.google_form} onChange={handleEditChange} className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Upload Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleEditFileChange} 
                                    className="w-full p-2 rounded bg-pclub-bg border border-gray-600 text-white" 
                                />
                                {editRole.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-400 mb-1">Current Image:</p>
                                        <img 
                                            src={editRole.image} 
                                            alt="Role preview" 
                                            className="h-24 object-contain rounded border border-gray-700" 
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" checked={editRole.isRecruitmentOpen} onChange={(e) => setEditRole(prev => ({ ...prev, isRecruitmentOpen: e.target.checked }))} className="h-5 w-5 text-blue-600 rounded" />
                                <span className="ml-2 text-gray-300">Recruitment Open</span>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-lg font-medium text-white mb-2">Leader</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Name" name="name" value={editRole.leader?.name || ""} onChange={handleEditLeaderChange} className="p-2 rounded bg-pclub-bg border border-gray-600 text-white" />
                                    <input type="url" placeholder="LinkedIn" name="linkedin" value={editRole.leader?.linkedin || ""} onChange={handleEditLeaderChange} className="p-2 rounded bg-pclub-bg border border-gray-600 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-lg font-medium text-white mb-2">Members</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {editRole.members?.map(m => (
                                    <div key={m._id} className="flex items-center justify-between bg-pclub-bg rounded p-2">
                                        <span className="text-white">{m.name}</span>
                                        <button onClick={() => removeMember(m._id)} className="text-red-400 hover:text-red-300"><MdDelete size={18} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4 items-center">
                                <input type="text" placeholder="Name" value={newMember.name} onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))} className="p-2 rounded bg-pclub-bg border border-gray-600 text-white md:col-span-2" />
                                <input type="url" placeholder="LinkedIn" value={newMember.linkedin} onChange={(e) => setNewMember(prev => ({ ...prev, linkedin: e.target.value }))} className="p-2 rounded bg-pclub-bg border border-gray-600 text-white md:col-span-2" />
                                <button onClick={addMember} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add</button>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={saveRoleChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">Save</button>
                            <button onClick={closeEditModal} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitmentSection;
