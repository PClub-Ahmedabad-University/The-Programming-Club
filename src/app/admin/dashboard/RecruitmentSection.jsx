"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    MdDelete, 
    MdEdit, 
    MdAdd, 
    MdClose, 
    MdCloudUpload, 
    MdImage, 
    MdVisibility,
    MdBusiness,
    MdLink,
    MdDescription,
    MdCheck,
    MdCancel
} from "react-icons/md";
import { toast } from "react-hot-toast";
import LoaderAdmin from "@/ui-components/LoaderAdmin";

const RecruitmentSection = () => {
    const [roles, setRoles] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [editDragActive, setEditDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: "",
        image: "",
        google_form: "",
        isRecruitmentOpen: false,
        description: ""
    });

    const fetchRecruitmentRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/recruitment/get',
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // console.log('Form data before submission:', formData);
            
            // Validate form data
            if (!formData.title || !formData.google_form || !formData.description) {
                throw new Error('Please fill in all required fields');
            }
            const response = await fetch('/api/recruitment/add',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        image: formData.image,
                    google_form: formData.google_form,
                    isRecruitmentOpen: formData.isRecruitmentOpen,
                    description: formData.description
                })
            });
            
            const responseData = await response.json();
            // console.log('API Response:', responseData);
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to add role');
            }
            
            toast.success('Role added successfully');
            setShowAddForm(false);
            setFormData({
                title: "",
                image: "",
                google_form: "",
                isRecruitmentOpen: false,
                description: ""
            });
            fetchRecruitmentRoles();
        } catch (error) {
            console.error('Error adding role:', error);
            toast.error(error.message || 'Failed to add role');
        }finally{
            setLoading(false);
        }

    };

    const toggleRecruitmentStatus = async (id, currentStatus) => {
        try {
            // console.log('Toggling status for:', id);
            const newStatus = !currentStatus;
            setLoading(true);
            
            // Optimistic UI update
            setRoles(prev => prev.map(role => 
                role._id === id ? { ...role, isRecruitmentOpen: newStatus } : role
            ));
            
            // API call to update status
            const response = await fetch(`/api/recruitment/update/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isRecruitmentOpen: newStatus })
                });
            
            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert on error
            setRoles(prev => prev.map(role => 
                role._id === id ? { ...role, isRecruitmentOpen: currentStatus } : role
            ));
            toast.error('Failed to update status');
        }finally{
            setLoading(false);
        }
    };

    const openEditModal = (role) => {
        // Ensure all required fields are present in the edit form
        setEditRole({
            _id: role._id,
            title: role.title || '',
            description: role.description || '',
            google_form: role.google_form || '',
            image: role.image || '',
            isRecruitmentOpen: role.isRecruitmentOpen || false
        });
        setShowEditModal(true);
        // console.log('Edit role initialized:', {
        //     _id: role._id,
        //     title: role.title,
        //     description: role.description,
        //     google_form: role.google_form,
        //     image: role.image,
        //     isRecruitmentOpen: role.isRecruitmentOpen
        // });
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditRole(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditRole(prev => ({ ...prev, [name]: value }));
    };

    const saveRoleChanges = async () => {
        if (!editRole) return;
        try {
            setLoading(true);
            // console.log('Updating role with data:', editRole);
            
            // Create a clean update object with only the fields we want to update
            const updateData = {};
            const fields = ['title', 'description', 'google_form', 'isRecruitmentOpen'];
            
            // Add standard fields
            fields.forEach(field => {
                if (editRole[field] !== undefined) {
                    updateData[field] = editRole[field];
                }
            });
            
            // Handle image separately
            if (editRole.image) {
                updateData.image = editRole.image;
            }
            
            // console.log('Sending update data:', updateData);
            
            // Optimistic UI update
            setRoles(prev => prev.map(role => 
                role._id === editRole._id ? { ...role, ...updateData } : role
            ));
            
            // API call to update role
            const response = await fetch(`/api/recruitment/update/${editRole._id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updateData)
                });
            
            const responseData = await response.json();
            console.log('Update response:', responseData);
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update role');
            }
            
            // Ensure the updated data is reflected in the UI
            fetchRecruitmentRoles();
            toast.success('Role updated successfully');
            closeEditModal();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error(error.message || 'Failed to update role');
            // Refresh roles to get the latest data
            fetchRecruitmentRoles();
        }finally{
            setLoading(false);
        }
    };

    const deleteRole = async (id) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            setLoading(true);
            // console.log('Deleting role:', id);
            
            setRoles(prev => prev.filter(role => role._id !== id));
            
            const response = await fetch(`/api/recruitment/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete role');
            }
            
            toast.success('Role deleted successfully');
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error('Failed to delete role');
            fetchRecruitmentRoles();
        }finally{
            setLoading(false);
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

    const handleFiles = async (files, isEdit = false) => {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            const base64 = await toBase64(file);
            if (isEdit) {
                setEditRole(prev => ({ ...prev, image: base64 }));
            } else {
                setFormData(prev => ({ ...prev, image: base64 }));
            }
        }
    };

    const handleFileChange = async (e) => {
        await handleFiles(e.target.files);
    };

    const handleEditFileChange = async (e) => {
        await handleFiles(e.target.files, true);
    };

    const handleDrag = (e, isEdit = false) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            if (isEdit) {
                setEditDragActive(true);
            } else {
                setDragActive(true);
            }
        } else if (e.type === "dragleave") {
            if (isEdit) {
                setEditDragActive(false);
            } else {
                setDragActive(false);
            }
        }
    };

    const handleDrop = async (e, isEdit = false) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEdit) {
            setEditDragActive(false);
        } else {
            setDragActive(false);
        }
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFiles(e.dataTransfer.files, isEdit);
        }
    };

    const FileUploadZone = ({ image, dragActive, onDrag, onDrop, onClick, isEdit = false }) => (
        <div
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer group ${
                dragActive 
                    ? 'border-blue-400 bg-blue-50/5 scale-105' 
                    : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={(e) => onDrag(e, isEdit)}
            onDragLeave={(e) => onDrag(e, isEdit)}
            onDragOver={(e) => onDrag(e, isEdit)}
            onDrop={(e) => onDrop(e, isEdit)}
            onClick={onClick}
        >
            {image ? (
                <div className="relative p-4">
                    <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Click to change</span>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <MdCloudUpload className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-300 font-medium mb-2">
                        {dragActive ? 'Drop your image here' : 'Upload role image'}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Drag & drop or click to browse
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                        PNG, JPG, GIF up to 10MB
                    </p>
                </div>
            )}
        </div>
    );
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <LoaderAdmin />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Recruitment Management</h1>
                        <p className="text-gray-400">Manage role openings</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <MdAdd size={20} />
                        {showAddForm ? 'Cancel' : 'Add New Role'}
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="mb-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <MdAdd className="w-5 h-5 text-white" />
                            </div>
                            Add New Role
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                            <MdBusiness className="w-4 h-4" />
                                            Role Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="e.g., Competitive Programming Team"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                            <MdLink className="w-4 h-4" />
                                            Form URL
                                        </label>
                                        <input
                                            type="url"
                                            name="google_form"
                                            value={formData.google_form}
                                            onChange={handleInputChange}
                                            className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="e.g., https://forms.abcd.com/.."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                            <MdDescription className="w-4 h-4" />
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                                            placeholder="Add a description..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                            <MdImage className="w-4 h-4" />
                                            Role Image
                                        </label>
                                        <FileUploadZone
                                            image={formData.image}
                                            dragActive={dragActive}
                                            onDrag={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        />
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex items-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                                        <input
                                            type="checkbox"
                                            id="isRecruitmentOpen"
                                            name="isRecruitmentOpen"
                                            checked={formData.isRecruitmentOpen}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                isRecruitmentOpen: e.target.checked
                                            }))}
                                            className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor="isRecruitmentOpen" className="ml-3 text-gray-300 font-medium">
                                            Open for recruitment
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Add Role
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Roles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-900/50 rounded-2xl p-6 animate-pulse">
                                <div className="h-32 bg-gray-800 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-800 rounded mb-3"></div>
                                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                            </div>
                        ))
                    ) : roles.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdBusiness className="w-12 h-12 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No roles yet</h3>
                            <p className="text-gray-500">Add your first recruitment role to get started</p>
                        </div>
                    ) : (
                        roles.map((role) => (
                            <div key={role._id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={role.image} 
                                        alt={role.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            role.isRecruitmentOpen
                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}>
                                            {role.isRecruitmentOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                        {role.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {role.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => toggleRecruitmentStatus(role._id, role.isRecruitmentOpen)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                                role.isRecruitmentOpen
                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                                            }`}
                                        >
                                            {role.isRecruitmentOpen ? <MdCancel size={16} /> : <MdCheck size={16} />}
                                            {role.isRecruitmentOpen ? 'Close' : 'Open'}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(role)}
                                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300 border border-blue-500/30"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteRole(role._id)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/30"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Edit Modal */}
                {showEditModal && editRole && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-2xl w-full max-w-4xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 p-6 flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <MdEdit className="w-5 h-5 text-white" />
                                    </div>
                                    Edit Role
                                </h3>
                                <button 
                                    onClick={closeEditModal} 
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                                <MdBusiness className="w-4 h-4" />
                                                Role Title
                                            </label>
                                            <input 
                                                type="text" 
                                                name="title" 
                                                value={editRole.title} 
                                                onChange={handleEditChange} 
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" 
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                                <MdLink className="w-4 h-4" />
                                                Google Form URL
                                            </label>
                                            <input 
                                                type="url" 
                                                name="google_form" 
                                                value={editRole.google_form} 
                                                onChange={handleEditChange} 
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" 
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                                <MdDescription className="w-4 h-4" />
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={editRole.description}
                                                onChange={handleEditChange}
                                                rows={4}
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                                                <MdImage className="w-4 h-4" />
                                                Role Image
                                            </label>
                                            <FileUploadZone
                                                image={editRole.image}
                                                dragActive={editDragActive}
                                                onDrag={handleDrag}
                                                onDrop={handleDrop}
                                                onClick={() => editFileInputRef.current?.click()}
                                                isEdit={true}
                                            />
                                            <input
                                                ref={editFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEditFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                        <div className="flex items-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                                            <input 
                                                type="checkbox" 
                                                checked={editRole.isRecruitmentOpen} 
                                                onChange={(e) => setEditRole(prev => ({ ...prev, isRecruitmentOpen: e.target.checked }))} 
                                                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2" 
                                            />
                                            <span className="ml-3 text-gray-300 font-medium">Open for recruitment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-800 mt-6">
                                    <button 
                                        onClick={closeEditModal}
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={saveRoleChanges}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitmentSection;