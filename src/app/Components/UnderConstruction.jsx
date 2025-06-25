import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
const UnderConstruction = () => {
    return (
        <div className="bg-gray-950 min-h-screen flex items-center justify-center">
            <div className="text-center p-8 bg-pclubBg text-white shadow-lg rounded-lg">
                <Image src="/under-construction.gif" className="w-full h-full mx-auto mb-4" alt="P-Club Logo" width={128} height={128} unoptimized />
                <h1 className="text-3xl font-bold text-white mb-2 font-heading">Page Under Construction ...</h1>
                {/* <p className="text-gray-200 text-xl mb-6 font-content">
                    This page is being worked on. By someone. Probably.
                </p> */}
                <p className="text-gray-200 text-lg mb-4 font-content">
                    This page will be ready right after you figure out what you’re doing with your life.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-content"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default UnderConstruction;