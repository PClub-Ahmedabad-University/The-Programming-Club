"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaDiscord, FaGithub } from "react-icons/fa";
import { format } from "path";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!formData.message.trim()) newErrors.message = "Message is required";
        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setIsSubmitting(null);
        try {
            const res = await fetch("/api/contact-us", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                }),
            });

            if (res.ok) {
                setSubmitStatus("success");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setSubmitStatus("error");
            }
        } catch (error) {
            setSubmitStatus("error");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div className="pt-10 min-h-screen bg-gray-950 text-white font-content">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

            <motion.div
                className="relative h-[30vh] w-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/50 to-gray-950" />
                <motion.div
                    className="relative text-center px-4 sm:px-6 lg:px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="w-24 sm:w-28 md:w-32 mx-auto mb-6">
                        <Image
                            src="/logo1.png"
                            alt="P-Club Logo"
                            width={128}
                            height={128}
                            className="w-full h-auto"
                        />
                    </div>

                    <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading text-center"
                        variants={itemVariants}
                    >
                        Report a bug
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-300 mt-3 max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                     Kuddos on finding a bug!
                    </motion.p>
                </motion.div>
            </motion.div>

            <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Contact Form */}
                    <motion.div
                        className="backdrop-blur-sm bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col min-h-[400px] h-full"
                        variants={itemVariants}
                    >
                        <motion.h2
                            className="text-2xl font-semibold mb-6 text-white"
                            variants={itemVariants}
                        >
                            Send Us a Message
                        </motion.h2>
                        <div className="space-y-4 flex-grow">
                            <motion.div variants={itemVariants}>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 bg-white/5 border ${errors.name ? "border-red-500" : "border-white/10"
                                        } rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-200 hover:scale-[1.01]`}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={errors.name ? "name-error" : undefined}
                                />
                                {errors.name && (
                                    <p id="name-error" className="text-red-500 text-sm mt-2">
                                        {errors.name}
                                    </p>
                                )}
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"
                                        } rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-200 hover:scale-[1.01]`}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                />
                                {errors.email && (
                                    <p id="email-error" className="text-red-500 text-sm mt-2">
                                        {errors.email}
                                    </p>
                                )}
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label
                                    htmlFor="subject"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 bg-white/5 border ${errors.subject ? "border-red-500" : "border-white/10"
                                        } rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-200 hover:scale-[1.01]`}
                                    aria-invalid={!!errors.subject}
                                    aria-describedby={errors.subject ? "subject-error" : undefined}
                                />
                                {errors.subject && (
                                    <p id="subject-error" className="text-red-500 text-sm mt-2">
                                        {errors.subject}
                                    </p>
                                )}
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className={`w-full p-3 bg-white/5 border ${errors.message ? "border-red-500" : "border-white/10"
                                        } rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-200 hover:scale-[1.01] min-h-[100px]`}
                                    aria-invalid={!!errors.message}
                                    aria-describedby={errors.message ? "message-error" : undefined}
                                />
                                {errors.message && (
                                    <p id="message-error" className="text-red-500 text-sm mt-2">
                                        {errors.message}
                                    </p>
                                )}
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full p-3 bg-blue-700 rounded-md text-white text-lg font-semibold hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </motion.button>
                            </motion.div>
                            <AnimatePresence>
                                {submitStatus === "success" && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-green-400 text-center text-lg"
                                    >
                                        Message sent successfully!
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div
                        className="space-y-8 flex flex-col min-h-[400px] h-full"
                        variants={itemVariants}
                    >
                        <div className="backdrop-blur-sm bg-white/5 p-8 rounded-xl border border-white/10 flex-grow">
                            <motion.h2
                                className="text-2xl font-semibold mb-6 text-white"
                                variants={itemVariants}
                            >
                                Contact Information
                            </motion.h2>
                            <motion.div
                                className="space-y-6"
                                variants={itemVariants}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-blue-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400">Email</p>
                                        <p className="font-medium text-lg">
                                            <a
                                                href="mailto:programming.club@ahduni.edu.in"
                                                className="text-blue-400 hover:underline"
                                            >
                                                programming.club@ahduni.edu.in
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-blue-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400">Address</p>
                                        <p className="font-medium text-lg">
                                            Ahmedabad University, Commerce Six Roads, Navrangpura, Ahmedabad - 380009, Gujarat, India
                                        </p>
                                        <Image className="w-1/2 h-auto mx-auto my-10" src="/au-logo.png" alt="Location" width={200} height={50} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="backdrop-blur-sm bg-white/5 p-8 rounded-xl border border-white/10">
                            <motion.h2
                                className="text-2xl font-semibold mb-6 text-white"
                                variants={itemVariants}
                            >
                                Connect With Us
                            </motion.h2>
                            <motion.div
                                className="flex justify-start space-x-8"
                                variants={itemVariants}
                            >
                                <motion.a
                                    href="http://instagram.com/ahduni_programmingclub"
                                    aria-label="Follow P-Club on Instagram"
                                    whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 8px #3b82f6)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaInstagram className="text-3xl text-blue-400" />
                                </motion.a>
                                <motion.a
                                    href="https://discord.gg/dkftG9JWtt"
                                    aria-label="Join P-Club on Discord"
                                    whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 8px #3b82f6)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaDiscord className="text-3xl text-blue-400" />
                                </motion.a>
                                <motion.a
                                    href="https://github.com/PClub-Ahmedabad-University"
                                    aria-label="View P-Club on GitHub"
                                    whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 8px #3b82f6)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaGithub className="text-3xl text-blue-400" />
                                </motion.a>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;