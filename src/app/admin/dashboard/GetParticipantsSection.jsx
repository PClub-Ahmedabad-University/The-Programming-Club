"use client";

import React, { useEffect, useState } from "react";

export default function GetParticipantsSection() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");

  // Fetch all events on mount
  useEffect(() => {
    fetch("/api/events/get")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.data || []);
      });   
  }, []);

  const handleGetParticipants = async () => {
    setLoading(true);
    setError("");
    setParticipants([]);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/event-registration/export?eventId=${selectedEventId}`, {
        headers: { authorization: "Bearer " + token }
      });
      if (!res.ok) {
        setError("Failed to fetch participants.");
        setLoading(false);
        return;
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setParticipants(data.users || []);
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `participants_${selectedEventId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError("Error fetching participants.");
    }
    setLoading(false);
  };

  return (
    <section style={{ padding: "2rem", color: "white" }}>
      <h2>Get Event Participants</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="event-select" style={{ marginRight: 8 }}>
          Select Event:
        </label>
        <select
          id="event-select"
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
          style={{ padding: "0.3rem 1rem", borderRadius: 4 }}
        >
          <option value="">-- Select an event --</option>
          {events.map(ev => (
            <option value={ev._id} key={ev._id}>
              {ev.title || ev.eventName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleGetParticipants}
          disabled={!selectedEventId || loading}
          style={{
            marginLeft: 12,
            background: "#36d1c4",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "0.4rem 1.2rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {loading ? "Loading..." : "Get Participants"}
        </button>
      </div>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {/* If your API returns JSON, show participants in a table */}
      {participants.length > 0 && (
        <table style={{ width: "100%", background: "#222", borderRadius: 8 }}>
          <thead>
            <tr>
              <th style={{ color: "#36d1c4" }}>Name</th>
              <th style={{ color: "#36d1c4" }}>Email</th>
              <th style={{ color: "#36d1c4" }}>Roll No</th>
              <th style={{ color: "#36d1c4" }}>User ID</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.enrollmentNumber || p.rollNo}</td>
                <td>{p._id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}