'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function QRScanAndCompare() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [retrys, setRetrys] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loadingPair, setLoadingPair] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enrollmentNumber.includes('AU') || enrollmentNumber.length !== 9) {
      alert('Please enter a valid enrollment number');
      return;
    }

    setLoadingPair(true);

    try {
      const res = await fetch('/api/wmcgame/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNumber }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        setError('Failed to get pair');
      } else {
        setRetrys(data.audience.retrys);
        setScanning(true);
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError('Request failed');
    } finally {
      setLoadingPair(false);
    }
  };

  const handleScan = async (data) => {
    if (!data || data.length === 0) return;

    try {
      const text = JSON.parse(data[0].rawValue);
      const { enrollment1, enrollment2 } = text;

      if (!enrollment1 || !enrollment2) {
        setError('QR code missing enrollment numbers');
        return;
      }

      setScanning(false);

      const res = await fetch('/api/wmcgame/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ str1: enrollment1, str2: enrollment2 }),
      });

      const responseData = await res.json();
      setResult(responseData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Invalid QR code format');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 space-y-6 relative">

      {/* Retrys Display */}
      {retrys !== null && (
        <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 shadow-lg font-semibold z-10">
          Retries: {retrys}
        </div>
      )}

      {/* Enrollment Number Input */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 z-0"
      >
        <h2 className="text-2xl font-bold text-center">Enter Your Enrollment Number</h2>
        <input
          type="text"
          value={enrollmentNumber}
          onChange={(e) => setEnrollmentNumber(e.target.value)}
          placeholder="AU1234567"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          {loadingPair ? 'Loading...' : 'Submit'}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>

      {/* QR Scanner */}
      {scanning && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden p-4">
          <Scanner
            onScan={handleScan}
            styles={{
              container: { width: '100%', height: '300px' },
              video: { width: '100%', height: '100%', objectFit: 'cover' },
            }}
          />
        </div>
      )}

      {/* QR Comparison Result */}
      {result && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Comparison Result:</h3>
          <p>
            Are Equal: <span className="font-bold">{result.areEqual ? 'Yes' : 'No'}</span>
          </p>
          <p>
            Comparison: <span className="font-bold">{result.comparison}</span>
          </p>
        </div>
      )}
    </div>
  );
}
