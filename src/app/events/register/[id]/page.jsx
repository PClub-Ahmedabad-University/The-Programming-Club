"use client";

import { useEffect, useRef, useState } from "react";
import Loader from "@/ui-components/Loader1";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function RegisterEvent({ params }) {
  const { user, token } = useUser();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [currentEvent, setCurrentEvent] = useState();
  const [otpCorrect, setOtpCorrect] = useState(false);
  const [errors, setErrors] = useState(["", ""]);
  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpToken, setOtpToken] = useState(null);

  const emailInputRef = useRef();
  const otpInputRef = useRef();
  const sendOtpButtonRef = useRef();
  const verifyOtpButtonRef = useRef();

  const [showLearnMore, setShowLearnMore] = useState(false);
  const learnMoreRef = useRef(null);

  useEffect(() => {
    if (!user) router.push("/users/login");
  }, [user, router]);

  function handleLearnMoreClick() {
    setShowLearnMore((prev) => !prev);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (learnMoreRef.current && !learnMoreRef.current.contains(event.target)) {
        setShowLearnMore(false);
      }
    }

    if (showLearnMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLearnMore]);

  useEffect(() => {
    (async () => {
      const awaitedParams = await params;

      Promise.allSettled([
        fetch("/api/auth/validate", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }).then((res) =>
          res.status === 200 ? setLoggedIn(true) : setLoggedIn(false)
        ),

        fetch("/api/events/get/" + awaitedParams.id)
          .then((res) => {
            if (res.status === 200) return res;
            throw new Error("Event fetch failed");
          })
          .then((res) => res.json())
          .then((data) => setCurrentEvent(data.event))
          .catch(() => {}),
      ]).finally(() => {
        setLoading(false);
      });
    })();
  }, [params, token]);

  function checkValidEmail(email) {
    return /^(?!.*\+).{4,}@ahduni\.edu\.in$/.test(email);
  }

  async function sendOTP(email) {
    if (!checkValidEmail(email)) {
      setErrors((prev) => [
        ["Please enter a valid AHD University email address", "error"],
        prev[1],
      ]);
      return;
    }

    setSendingOtp(true);
    setErrors(["", ""]);

    try {
      const res = await fetch("/api/event-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otherData: { email },
        }),
      });

      const data = await res.json();

      if (res.status === 200 && data.data) {
        setOtpToken(data.data);
        setErrors((prev) => [
          [
            "OTP sent successfully! Please check your email (including spam folder)",
            "success",
          ],
          prev[1],
        ]);
      } else {
        setErrors((prev) => [
          ["Failed to send OTP. Please try again.", "error"],
          prev[1],
        ]);
      }
    } catch {
      setErrors((prev) => [
        ["Network error. Please check your connection.", "error"],
        prev[1],
      ]);
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOTP(otpFirstInput) {
    if (!otpToken) {
      setErrors((prev) => [["Please request OTP first", "error"], prev[1]]);
      return;
    }

    setVerifyingOtp(true);
    setErrors((prev) => [prev[0], ""]);

    let otp = "";
    let next = otpFirstInput;

    while (next && next.tagName === "INPUT") {
      otp += next.value;
      next = next.nextElementSibling;
    }

    if (otp.length !== 4) {
      setErrors((prev) => [
        prev[0],
        ["Please enter complete 4-digit OTP", "error"],
      ]);
      setVerifyingOtp(false);
      return;
    }

    try {
      const res = await fetch("/api/event-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otherData: { otp, otpToken },
        }),
      });

      if (res.status === 200) {
        setOtpCorrect(true);
        setErrors((prev) => [prev[0], ["OTP verified successfully!", "success"]]);
      } else {
        setErrors((prev) => [prev[0], ["Invalid OTP. Try again.", "error"]]);
      }
    } catch {
      setErrors((prev) => [
        prev[0],
        ["Network error. Please try again.", "error"],
      ]);
    } finally {
      setVerifyingOtp(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8 flex justify-center items-start">
      {!currentEvent ? (
        <div className="text-white text-center">Event Not Found</div>
      ) : (
        <div className="w-full max-w-4xl bg-neutral-200 rounded-3xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-950 to-[#0C1224] text-white p-8 text-center">
            <h1 className="text-3xl font-bold">{currentEvent.title}</h1>
          </div>

          {!loggedIn && !otpCorrect && (
            <div className="p-8">

              <input
                type="email"
                placeholder="your.name@ahduni.edu.in"
                ref={emailInputRef}
                className="w-full px-4 py-3 border rounded-xl"
              />

              <button
                ref={sendOtpButtonRef}
                onClick={() => sendOTP(emailInputRef.current?.value)}
                className="mt-4 w-full bg-blue-700 text-white py-3 rounded-xl"
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>

              {otpToken && (
                <>
                  <div className="flex gap-3 mt-6 justify-center">
                    <OTPInput ref={otpInputRef} />
                    <OTPInput />
                    <OTPInput />
                    <OTPInput />
                  </div>

                  <button
                    ref={verifyOtpButtonRef}
                    onClick={() => verifyOTP(otpInputRef.current)}
                    className="mt-4 w-full bg-green-700 text-white py-3 rounded-xl"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}
            </div>
          )}

          {(loggedIn || otpCorrect) && (
            <div className="p-8 text-center">
              {currentEvent.registrationOpen ? (
                currentEvent.formLink ? (
                  <iframe
                    src={currentEvent.formLink}
                    className="w-full h-[700px]"
                  />
                ) : (
                  <p>Registration form coming soon</p>
                )
              ) : (
                <p>Registration closed</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const OTPInput = ({ inputRef }) => {
  return (
    <input
      ref={inputRef}
      maxLength={1}
      className="w-12 h-12 text-center border rounded-lg"
      inputMode="numeric"
    />
  );
};