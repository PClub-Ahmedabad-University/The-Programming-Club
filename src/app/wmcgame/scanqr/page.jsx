'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function QRScanAndCompare() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [rollNumber1, setRollNumber1] = useState('');
  const [rollNumber2, setRollNumber2] = useState('');
  const [retrys, setRetrys] = useState(null);
  const [treasure, setTreasure] = useState('');
  const [treasureShow, setTreasureShow] = useState(''); // new variable
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loadingPair, setLoadingPair] = useState(false);

  // Submit own enrollment number
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentNumber.includes('AU') || enrollmentNumber.length !== 9) {
      alert('Please enter a valid enrollment number');
      return;
    }

    setLoadingPair(true);
    setError('');

    try {
      const res = await fetch('/api/wmcgame/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNumber }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok || !data) {
        setError('Failed to get pair');
      } else {
        setRollNumber1(enrollmentNumber); //AUDIENCE NUMBER
        setTreasure(data.treasure || '');
        setRetrys(data.audience.retrys || 0);
        setTreasureShow(data.treasure || ''); // show immediately on top of scanner
      }
    } catch (err) {
      console.error(err);
      setError('Request failed');
    } finally {
      setLoadingPair(false);
    }
  };

  // Handle QR scan
  const handleScan = async (data) => {
    if (!data || data.length === 0) return;

    try {
      const text = JSON.parse(data[0].rawValue);
      console.log(text);
      const scannedEnrollment = text.enrollmentNumber;
      const scannedTreasure = text.treasure;
      if (!scannedEnrollment) {
        setError('QR code missing enrollment number');
        return;
      }

      setRollNumber2(scannedEnrollment);

      // Call scan API
      const res = await fetch('/api/wmcgame/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber1,
          rollNumber2: scannedEnrollment,
        }),
      });

      const responseData = await res.json();

      if (responseData.areEqual) {
        setResult(`Treasure Found!! 🎉\nTreasure: ${scannedTreasure}`);
        setScanning(false);
      } else {
        setResult('Retry scanning');
        setRetrys(responseData.retrys);
        setScanning(false); // allow user to press Start Scan again
      }

      setError('');

      // Refresh retrys and treasureShow after scan by calling pair API again
      const retryRes = await fetch('/api/wmcgame/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNumber: rollNumber1 }),
      });
      const retryData = await retryRes.json();
      if (retryRes.ok && retryData) {
        setRetrys(retryData.audience.retrys || retrys);
        setTreasureShow(retryData.treasure || treasureShow); // update treasureShow
      }

    } catch (err) {
      console.error(err);
      setError('Invalid QR code format');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 space-y-6 relative">

      {/* Retrys Display */}
      {retrys !== null && (
        <div className="absolute bottom-6 left-6 bg-white rounded-full px-4 py-2 shadow-lg font-semibold z-20">
          {retrys === 9999
            ? 'You have already found the treasure! 🎉'
            : retrys === -1
            ? 'You have already claimed the treasure ✅'
            : `Attempts left: ${retrys}`}
        </div>
      )}



      {/* Enrollment Input */}
      {!rollNumber1 && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 z-10"
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
      )}

      {/* Show Treasure */}
      {treasureShow && (
        <div className="w-full max-w-md bg-yellow-100 rounded-2xl shadow-lg p-4 text-center font-semibold">
          Find this in any of the displayed websites: {treasureShow}
        </div>
      )}

      {/* Start Scan Button */}
      {rollNumber1 && !scanning && (
        <button
          onClick={() => setScanning(true)}
          disabled={retrys === 9999 || retrys === -1}
          className={`w-full max-w-md py-3 rounded-lg font-semibold transition 
            ${retrys === 9999 || retrys === -1 
              ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
              : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Start Scan
        </button>
      )}


      {/* QR Scanner */}
      {scanning && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden p-4">
          <h3 className="text-lg font-semibold mb-2 text-center">Scan QR Code</h3>
          <Scanner
            onScan={handleScan}
            styles={{
              container: { width: '100%', height: '300px' },
              video: { width: '100%', height: '100%', objectFit: 'cover' },
            }}
          />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 text-center font-semibold text-lg">
          {result}
        </div>
      )}

      {error && <p className="text-red-500 font-medium">{error}</p>}

    </div>
  );
}
