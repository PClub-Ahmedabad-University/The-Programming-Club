"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaInstagram,
  FaDiscord,
  FaGithub,
  FaBug,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCode,
  FaLaptopCode,
} from "react-icons/fa";
import { HiMail, HiLocationMarker, HiSparkles } from "react-icons/hi";
import { BiCodeAlt } from "react-icons/bi";

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

  const socialLinks = [
    {
      icon: FaInstagram,
      href: "http://instagram.com/ahduni_programmingclub",
      label: "Instagram",
      color: "from-purple-400 to-pink-400",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      icon: FaDiscord,
      href: "https://discord.gg/dkftG9JWtt",
      label: "Discord",
      color: "from-indigo-400 to-blue-400",
      bgGradient: "from-indigo-500/10 to-blue-500/10",
    },
    {
      icon: FaGithub,
      href: "https://github.com/PClub-Ahmedabad-University",
      label: "GitHub",
      color: "from-gray-400 to-slate-400",
      bgGradient: "from-gray-500/10 to-slate-500/10",
    },
  ];

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
    setSubmitStatus(null);
    try {
      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Floating code elements for background
  const codeElements = ["</>", "{}", "[]", "()", "=>", "//", "/*", "*/"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 text-white overflow-hidden relative">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
        body {
          font-family: "Inter", sans-serif;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(20px) rotate(-5deg);
          }
        }

        @keyframes slideInfinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .slide-animation {
          animation: slideInfinite 30s linear infinite;
        }

        .glow-effect {
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.15);
        }

        .text-gradient {
          background: linear-gradient(
            135deg,
            #00d4ff 0%,
            #00a8cc 50%,
            #0891b2 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Animated Background Grid Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating Code Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {codeElements.map((code, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-400/20 font-mono text-2xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          >
            {code}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.div
        className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 float-animation">
              <FaBug className="text-5xl text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-gradient">Oops! Found a Bug?</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            We're sorry you had to encounter this issue. Your feedback helps us
            improve! Let's squash this bug together and make our platform better
            for everyone.
          </motion.p>

          <motion.div
            className="mt-6 flex justify-center gap-4 flex-wrap"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <div className="px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-400/30 text-cyan-400 text-sm backdrop-blur-sm">
              <HiSparkles className="inline mr-2" />
              Quick Response Time
            </div>
            <div className="px-4 py-2 bg-teal-500/10 rounded-full border border-teal-400/30 text-teal-400 text-sm backdrop-blur-sm">
              <FaCode className="inline mr-2" />
              We Appreciate You!
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            className="relative"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-teal-600/10 blur-xl rounded-3xl"></div>
            <div className="relative backdrop-blur-xl bg-slate-800/30 p-8 rounded-2xl border border-cyan-500/20 shadow-2xl glow-effect">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                  <FaExclamationTriangle className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Report Your Bug
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-cyan-200 mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-slate-900/50 border ${
                      errors.name ? "border-red-500" : "border-cyan-500/30"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-cyan-200 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-slate-900/50 border ${
                      errors.email ? "border-red-500" : "border-cyan-500/30"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-cyan-200 mb-2"
                  >
                    Bug Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-slate-900/50 border ${
                      errors.subject ? "border-red-500" : "border-cyan-500/30"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                    placeholder="Brief description of the issue"
                  />
                  {errors.subject && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {errors.subject}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-cyan-200 mb-2"
                  >
                    Detailed Description
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    style={{ resize: "none" }}
                    className={`w-full p-3 bg-slate-900/50 border ${
                      errors.message ? "border-red-500" : "border-cyan-500/30"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                    placeholder="Please describe the bug in detail..."
                  />
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Submitting...
                    </span>
                  ) : (
                    <span className="relative z-10">Submit Bug Report</span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {submitStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm"
                    >
                      <FaCheckCircle className="text-green-400 text-xl" />
                      <p className="text-green-400 font-medium">
                        Bug report submitted successfully! We'll fix it soon.
                      </p>
                    </motion.div>
                  )}
                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm"
                    >
                      <p className="text-red-400 text-center">
                        Something went wrong. Please try again.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="space-y-9"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {/* Contact Information */}
            <div className="backdrop-blur-xl bg-slate-800/30 p-8 rounded-2xl border border-cyan-500/20 shadow-2xl glow-effect">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                    <HiMail className="text-white text-xl" />
                  </div>
                  <p>Contact Information</p>
                </h2>
              </div>

              <div className="space-y-6">
                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex-shrink-0 flex items-center justify-center border border-cyan-500/20">
                    <HiMail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-cyan-200/70">Email</p>
                    <p className="font-medium text-md sm:text-lg">
                      <a
                        href="mailto:programming.club@ahduni.edu.in"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm md:text-lg"
                      >
                        programming.club@ahduni.edu.in
                      </a>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex-shrink-0 flex items-center justify-center border border-cyan-500/20">
                    <HiLocationMarker className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-cyan-200/70">Address</p>
                    <p className="font-medium text-md sm:text-lg text-gray-300">
                      Ahmedabad University, Commerce Six Roads, Navrangpura,
                      Ahmedabad - 380009, Gujarat, India
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Connect With Us - Enhanced Carousel */}
            <div className="backdrop-blur-xl bg-slate-800/30 p-8 rounded-2xl border border-cyan-500/20 shadow-2xl glow-effect">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Connect With Us
              </h2>

              {/* Infinite Scrolling Carousel */}
              <div className="relative overflow-hidden py-8">
                <div className="flex slide-animation" style={{ width: "200%" }}>
                  {/* First set of icons */}
                  <div className="flex gap-8 px-4" style={{ minWidth: "100%" }}>
                    {[...socialLinks, ...socialLinks].map((social, index) => (
                      <motion.a
                        key={`first-${index}`}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center min-w-[120px]"
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${social.bgGradient} border border-cyan-500/20 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-110`}
                        >
                          <social.icon
                            className={`text-3xl bg-gradient-to-r ${social.color} bg-clip-text`}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-400 group-hover:text-cyan-400 transition-colors">
                          {social.label}
                        </p>
                      </motion.a>
                    ))}
                  </div>
                  {/* Duplicate set for seamless loop */}
                  <div className="flex gap-8 px-4" style={{ minWidth: "100%" }}>
                    {[...socialLinks, ...socialLinks].map((social, index) => (
                      <motion.a
                        key={`second-${index}`}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center min-w-[120px]"
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${social.bgGradient} border border-cyan-500/20 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-110`}
                        >
                          <social.icon
                            className={`text-3xl bg-gradient-to-r ${social.color} bg-clip-text`}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-400 group-hover:text-cyan-400 transition-colors">
                          {social.label}
                        </p>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-slate-800/80 rounded-lg border border-cyan-500/10">
              <div className="flex items-center gap-2 text-cyan-400">
                <FaLaptopCode className="text-xl" />
                <p className="text-sm font-medium">
                  Join our vibrant community of programmers!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
