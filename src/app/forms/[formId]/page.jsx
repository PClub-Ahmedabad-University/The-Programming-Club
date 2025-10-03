'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { getToken, getUserIdFromToken } from '@/lib/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ShinyButton from '@/ui-components/ShinyButton';
import Loader from '@/ui-components/Loader1';

export default function DynamicForm() {
  const params = useParams();
  const router = useRouter();
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
  const [islogin, setIslogin] = useState(true);

  const getUserId = useCallback(() => {
    const token = getToken();
    const userId = getUserIdFromToken(token);
    if (!userId) {
      setIslogin(false);
    }
    return userId;
  }, []);

  const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    const bgColors = {
      success: 'bg-green-900/90 border-green-700',
      error: 'bg-red-900/90 border-red-700',
      info: 'bg-blue-900/90 border-blue-700'
    };

    return (
      <div className={`fixed top-4 right-4 z-50 ${bgColors[type]} border rounded-xl p-4 max-w-sm shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{icons[type]}</span>
          <p className="text-gray-100 text-sm">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-200"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const showToast = (message, type = 'info', redirectUrl = null) => {
    setToastMessage({ message, type });
    if (redirectUrl) {
      const timer = setTimeout(() => {
        router.push(redirectUrl);
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    const checkFormSubmission = async () => {
      const userId = getUserId();
      if (!userId) return;

      try {
        const response = await fetch(`/api/forms/${formId}/submit`, {
          method: 'GET',
          headers: { 'x-user-id': userId }
        });

        if (response.ok) {
          const data = await response.json();
          setHasSubmitted(data.submitted || false);
        }
      } catch (err) {
        console.error('Error checking form submission:', err);
      }
    };

    checkFormSubmission();
  }, [formId, getUserId]);

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!formId) {
          throw new Error('No form ID provided');
        }

        const res = await fetch(`/api/forms/${formId}`, {
          headers: {
            'x-user-id': getUserId()
            , "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          }
        });
        const data = await res.json();

        if (data.submitted) {
          setHasSubmitted(true);
          return;
        }

        const form = data._doc;

        if (!res.ok) {
          console.error('❌ API Error:', { status: res.status, data });
          throw new Error(data.error || `Failed to fetch form (${res.status})`);
        }
        setForm(form);
      } catch (err) {
        console.error('❌ Error in fetchForm:', {
          error: err.message,
          stack: err.stack,
          formId
        });
        setError(err.message || 'Failed to load form');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId, params]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      if (!form) {
        throw new Error('Form data not loaded');
      }

      const userId = getUserId();
      if (!userId) {
        throw new Error('You must be logged in to submit this form');
      }

      if (hasSubmitted) {
        showToast('ℹ️ You have already submitted this form.', 'info');
        return;
      }


      const requiredFields = form.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => {
        const value = formData[field.name];

        if (value === undefined || value === null || value === '') {
          return true;
        }

        if (typeof value === 'string') {
          return !value.trim();
        }

        if (Array.isArray(value)) {
          return value.length === 0;
        }
        return false;
      });

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.map(f => f.name).join(', ')}`);
      }

      const submissionData = {};
      form.fields.forEach(field => {
        const fieldValue = formData[field.name];
        if (fieldValue !== undefined && fieldValue !== '') {
          submissionData[field.name] = fieldValue;
        }
      });
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ responses: submissionData }),
      });

      const responseData = await response.json().catch(() => ({
        error: 'Failed to parse server response',
        details: 'The server returned an invalid response.'
      }));

      if (!response.ok) {
        const errorMessage = responseData.error ||
          responseData.message ||
          `Submission failed with status ${response.status}: ${response.statusText}`;

        const errorDetails = responseData.details ?
          `\n\nDetails: ${responseData.details}` : '';

        throw new Error(`${errorMessage}${errorDetails}`);
      }

      showToast('✅ Form submitted successfully!', 'success');
      setFormData({});
      setHasSubmitted(true);
      refreshData();

    } catch (err) {
      console.error('Error submitting form:', err);
      showToast(`❌ Error submitting form: ${err.message}`, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (!islogin) {
    localStorage.setItem("form-address", window.location.pathname);
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

          <p className="text-gray-300 text-2xl mb-6">Login to Access this form!</p>
          <p className="text-gray-300 text-lg mb-6">Sign up is required before logging in.</p>
          <div className="flex justify-center gap-4">
            <ShinyButton
              title="Try Again"
              className="px-6 py-1.5 text-md font-content"
              onClick={() => window.location.reload()}
            />

            <ShinyButton
              title="Sign Up"
              className="px-10 py-1.5 text-md font-content"
              onClick={() => router.push('/users/sign-up')}
            />
            <ShinyButton
              title="Login"
              className="px-10 py-1.5 text-md font-content"
              onClick={() => router.push('/users/login')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Form</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <ShinyButton
            title="Try Again"
            className="px-6 py-1.5 text-md font-content"
            onClick={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Show form closed state
  if (form?.state === 'closed') {
    return (
      <div className="font-content min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Form Submissions Closed</h2>
          <p className="text-gray-300 mb-2">This form is currently not accepting responses.</p>
          <p className="text-gray-400 text-base mb-6">If you think it is a mistake, contact <a href="mailto:programming.club@ahduni.edu.in" className="text-blue-500 font-bold hover:underline">programming.club@ahduni.edu.in</a></p>
          <div className="flex justify-center">
            <ShinyButton
              title="Return Home"
              className="px-6 py-1.5 text-md font-content"
              onClick={() => router.push('/')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show already submitted state
  if (hasSubmitted) {
    return (
      <div className="font-content min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Form Submitted Successfully !</h2>
          <p className="text-gray-300 mb-2">Thank you for your submission!</p>
          <p className="text-gray-400 text-base mb-6">If you think it is a mistake, contact <span className="text-blue-500 font-bold">programming.club@ahduni.edu.in</span></p>
          <div className="flex justify-center gap-4">
            <ShinyButton
              title="Return Home"
              className="px-6 py-1.5 text-md font-content"
              onClick={() => router.push('/')}
            />
            {/* <ShinyButton
              title="Refresh Status"
              className="px-6 py-1.5 text-md font-content"
              onClick={refreshData}
            /> */}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center ">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Form Not Found</h2>
          <p className="text-gray-400">The requested form could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 p-4">
      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className=" h-32 bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">{form.title}</h1>
            <Image src="/logo.png" alt="P-Club Logo" width={100} height={100} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {form.fields?.map((field, index) => (
              <div key={index} className="space-y-2 border-b border-gray-800 pb-4">
                <label className="block text-lg font-medium text-gray-100">
                  {`${index + 1}. ${field.name}`}
                  {field.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={4}
                    className="w-full text-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-100 placeholder-gray-400 resize-none"
                    placeholder={`Fill the details`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full text-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-100"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.name || option.value}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'radio' ? (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`${field.name}-${option.value}`}
                          name={field.name}
                          value={option.value}
                          checked={formData[field.name] === option.value}
                          onChange={() => handleChange(field.name, option.value)}
                          required={field.required}
                          className="h-4 w-4 text-blue-500 border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                        />
                        <label
                          htmlFor={`${field.name}-${option.value}`}
                          className="ml-2 text-gray-100"
                        >
                          {option.name || option.value}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${field.name}-${option.value}`}
                          name={field.name}
                          value={option.value}
                          checked={formData[field.name]?.includes(option.value) || false}
                          onChange={(e) => {
                            const value = e.target.value;
                            const currentValues = formData[field.name] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, value]
                              : currentValues.filter((v) => v !== value);
                            handleChange(field.name, newValues);
                          }}
                          className="h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                        />
                        <label
                          htmlFor={`${field.name}-${option.value}`}
                          className="ml-2 text-gray-100"
                        >
                          {option.name || option.value}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full text-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-100 placeholder-gray-400"
                    placeholder={`Fill the details`}
                  />
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
};