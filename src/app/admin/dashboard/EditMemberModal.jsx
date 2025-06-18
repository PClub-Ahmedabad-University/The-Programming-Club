"use client";
import React from "react";

export default function EditMemberModal({ member, isOpen, onClose, onUpdate, positions }) {
    const [form, setForm] = React.useState({
        name: member?.name || "",
        position: member?.position || "",
        term: member?.term || "",
        linkedinId: member?.linkedinId || "",
        pfpImage: member?.pfpImage || "",
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    React.useEffect(() => {
        if (member) {
            setForm({
                name: member.name || "",
                position: member.position || "",
                term: member.term || "",
                linkedinId: member.linkedinId || "",
                pfpImage: member.pfpImage || "",
            });
        }
    }, [member]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("File size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm(prev => ({ ...prev, pfpImage: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateMember = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (!form.position) {
                setError("Please select a position");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/members/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: member._id, ...form }),
            });

            if (!res.ok) throw new Error("Failed to update member");

            setSuccess("Member updated successfully!");
            if (onUpdate) onUpdate();
            onClose();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Edit Member</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400">
                        {success}
                    </div>
                )}

                <div className="space-y-4">
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
                                {positions?.obsPositions?.map((pos) => (
                                    <option key={pos} value={pos} className="bg-slate-700">
                                        {pos}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Lead Positions">
                                {positions?.leadPositions?.map((pos) => (
                                    <option key={pos} value={pos} className="bg-slate-700">
                                        {pos}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Team Members">
                                {positions?.OtherMembers?.map((pos) => (
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

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateMember}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Updating...</span>
                            </>
                        ) : (
                            <span>Update Member</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}