"use client";
import { useState } from "react";

export default function QrCodeForm() {
  const [rollNumber, setRollNumber] = useState("");
  const [treasure, setTreasure] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setQrCode(null);

    if (!rollNumber.trim() || !treasure.trim()) {
      setError("Please enter both roll number and treasure");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wmcgame/innit", { // <-- change to your API route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentNumber: rollNumber,
          treasure,
          role: "owner", // example static
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setQrCode(data.user.qrCode);
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 400, margin: "auto" }}>
      <h2>Generate QR Code</h2>
      <input
        type="text"
        placeholder="Enter Roll Number"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          border: "1px solid #ccc",
          backgroundColor: "white"
        }}
      />
      <input
        type="text"
        placeholder="Enter Treasure"
        value={treasure}
        onChange={(e) => setTreasure(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          border: "1px solid #ccc",
        backgroundColor: "white"
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "0.5rem",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate QR Code"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      {qrCode && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <img src={qrCode} alt="QR Code" style={{ width: "200px" }} />
        </div>
      )}
    </div>
  );
}
