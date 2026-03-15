"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    MdDelete, 
    MdEdit, 
    MdAdd, 
    MdClose, 
    MdCloudUpload, 
    MdImage, 
    MdBusiness,
    MdLink,
    MdDescription,
    MdCheck,
    MdCancel
} from "react-icons/md";
import { toast } from "react-hot-toast";
import LoaderAdmin from "@/ui-components/LoaderAdmin";
import { useUser } from "@/lib/UserContext";

const RecruitmentSection = () => {

    const { token } = useUser();

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

            const response = await fetch("/api/recruitment/get", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch roles");

            const data = await response.json();

            setRoles(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            toast.error("Failed to load recruitment roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchRecruitmentRoles();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await fetch("/api/recruitment/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to add role");

            toast.success("Role added successfully");

            setShowAddForm(false);

            setFormData({
                title: "",
                image: "",
                google_form: "",
                isRecruitmentOpen: false,
                description: ""
            });

            fetchRecruitmentRoles();
        } catch {
            toast.error("Failed to add role");
        } finally {
            setLoading(false);
        }
    };

    const toggleRecruitmentStatus = async (id, currentStatus) => {

        const newStatus = !currentStatus;

        try {

            setRoles(prev =>
                prev.map(role =>
                    role._id === id ? { ...role, isRecruitmentOpen: newStatus } : role
                )
            );

            const response = await fetch(`/api/recruitment/update/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isRecruitmentOpen: newStatus }),
            });

            if (!response.ok) throw new Error();

            toast.success("Status updated");

        } catch {

            setRoles(prev =>
                prev.map(role =>
                    role._id === id ? { ...role, isRecruitmentOpen: currentStatus } : role
                )
            );

            toast.error("Failed to update status");
        }
    };

    const deleteRole = async (id) => {

        if (!confirm("Delete this role?")) return;

        try {

            setRoles(prev => prev.filter(role => role._id !== id));

            const res = await fetch(`/api/recruitment/delete/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error();

            toast.success("Role deleted");

        } catch {

            toast.error("Failed to delete role");

            fetchRecruitmentRoles();
        }
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

    const handleFiles = async (files, isEdit = false) => {

        const file = files[0];

        if (file && file.type.startsWith("image/")) {

            const base64 = await toBase64(file);

            if (isEdit) {
                setEditRole(prev => ({ ...prev, image: base64 }));
            } else {
                setFormData(prev => ({ ...prev, image: base64 }));
            }
        }
    };

    const handleDrag = (e, isEdit = false) => {

        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            isEdit ? setEditDragActive(true) : setDragActive(true);
        } else if (e.type === "dragleave") {
            isEdit ? setEditDragActive(false) : setDragActive(false);
        }
    };

    const handleDrop = async (e, isEdit = false) => {

        e.preventDefault();
        e.stopPropagation();

        isEdit ? setEditDragActive(false) : setDragActive(false);

        if (e.dataTransfer.files?.[0]) {
            await handleFiles(e.dataTransfer.files, isEdit);
        }
    };

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

                <div className="flex justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Recruitment Management
                        </h1>
                        <p className="text-gray-400">Manage role openings</p>
                    </div>

                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                    >
                        <MdAdd size={20} />
                        {showAddForm ? "Cancel" : "Add Role"}
                    </button>

                </div>

                {showAddForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 space-y-4"
                    >

                        <input
                            type="text"
                            placeholder="Role Title"
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-3 bg-gray-800 text-white rounded"
                            required
                        />

                        <input
                            type="url"
                            placeholder="Google Form Link"
                            value={formData.google_form}
                            onChange={e => setFormData(prev => ({ ...prev, google_form: e.target.value }))}
                            className="w-full p-3 bg-gray-800 text-white rounded"
                            required
                        />

                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 bg-gray-800 text-white rounded"
                            required
                        />

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={e => handleFiles(e.target.files)}
                            className="text-white"
                        />

                        <label className="flex items-center gap-2 text-white">
                            <input
                                type="checkbox"
                                checked={formData.isRecruitmentOpen}
                                onChange={e =>
                                    setFormData(prev => ({
                                        ...prev,
                                        isRecruitmentOpen: e.target.checked
                                    }))
                                }
                            />
                            Open for recruitment
                        </label>

                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white"
                        >
                            Add Role
                        </button>

                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {roles.map(role => (

                        <div key={role._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

                            <img
                                src={role.image}
                                alt={role.title}
                                className="w-full h-40 object-cover"
                            />

                            <div className="p-4">

                                <h3 className="text-white font-semibold mb-2">
                                    {role.title}
                                </h3>

                                <p className="text-gray-400 text-sm mb-4">
                                    {role.description}
                                </p>

                                <div className="flex justify-between">

                                    <button
                                        onClick={() =>
                                            toggleRecruitmentStatus(role._id, role.isRecruitmentOpen)
                                        }
                                        className={`px-3 py-1 rounded text-sm ${
                                            role.isRecruitmentOpen
                                                ? "bg-red-600"
                                                : "bg-green-600"
                                        }`}
                                    >
                                        {role.isRecruitmentOpen ? "Close" : "Open"}
                                    </button>

                                    <button
                                        onClick={() => deleteRole(role._id)}
                                        className="bg-red-700 px-3 py-1 rounded"
                                    >
                                        <MdDelete />
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default RecruitmentSection;