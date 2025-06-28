"use client";

import { useEffect, useState } from 'react';
import { Card } from "@heroui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, UserPlus } from "lucide-react";
import FormSubmissions from "@/app/admin/dashboard/FormSubmissions";
import MembersSection from "@/app/admin/dashboard/MembersSection";
import RecruitmentSection from "@/app/admin/dashboard/RecruitmentSection";
import NotAllowed from "@/app/Components/NotAllowed";
import { jwtDecode } from "jwt-decode";


export default function Share() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('form-responses');

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

    const tabs = [
        {
            id: 'form-responses',
            label: 'Form Responses',
            icon: <FileText className="w-4 h-4 mr-2" />,
            content: <FormSubmissions />
        },
        {
            id: 'members',
            label: 'Members',
            icon: <Users className="w-4 h-4 mr-2" />,
            content: <MembersSection />
        },
        {
            id: 'recruitment',
            label: 'Recruitment',
            icon: <UserPlus className="w-4 h-4 mr-2" />,
            content: <RecruitmentSection />
        }
    ];

    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.3,
                ease: "easeOut"
            } 
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
            <div className="w-full">
                <div className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-900 to-gray-800 p-1.5 rounded-lg shadow-lg mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                activeTab === tab.id 
                                    ? 'text-white bg-gray-700/50 shadow-sm' 
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={tabVariants}
                        className="mt-4"
                    >
                        <Card className="border-none bg-gray-900/50 backdrop-blur-sm p-6">
                            {tabs.find(tab => tab.id === activeTab)?.content}
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

