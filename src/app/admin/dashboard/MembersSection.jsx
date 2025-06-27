"use client";
import React from "react";
import EditMemberModal from "./EditMemberModal";

export default function MembersSection() {
    const obsPositions = ["Secretary", "Treasurer", "Joint Secretary"];
    const leadPositions = [
        "Dev Lead",
        "CP Lead",
        "Graphic Lead",
        "Social Media Head",
        "Content Lead",
        "Communication Lead",
    ];
    const OtherMembers = ["Dev Team member", "CP Team member", "Graphic Team member", "Social Media Team member", "Content Team member", "Communication Team member", "Volunteer", "Previous Year Team"];

    const [members, setMembers] = React.useState([]);
    const [form, setForm] = React.useState({
        name: "",
        email: "",
        position: "",
        term: "",
        linkedinId: "",
        pfpImage: "",
    });
    const [loading, setLoading] = React.useState(false);
    const [fetchLoading, setFetchLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [editingMember, setEditingMember] = React.useState(null);
    const [showEditModal, setShowEditModal] = React.useState(false);

    const fetchMembers = async () => {
        try {
            setFetchLoading(true);
            const res = await fetch("/api/members/get",
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await res.json();
            if (Array.isArray(data)) setMembers(data);
            else if (Array.isArray(data.members)) setMembers(data.members);
            else if (Array.isArray(data.data)) setMembers(data.data);
            else setMembers([]);
            setError("");
        } catch (err) {
            setError("Failed to fetch members");
            setMembers([]);
        } finally {
            setFetchLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMembers();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({ ...prev, pfpImage: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddMember = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (!form.position) {
                setError("Please select a position");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/members/add",
                {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );

            if (!res.ok) throw new Error("Failed to add member");

            setForm({
                name: "",
                email: "",
                position: "",
                term: "",
                linkedinId: "",
                pfpImage: "",
            });

            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            setSuccess("Member added successfully!");
            await fetchMembers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this member?")) return;

        try {
            const res = await fetch("/api/members/delete",
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                }
            );

            if (!res.ok) throw new Error("Failed to delete member");

            setSuccess("Member deleted successfully!");
            await fetchMembers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (memberId) => {
        const member = members.find(m => m._id === memberId);
        if (member) {
            setEditingMember(member);
            setShowEditModal(true);
        }
    };

    const handleEditComplete = () => {
        setShowEditModal(false);
        setEditingMember(null);
        fetchMembers();
    };

    return (
        <div className="min-h-screen p-6 font-sans" style={{ backgroundColor: '#0C1224', color: '#E2E8F0' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Member Management</h1>
                    <p className="text-slate-400">Manage your team members and their roles</p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                {/* Add Member Form */}
                <div className="mb-8 p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Member
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    name="name"
                                    placeholder="Enter full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Term *
                                </label>
                                <select
                                    name="term"
                                    value={form.term}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Select Term</option>
                                    <option value="2024-25" className="bg-slate-700">2024-2025</option>
                                    <option value="2025-26" className="bg-slate-700">2025-2026</option>
                                    <option value="2026-27" className="bg-slate-700">2026-2027</option>
                                    <option value="2027-28" className="bg-slate-700">2027-2028</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Position *
                                </label>
                                <select
                                    name="position"
                                    value={form.position}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Select Position</option>
                                    <optgroup label="OBS Positions">
                                        {obsPositions.map((pos) => (
                                            <option key={pos} value={pos} className="bg-slate-700">
                                                {pos}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Lead Positions">
                                        {leadPositions.map((pos) => (
                                            <option key={pos} value={pos} className="bg-slate-700">
                                                {pos}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Team Members">
                                        {OtherMembers.map((pos) => (
                                            <option key={pos} value={pos} className="bg-slate-700">
                                                {pos}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Term *
                                </label>
                                <input
                                    name="term"
                                    placeholder="e.g., 2024-2025"
                                    value={form.term}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    LinkedIn ID
                                </label>
                                <input
                                    name="linkedinId"
                                    placeholder="linkedin-username"
                                    value={form.linkedinId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Profile Picture
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <p className="text-xs text-slate-400 mt-1">Max file size: 5MB</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleAddMember}
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Add Member</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Team Members
                        </h2>
                        <div className="text-sm text-slate-400">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </div>
                    </div>

                    {fetchLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-3">
                                <svg className="animate-spin w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-slate-400">Loading members...</span>
                            </div>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-slate-300 mb-2">No members found</h3>
                            <p className="text-slate-500">Add your first team member to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {members.map((m) => (
                                <div
                                    key={m._id}
                                    className="p-6 rounded-xl border border-slate-700/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 group hover:shadow-lg hover:shadow-blue-500/10"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/30 group-hover:border-blue-500/60 transition-colors duration-200">
                                                {m.pfpImage ? (
                                                    <img
                                                        src={m.pfpImage.replace(".heic", ".jpg")}
                                                        alt={m.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                                        <span className="text-2xl font-semibold text-slate-300">
                                                            {m.name?.[0] || "?"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {m.name}
                                            </h3>
                                            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
                                                {m.position}
                                            </div>
                                            <p className="text-sm text-slate-400">{m.term}</p>
                                        </div>

                                        <div className="flex items-center space-x-2 w-full">
                                            {m.linkedinId && (
                                                <a
                                                    href={m.linkedinId.startsWith("https://") ? m.linkedinId : `https://${m.linkedinId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                                                >
                                                    LinkedIn
                                                </a>
                                            )}

                                            <button
                                                onClick={() => handleEdit(m._id)}
                                                className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                                title="Edit member"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m._id)}
                                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                                title="Delete member"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Member Modal */}
                <EditMemberModal
                    isOpen={showEditModal}
                    member={editingMember}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleEditComplete}
                    positions={{ obsPositions, leadPositions, OtherMembers }}
                />
            </div>
        </div>
    );
}