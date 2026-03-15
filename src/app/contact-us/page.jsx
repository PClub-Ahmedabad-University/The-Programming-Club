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
import { useUser } from "@/lib/UserContext";

const ContactPage = () => {

  const { token } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    setFormData({
      ...formData,
      [name]: value,
    });

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }

    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const codeElements = ["</>", "{}", "[]", "()", "=>", "//", "/*", "*/"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 text-white overflow-hidden relative">

      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {isMounted && (
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
      )}

      <div className="pt-20 pb-16 px-4 text-center">

        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
          <FaBug className="text-5xl text-white" />
        </div>

        <h1 className="text-5xl font-bold mb-4">
          Oops! Found a Bug?
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Your feedback helps us improve the platform.
          Let us know what went wrong and we’ll fix it quickly.
        </p>

      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 px-6 pb-20">

        <div className="bg-slate-800/40 p-8 rounded-2xl">

          <h2 className="text-2xl font-bold mb-6">
            Report Your Bug
          </h2>

          <div className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-slate-900 rounded-lg"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 bg-slate-900 rounded-lg"
            />

            <input
              type="text"
              name="subject"
              placeholder="Bug Subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-3 bg-slate-900 rounded-lg"
            />

            <textarea
              name="message"
              rows="5"
              placeholder="Describe the issue..."
              value={formData.message}
              onChange={handleInputChange}
              className="w-full p-3 bg-slate-900 rounded-lg"
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-cyan-600 rounded-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </button>

            <AnimatePresence>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 flex gap-2 items-center"
                >
                  <FaCheckCircle />
                  Bug report submitted successfully
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400"
                >
                  Something went wrong. Please try again.
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

        <div className="space-y-10">

          <div className="bg-slate-800/40 p-8 rounded-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Contact Information
            </h2>

            <div className="space-y-6">

              <div className="flex gap-4 items-center">
                <HiMail className="text-cyan-400 text-xl" />
                <a
                  href="mailto:programming.club@ahduni.edu.in"
                  className="text-cyan-400"
                >
                  programming.club@ahduni.edu.in
                </a>
              </div>

              <div className="flex gap-4 items-center">
                <HiLocationMarker className="text-cyan-400 text-xl" />
                <p className="text-gray-300">
                  Ahmedabad University, Gujarat, India
                </p>
              </div>

            </div>

          </div>

          <div className="bg-slate-800/40 p-8 rounded-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Connect With Us
            </h2>

            <div className="flex gap-6">

              {socialLinks.map((social, i) => (

                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 flex items-center justify-center bg-slate-900 rounded-xl"
                >
                  <social.icon className="text-2xl" />
                </a>

              ))}

            </div>

          </div>

          <div className="p-4 bg-slate-800 rounded-lg flex items-center gap-3">
            <FaLaptopCode />
            <p className="text-sm">
              Join our programming community!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ContactPage;