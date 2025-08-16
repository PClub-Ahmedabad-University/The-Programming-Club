"use client";
import { useState } from "react";

export default function QrCodeForm() {
  const [rollNumber, setRollNumber] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setQrCode(null);

    try {
      const res = await fetch("/api/wmcgame/owner/getqrcl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentNumber: rollNumber,
          treasure: "dummy", // static value for now
          role: "owner",
        }),
      });

      const data = await res.json();
      if (res.ok && data.user?.qrCode) {
        setQrCode(data.user.qrCode);
      }
    } catch (err) {
      console.error("Failed to fetch QR code:", err);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      {!qrCode && (
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "1rem",
            fontSize: "1.5rem",
            width: "300px",
            textAlign: "center",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
          }}
          autoFocus
        />
      )}

      {loading && <p style={{ fontSize: "1.2rem" }}>Generating QR Code...</p>}

      {qrCode && (
        <img
          src={qrCode}
          alt="QR Code"
          style={{
            width: "400px",
            height: "400px",
            border: "10px solid white",
            borderRadius: "16px",
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          }}
        />
      )}
    </div>
  );
}
