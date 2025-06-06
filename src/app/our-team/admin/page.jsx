"use client";
import React, { useEffect, useState } from "react";

const obsPositions = ["Secretary", "Treasurer", "Joint Secretary"];
const leadPositions = [
  "Dev Lead",
  "CP Lead",
  "Graphic Lead",
  "Social Media Head",
  "Content Lead",
  "Communication Lead",
];

export default function page() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    position: "",
    term: "",
    linkedinId: "",
    pfpImage: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members/get");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMembers(data);
      } else if (Array.isArray(data.members)) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
    } catch (err) {
      alert("Failed to fetch members");
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, pfpImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.position) {
        alert("Please select a position");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/members/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add member");
      setForm({
        name: "",
        position: "",
        term: "",
        linkedinId: "",
        pfpImage: "",
      });
      await fetchMembers();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch("/api/members/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete member");
      await fetchMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
      <div
        style={{
          padding: "2rem",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          color: "white", // optional: makes text visible on dark backgrounds
        }}
      >
      <h2>Admin Panel - Manage Members</h2>

      <form onSubmit={handleAddMember} style={{ marginBottom: "2rem", background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", color:"white" }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />

        <select
          name="position"
          value={form.position}
          onChange={handleChange}
          required
          style={{ marginRight: 8,color :"black" }}
        >
          <option value="">Select Position</option>

          <optgroup label="OBS Positions">
            {obsPositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </optgroup>

          <optgroup label="Lead Positions">
            {leadPositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </optgroup>

          <optgroup label="Regular Positions">
            <option value="Member">Member</option>
            <option value="Volunteer">Volunteer</option>
          </optgroup>
        </select>

        <input
          name="term"
          placeholder="Term"
          value={form.term}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />

        <input
          name="linkedinId"
          placeholder="LinkedIn ID"
          value={form.linkedinId}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ marginRight: 8 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Member"}
        </button>
      </form>

      <h3>Members List</h3>
      <ul>
        {members.map((m) => (
          <li key={m._id} style={{ marginBottom: "0.5rem" }}>
            <strong>{m.name}</strong> - {m.position} ({m.term}){" "}
            {m.pfpImage && (
              <img
                src={m.pfpImage}
                alt={m.name}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  marginLeft: 8,
                }}
              />
            )}
            <button
              onClick={() => handleDelete(m._id)}
              style={{ color: "red", marginLeft: 12 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
