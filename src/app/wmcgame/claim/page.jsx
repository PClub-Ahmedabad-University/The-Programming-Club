'use client';

import { useEffect, useState } from 'react';

export default function ClaimAudiencePage() {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all audience members
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/wmcgame');
    const data = await res.json();
    setAudiences(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaim = async (id) => {
    await fetch('/api/wmcgame', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchData(); // refresh table
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audience List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Enrollment</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Treasure</th>
              <th className="p-2 border">Retries</th>
              <th className="p-2 border">Claim</th>
            </tr>
          </thead>
          <tbody>
            {audiences.map((aud) => (
            <tr key={aud._id} className="text-center bg-white"> {/* row background for contrast */}
                <td className="p-2 border">{aud.enrollmentNumber}</td>
                <td className="p-2 border">{aud.role}</td>
                <td className="p-2 border">{aud.treasure}</td>
                <td className="p-2 border">{aud.retrys}</td>
                <td className="p-2 border">
                  {aud.retrys === -1 ? (
                    <span className="text-green-600 font-semibold">Claimed ✅</span>
                  ) : (
                    <button
                      onClick={() => handleClaim(aud._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Claim
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
