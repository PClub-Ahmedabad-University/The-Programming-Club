"use client";

import Loader from '@/ui-components/Loader1';
import Image from 'next/image';
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { set } from 'mongoose';

const Page = () => {
  const [isUser, setIsUser] = useState(true);
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [qr, setQr] = useState("");
  const [generatingQR, setGeneratingQR] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!enrollmentNumber.includes("AU") || enrollmentNumber.length !== 9) {
        alert("Plese enter a valid enrollment number");
    }
    else {
        try {
            setIsUser(false);
            setGeneratingQR(true);
            const res = await fetch(`/api/wmcgame/pair`, {
                method: "POST",
                body: JSON.stringify({ enrollmentNumber }),
            });
            const data = await res.json();
            if(!res.ok) {
                console.log("Error generating a pair", data);
            }
            // console.log(data);
            setQr(data.qrCode);
            setGeneratingQR(false);
        } catch (error) {
            console.log("Request failed", error);
        }
    }
  }

  const handleScanner = () => {
    setQr(false);
    setOpenScanner(true);
  }

  const handleScan = async (data) => {
    const text =  JSON.parse(data[0].rawValue);
    console.log("Scanned data:", text);

    setOpenScanner(false);

    try {
        const res = await fetch(`/api/wmcgame/scan`, {
            method: "POST",
            body: JSON.stringify({ enrollmentNumber: text.audienceEnrollment, treasure: text.treasure }),
        });
        const data = await res.json();
        if(!res.ok) {
            console.log("Error scanning QR code", data);
        }
        alert(data.data);
    } catch (error) {
        console.log("Error scanning QR code", error);
    }

    // re-open scanner after short delay
    setTimeout(() => setOpenScanner(true), 500);
  }

  return (
    <div className='h-screen w-full flex flex-col'>
        <div className="top flex flex-col items-center">
            <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 mt-15">
                <div className="relative inline-block">
                    <h1 className="text-4xl font-heading md:text-6xl font-bold tracking-wider relative inline-block mb-4">
                        <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent border-3 border-blue-400/30 rounded-lg px-12 py-4 backdrop-blur-sm">
                            WMC GAME
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-lg z-0 rounded-lg"></span>
                    </h1>
                </div>
            </div>
            <p className='w-2/4 text-gray-500 mt-8 font-inter text-center'>Hello people ! Welcome to the expo, hope you enjoyed. But some enjoyment is still there. Play this game, get a chance to win stickers. So, get ready to playyyy. Click the <span className='border px-2 rounded-full'>i</span> button, to see the rules.</p>
        </div>
        <div className={`content-screen h-[calc(100vh-228px)] w-full flex justify-center ${isUser ? `items-start mt-25` : `items-center`}`}>
            {generatingQR && (
                <Loader/>
            )}
            {isUser && (
                <form onSubmit={handleSubmit} className={`h-fit user-input flex flex-col gap-5 w-2/5 items-center bg-gradient-to-br from-blue-900/30 to-purple-900/20 backdrop-blur-md border border-blue-400/20 rounded-2xl p-8 shadow-lg font-inter`}>
                    <input type="text" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400 transition-all duration-300" placeholder="Enter your enrollment number (Starting with AU)" required/>
                    <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 rounded-lg px-5 py-3 text-white font-semibold shadow-md hover:shadow-xl">
                        Enter the Game
                    </button>
                    <p className="text-sm text-gray-400 mt-2 text-center">
                        Click to get started and win exiciting <span className="text-green-400 font-bold">stickers</span>.
                    </p>
                </form>
            )}
            {!isUser && qr && (
                <div className='qr-box w-full flex flex-col items-center'>
                    <Image src={qr} alt='QR Code' height={100} width={200} className='h-fit w-1/4' priority draggable={false}/>
                    <p className='text-white font-inter mt-5'>Scan this to get the treasure, you have to find !</p>
                    <p className='text-white font-inter mb-10' onClick={handleScanner}>Done scanning, go to the <span className='underline cursor-pointer'>scanner</span>.</p>
                </div>
            )}
            {openScanner && (
                <div className="w-[50%] h-[80%] rounded-2xl overflow-hidden shadow-lg mb-12">
                    <Scanner
                        onScan={handleScan}
                        styles={{
                        container: {
                            width: "100%",
                            height: "100%",
                        },
                        video: {
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        },
                        }}
                    />
                </div>
            )}
        </div>
    </div>
  )
}

export default Page;