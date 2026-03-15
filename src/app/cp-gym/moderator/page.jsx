"use client";

import { useState, useEffect } from "react";
import NotAllowed from "@/app/Components/NotAllowed";
import { getUserRoleFromToken } from "@/lib/auth";
import Loader from "@/ui-components/Loader1";
import { useUser } from "@/lib/UserContext";

function CPProblemsSection() {

  const { token } = useUser();

  const [role, setRole] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [problemLink, setProblemLink] = useState("");
  const [posting, setPosting] = useState(false);

  const [solutionDialog, setSolutionDialog] = useState({
    open: false,
    problemId: null,
    solutionLink: ""
  });

  const [savingSolution, setSavingSolution] = useState(false);

  useEffect(() => {
    if (token) {
      setRole(getUserRoleFromToken(token));
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchProblems = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/cp/post-problem", {
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
  }, [token]);

  const handleDelete = async (id) => {

    if (!confirm("Delete this problem?")) return;

    setLoading(true);

    try {

      const res = await fetch(`/api/cp/post-problem/${id}`, {
        method: "DELETE",
        headers: { authorization: "Bearer " + token },
      });

      if (!res.ok) throw new Error("Failed to delete problem");

      setProblems((prev) =>
        prev.filter((prob) => (prob._id || prob.id) !== id)
      );

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <Loader />
      </div>
    );
  }

  if (role !== "cp-cym-moderator" && role !== "admin") {
    return <NotAllowed />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">

      <h1 className="text-4xl font-bold mb-10">
        CP Gym Management
      </h1>

      <form
        onSubmit={handlePostProblem}
        className="flex gap-4 mb-10"
      >

        <input
          type="text"
          value={problemLink}
          onChange={(e) => setProblemLink(e.target.value)}
          placeholder="Codeforces problem link"
          className="flex-1 px-4 py-3 bg-gray-800 rounded-xl"
          required
        />

        <button
          type="submit"
          disabled={posting}
          className="px-6 py-3 bg-blue-600 rounded-xl"
        >
          {posting ? "Posting..." : "Add Problem"}
        </button>

      </form>

      <div className="grid gap-6">

        {problems.map((prob) => (

          <div
            key={prob._id}
            className="bg-gray-900 p-6 rounded-xl flex justify-between items-center"
          >

            <div>

              <h3
                onClick={() => window.open(prob.link)}
                className="text-lg font-semibold cursor-pointer"
              >
                {prob.title}
              </h3>

              {prob.solutionLink && (
                <p className="text-green-400 text-sm mt-1">
                  Solution Available
                </p>
              )}

            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setSolutionDialog({
                    open: true,
                    problemId: prob._id,
                    solutionLink: prob.solutionLink || "",
                  })
                }
                className="px-4 py-2 bg-green-600 rounded-lg"
              >
                {prob.solutionLink ? "Edit Solution" : "Add Solution"}
              </button>

              <button
                onClick={() => handleDelete(prob._id)}
                className="px-4 py-2 bg-red-600 rounded-lg"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

      {solutionDialog.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">

          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">

            <h2 className="text-xl font-bold mb-6">
              Solution Link
            </h2>

            <input
              type="url"
              value={solutionDialog.solutionLink}
              onChange={(e) =>
                setSolutionDialog((prev) => ({
                  ...prev,
                  solutionLink: e.target.value,
                }))
              }
              placeholder="Blog / solution link"
              className="w-full px-4 py-3 bg-gray-800 rounded-xl mb-6"
            />

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setSolutionDialog({
                    open: false,
                    problemId: null,
                    solutionLink: "",
                  })
                }
                className="flex-1 px-4 py-3 bg-gray-700 rounded-xl"
              >
                Cancel
              </button>

              <button
                disabled={
                  savingSolution ||
                  !solutionDialog.solutionLink.trim()
                }
                onClick={async () => {

                  setSavingSolution(true);

                  try {

                    const res = await fetch(
                      `/api/cp/post-problem/${solutionDialog.problemId}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          authorization: "Bearer " + token,
                        },
                        body: JSON.stringify({
                          solutionLink: solutionDialog.solutionLink,
                        }),
                      }
                    );

                    if (!res.ok) throw new Error("Failed");

                    setProblems((prev) =>
                      prev.map((p) =>
                        p._id === solutionDialog.problemId
                          ? {
                              ...p,
                              solutionLink: solutionDialog.solutionLink,
                            }
                          : p
                      )
                    );

                    setSolutionDialog({
                      open: false,
                      problemId: null,
                      solutionLink: "",
                    });

                  } catch (err) {
                    alert(err.message);
                  } finally {
                    setSavingSolution(false);
                  }

                }}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-xl"
              >
                {savingSolution ? "Saving..." : "Save"}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default CPProblemsSection;