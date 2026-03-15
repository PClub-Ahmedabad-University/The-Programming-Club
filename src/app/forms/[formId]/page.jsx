'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import ShinyButton from '@/ui-components/ShinyButton';
import Loader from '@/ui-components/Loader1';
import { useUser } from "@/lib/UserContext";

export default function DynamicForm() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useUser();

  const formId = params?.formId;

  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
      success: 'bg-green-900/90 border-green-700',
      error: 'bg-red-900/90 border-red-700',
      info: 'bg-blue-900/90 border-blue-700'
    };

    return (
      <div className={`fixed top-4 right-4 z-50 ${bgColors[type]} border rounded-xl p-4 max-w-sm shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start gap-2">
          <p className="text-gray-100 text-sm">{message}</p>
          <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-200">×</button>
        </div>
      </div>
    );
  };

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
  };

  useEffect(() => {
    const checkFormSubmission = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/forms/${formId}/submit`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasSubmitted(data.submitted || false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkFormSubmission();
  }, [formId, token]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`/api/forms/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (data.submitted) {
          setHasSubmitted(true);
          return;
        }

        if (!res.ok) throw new Error(data.error || "Failed to fetch form");

        setForm(data._doc);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId, token]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (!token) throw new Error("Login required");

      const requiredFields = form.fields.filter(f => f.required);
      const missing = requiredFields.filter(f => !formData[f.name]);

      if (missing.length) {
        throw new Error(`Missing: ${missing.map(f => f.name).join(", ")}`);
      }

      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ responses: formData })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      showToast("Form submitted successfully!", "success");
      setHasSubmitted(true);
      setFormData({});
      refreshData();

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-300 text-2xl mb-6">Login to access this form</p>
          <div className="flex justify-center gap-4">
            <ShinyButton title="Sign Up" onClick={() => router.push('/users/sign-up')} />
            <ShinyButton title="Login" onClick={() => router.push('/users/login')} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">{error}</p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-white text-xl">Form Submitted Successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          <div className="h-32 bg-blue-900 px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">{form.title}</h1>
            <Image src="/logo.png" alt="logo" width={100} height={100} />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {form.fields?.map((field, index) => (
              <div key={index} className="space-y-2 border-b border-gray-800 pb-4">

                <label className="text-gray-100">
                  {index + 1}. {field.name}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>

                <input
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100"
                />

              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-4 rounded-xl flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Submitting...
                </>
              ) : "Submit Form"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}