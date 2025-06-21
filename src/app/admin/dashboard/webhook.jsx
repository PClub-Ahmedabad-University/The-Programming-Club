import { useState, useEffect } from "react";

export default function Webhook() {
  const [sheetUrl, setSheetUrl] = useState("");
const [webhookUrl, setWebhookUrl] = useState("https://the-programming-club.vercel.app/api/hook");  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [triggers, setTriggers] = useState([]);
  useEffect(() => {
    fetch("/api/triggers")
      .then((res) => res.json())
      .then((data) => setTriggers(data.triggers || []));
  }, []);
    const handleInstallTrigger = async () => {
    if (!sheetUrl || !webhookUrl) {
        alert("Please fill in both fields.");
        return;
    }

    setLoading(true);
    setStatus("Sending request...");

    try {
        const res = await fetch("/api/triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrl, webhookUrl }),
        });

        const data = await res.json();
        if (res.ok) {
        setStatus(`✅ Success: ${data.message}`);
        } else {
        setStatus(`❌ Error: ${data.error || "Unknown error"}`);
        }
    } catch (err) {
        console.error(err);
        setStatus("❌ Failed to install trigger. See console for details.");
    }

    setLoading(false);
    };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "700px", margin: "auto" }}>
      <h1>🛠️ Google Form Trigger Setup</h1>

      <label>🔗 Google Sheet URL</label>
      <input
        type="text"
        value={sheetUrl}
        onChange={(e) => setSheetUrl(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        placeholder="https://docs.google.com/spreadsheets/..."
      />

      <label>🌐 Webhook URL</label>
      <input
        type="text"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        placeholder="https://the-programming-club.vercel.app/api/hook"
      />

      <button
        onClick={handleInstallTrigger}
        style={{
          background: "#000",
          color: "#fff",
          padding: "0.7rem 1.2rem",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Installing..." : "🚀 Install Trigger"}
      </button>

      {status && (
        <pre style={{ background: "blue", padding: "1rem", marginTop: "1.5rem" }}>{status}</pre>
      )}
          <h2 style={{ marginTop: "2rem" }}>Previous Triggers</h2>
      <table style={{ width: "100%", background:'black', borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr style={{ background: "green" }}>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Sheet URL</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Webhook URL</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {triggers.map((t) => (
            <tr key={t._id}>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc", wordBreak: "break-all" }}>
                <a href={t.sheetUrl} target="_blank" rel="noopener noreferrer">{t.sheetUrl}</a>
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc", wordBreak: "break-all" }}>
                <a href={t.webhookUrl} target="_blank" rel="noopener noreferrer">{t.webhookUrl}</a>
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
              </td>
            </tr>
          ))}
          {triggers.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>
                No triggers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}