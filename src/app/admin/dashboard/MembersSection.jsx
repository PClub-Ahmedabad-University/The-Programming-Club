"use client";
import React from "react";
import EditMemberModal from "./EditMemberModal";
import { useUser } from "@/lib/UserContext";

export default function MembersSection() {
    const { token } = useUser();

    const obsPositions = ["Secretary", "Treasurer", "Joint Secretary"];
    const leadPositions = [
        "Dev Lead",
        "CP Lead",
        "Graphic Lead",
        "Social Media Head",
        "Content & Communications Lead",
    ];
    const OtherMembers = [
        "Dev Team member",
        "CP Team member",
        "Graphic Team member",
        "Social Media Team member",
        "Content & Communications Team member",
        "Volunteer",
        "Previous Year Team"
    ];

    const [members, setMembers] = React.useState([]);
    const [form, setForm] = React.useState({
        name: "",
        email: "",
        position: "",
        term: "",
        linkedinUrl: "",
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

            const res = await fetch("/api/members/get", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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
        if (token) fetchMembers();
    }, [token]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

            const res = await fetch("/api/members/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to add member");

            setForm({
                name: "",
                email: "",
                position: "",
                term: "",
                linkedinId: "",
                pfpImage: "",
            });

            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = "";

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
            const res = await fetch("/api/members/delete", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Failed to delete member");

            setSuccess("Member deleted successfully!");
            await fetchMembers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (memberId) => {
        const member = members.find((m) => m._id === memberId);
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
        <div className="min-h-screen p-6 font-sans" style={{ backgroundColor: "#0C1224", color: "#E2E8F0" }}>
            <div className="max-w-7xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Member Management</h1>
                    <p className="text-slate-400">Manage your team members and their roles</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400">
                        {success}
                    </div>
                )}

                {/* Rest of JSX unchanged */}
            </div>

            <EditMemberModal
                isOpen={showEditModal}
                member={editingMember}
                onClose={() => setShowEditModal(false)}
                onUpdate={handleEditComplete}
                positions={{ obsPositions, leadPositions, OtherMembers }}
            />
        </div>
    );
}