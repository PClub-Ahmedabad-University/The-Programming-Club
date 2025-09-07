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
                console.log(data.problems);
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
                headers: { authorization: "Bearer " + token },
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

    // SVG Icons
    const CodeIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    );

    const PlusIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    );

    const TrashIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const EditIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );

    const LinkIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    );

    const AlertIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    );

    const EmptyStateIcon = () => (
        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-950">
            <Loader />
        </div>
    );

    if (role !== "cp-cym-moderator" && role !== "admin") {
        return <NotAllowed />;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header with Pattern Background */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-950"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
                
                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <CodeIcon />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                CP Gym Management 
                            </h1>
                            <p className="text-gray-400 text-lg font-medium">Problem Management Dashboard</p>
                        </div>
                    </div>
                    
                    {/* Alert Banner */}
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <AlertIcon />
                            <p className="text-amber-200 font-medium">
                                Administrative Note: Contact CP Lead for problem deletion requests
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-12">
                {/* Add Problem Section */}
                <div className="mb-12">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-xl">
                                <PlusIcon />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Add New Problem</h2>
                        </div>
                        
                        <form onSubmit={handlePostProblem} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative group">
                                {/* <LinkIcon /> */}
                                <input
                                    type="text"
                                    value={problemLink}
                                    onChange={e => setProblemLink(e.target.value)}
                                    placeholder="Enter Codeforces problem URL (e.g., https://codeforces.com/problem/1234/A)"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/80 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:border-gray-600"
                                    required
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                    <LinkIcon />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={posting}
                                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 min-w-[140px]"
                            >
                                {posting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Posting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <PlusIcon />
                                        <span>Add Problem</span>
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Problems List */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Problems Collection</h2>
                        <div className="px-4 py-1.5 bg-blue-500/20 rounded-full">
                            <span className="text-blue-300 font-semibold text-sm">{problems.length} problems</span>
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-20">
                            <div className="inline-block w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-400 text-lg">Loading problems...</p>
                        </div>
                    )}
                    
                    {!loading && problems.length === 0 && (
                        <div className="text-center py-20">
                            <div className="mb-8">
                                <EmptyStateIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-300 mb-3">No Problems Yet</h3>
                            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
                        </div>
                    )}

                    <div className="grid gap-6">
                        {problems.map((prob, index) => (
                            <div
                                key={prob._id}
                                className="group bg-gray-900/60 backdrop-blur-sm border border-gray-800 hover:border-gray-700 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5"
                                style={{
                                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/20 group-hover:border-green-500/30 transition-colors">
                                                <CodeIcon />
                                            </div>
                                            <div className="flex-1">
                                                <h3 onClick={()=>window.location.href=prob.link} className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 leading-tight hover:cursor-pointer">
                                                    {prob.title}
                                                </h3>
                                                {prob.solutionLink && (
                                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm font-medium">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Solution Available
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                                        <button
                                            onClick={() => setSolutionDialog({ 
                                                open: true, 
                                                problemId: prob._id, 
                                                solutionLink: prob.solution || "" 
                                            })}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-emerald-500/25"
                                        >
                                            <EditIcon />
                                            <span>{prob.solution ? "Edit Solution" : "Add Solution"}</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDelete(prob._id)}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-red-500/25"
                                        >
                                            <TrashIcon />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Solution Dialog */}
            {solutionDialog.open && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl transform transition-all duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <LinkIcon />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Solution Link</h3>
                            </div>
                            <button
                                onClick={() => setSolutionDialog({ open: false, problemId: null, solutionLink: "" })}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="url"
                                    value={solutionDialog.solutionLink}
                                    onChange={(e) => setSolutionDialog(prev => ({ ...prev, solutionLink: e.target.value }))}
                                    placeholder="Add the blog link"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/80 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                    <LinkIcon />
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSolutionDialog({ open: false, problemId: null, solutionLink: "" })}
                                    className="flex-1 px-6 py-4 border border-gray-700 text-gray-300 font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300"
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
                                    disabled={savingSolution || !solutionDialog.solutionLink.trim()}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {savingSolution ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        "Save Solution"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

export default CPProblemsSection;