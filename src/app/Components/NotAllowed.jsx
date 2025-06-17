import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NotAllowed = () => {
    return (
        <div className="bg-gray-950 min-h-screen flex items-center justify-center px-4">
            <div className="text-center py-8 px-6 sm:px-10 md:px-16 bg-pclubBg text-white shadow-lg rounded-2xl max-w-lg w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-heading">
                    You are not allowed to access this page...
                </h1>
                <div className="w-full flex justify-center mb-4">
                    <Image
                        src="/laugh-cat.gif"
                        alt="Laughing Cat"
                        width={300}
                        height={300}
                        className="rounded-lg w-full max-w-xs h-auto"
                    />
                </div>
                <p className="text-gray-200 text-base sm:text-lg mb-6 font-content">
                    You really typed that name hoping it’d work? That’s cute.
                </p>
                <Link
                    href="/"
                    className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-content"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default NotAllowed;
