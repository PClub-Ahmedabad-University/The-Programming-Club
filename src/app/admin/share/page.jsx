"use client";

import { useEffect, useState } from 'react';
import FormSubmissions from "@/app/admin/dashboard/FormSubmissions";
import NotAllowed from "@/app/Components/NotAllowed";
import { jwtDecode } from "jwt-decode";


export default function Share() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('token');
            if (userData) {
                try {
                    const decodedToken = jwtDecode(userData);
                    if (decodedToken && (decodedToken.role === 'admin' || decodedToken.role === 'clubMember')) {
                        setUser(decodedToken.role);
                    }
                } catch (err) {
                    console.error("Failed to decode token:", err);
                }
            }
            setIsLoading(false);
        }
    }, []);

    if (isLoading) return <p>Loading...</p>;

    if (!user || !['admin', 'clubMember'].includes(user)) return <NotAllowed />;

    return <FormSubmissions />;
}
