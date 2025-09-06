"use client";

import { useState, useEffect } from "react";
import NotAllowed from "@/app/Components/NotAllowed";
import { getUserRoleFromToken } from "@/lib/auth";
import Loader from "@/ui-components/Loader1";

function CPProblemsSection() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [problemLink, setProblemLink] = useState("");
    const [posting, setPosting] = useState(false);
    const [solutionDialog, setSolutionDialog] = useState({ open: false, problemId: null, solutionLink: "" });
    const [savingSolution, setSavingSolution] = useState(false);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);

    // ✅ Only run in browser
    useEffect(() => {
        const t = localStorage.getItem("token");
        if (t) {
            setToken(t);
            setRole(getUserRoleFromToken(t));
        }
    }, []);

    // Fetch CP problems
    useEffect(() => {
        if (!token) return;

        const fetchProblems = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/cp/post-problem", {
                    method: "GET",
                    headers: { authorization: "Bearer " + token },
                });
                if (!res.ok) throw new Error("Failed to fetch problems");
                const data = await res.json();
                setProblems(data.problems || []);
            } catch (err) {
                alert(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, [token, role]);

    const handleDelete = async (id) => {
        if (!confirm("Delete this problem?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/cp/post-problem/${id}`, {
                method: "DELETE",
                headers: { authorization: "Bearer " + token }, // ✅ include token
            });
            if (!res.ok) throw new Error("Failed to delete problem");
            setProblems((prev) => prev.filter((prob) => (prob._id || prob.id) !== id));
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePostProblem = async (e) => {
        e.preventDefault();
        if (!problemLink) return;
        setPosting(true);
        try {
            const res = await fetch("/api/cp/post-problem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + token,
                },
                body: JSON.stringify({ problemLink }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post problem");
            setProblems((prev) => [data.problem, ...prev]);
            setProblemLink("");
            alert("Problem posted!");
        } catch (err) {
            alert(err.message);
        } finally {
            setPosting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-black">
            <Loader />
        </div>
    );
    // ✅ Show "NotAllowed" if role is missing or not authorized
    if (role !== "cp-cym-moderator" && role !== "admin") {
        return <NotAllowed />;
    }


    return (
        <div style={{ padding: "2rem", color: "white" }}>
            <h2>CP Problems</h2>

            <h1 className="text-3xl my-10">Please note : Contact CP Lead to delete problems</h1>

            {/* Add Problem Form */}
            <form onSubmit={handlePostProblem} style={{ marginBottom: "2rem", display: "flex", gap: 8 }}>
                <input
                    type="text"
                    value={problemLink}
                    onChange={e => setProblemLink(e.target.value)}
                    placeholder="Paste Codeforces problem link"
                    style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #444" }}
                    required
                />
                <button
                    type="submit"
                    disabled={posting}
                    style={{
                        background: "#36d1c4",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.5rem 1.5rem",
                        fontWeight: 600,
                        cursor: posting ? "not-allowed" : "pointer",
                        opacity: posting ? 0.7 : 1,
                    }}
                >
                    {posting ? "Posting..." : "Post Problem"}
                </button>
            </form>

            {loading && <div>Loading problems...</div>}
            {!loading && problems.length === 0 && <div>No problems found</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {problems.map((prob) => (
                    <div
                        key={prob._id}
                        style={{
                            background: "#222",
                            padding: "1rem",
                            borderRadius: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <h3 style={{ margin: 0 }}>{prob.title}</h3>
                            <p style={{ margin: 0, opacity: 0.8 }}>{prob.description}</p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={() => setSolutionDialog({ open: true, problemId: prob._id, solutionLink: prob.solution || "" })}
                                style={{
                                    background: "#36d1c4",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer",
                                }}
                            >
                                {prob.solution ? "Edit Solution" : "Add Solution"}
                            </button>
                            <button
                                onClick={() => handleDelete(prob._id)}
                                style={{
                                    background: "#ff5252",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Solution Dialog */}
            {solutionDialog.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: '#1a2035',
                        padding: '2rem',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, color: 'white' }}>Add Solution Link</h3>
                        <input
                            type="text"
                            value={solutionDialog.solutionLink}
                            onChange={(e) => setSolutionDialog(prev => ({ ...prev, solutionLink: e.target.value }))}
                            placeholder="Enter solution link"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                margin: '1rem 0',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                backgroundColor: '#2d3748',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setSolutionDialog({ open: false, problemId: null, solutionLink: "" })}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid #4a5568',
                                    background: 'transparent',
                                    color: '#a0aec0',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!solutionDialog.solutionLink.trim()) return;
                                    setSavingSolution(true);
                                    try {
                                        const res = await fetch(`/api/cp/post-problem/${solutionDialog.problemId}`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'authorization': 'Bearer ' + token,
                                            },
                                            body: JSON.stringify({ solutionLink: solutionDialog.solutionLink }),
                                        });

                                        if (!res.ok) throw new Error('Failed to save solution');

                                        // Update the problems list with the new solution link
                                        setProblems(prev => prev.map(prob =>
                                            prob._id === solutionDialog.problemId
                                                ? { ...prob, solutionLink: solutionDialog.solutionLink }
                                                : prob
                                        ));

                                        setSolutionDialog({ open: false, problemId: null, solutionLink: "" });
                                        alert('Solution saved successfully!');
                                    } catch (err) {
                                        alert(err.message);
                                    } finally {
                                        setSavingSolution(false);
                                    }
                                }}
                                disabled={savingSolution}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: '#36d1c4',
                                    color: 'white',
                                    cursor: savingSolution ? 'not-allowed' : 'pointer',
                                    opacity: savingSolution ? 0.7 : 1,
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                {savingSolution ? 'Saving...' : 'Save Solution'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CPProblemsSection;
