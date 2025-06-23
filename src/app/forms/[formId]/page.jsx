'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, Home } from 'lucide-react';
import { getToken, getUserIdFromToken } from '@/lib/auth';
import Image from 'next/image';

export default function DynamicForm() {
  const params = useParams();
  const formId = params?.formId;

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
    if(!userId){
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

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
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
          headers: { 'x-user-id': getUserId() }
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

        console.log('✅ Form data received:', form);
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

      // Validate required fields
      const requiredFields = form.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(
        field => !formData[field.name]?.trim()
      );

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.map(f => f.label || f.name).join(', ')}`);
      }

      // Prepare submission data
      const submissionData = {};
      form.fields.forEach(field => {
        const fieldValue = formData[field.name];
        if (fieldValue !== undefined && fieldValue !== '') {
          submissionData[field.name] = fieldValue;
        }
      });

      console.log('Submitting form data:', {
        formId,
        userId,
        responses: submissionData
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

      console.log('Submission response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

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
      window.scrollTo({ top: 0, behavior: 'smooth' });

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
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }
  if(!islogin){
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Form</h2>
          <p className="text-gray-300 mb-6">You must be logged in to submit this form.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Form</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show already submitted state
  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Form Already Submitted</h2>
          <p className="text-gray-300 mb-2">You have already submitted this form.</p>
          <p className="text-gray-400 text-sm mb-6">If this is a mistake, please contact support.</p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2" 
            onClick={() => window.location.href = '/'}
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Form Not Found</h2>
          <p className="text-gray-400">The requested form could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      {/* Toast Notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className=" h-32 bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">{form.title}</h1>
            <Image src="/logo.png" alt="P-Club Logo" width={100} height={100} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {form.fields?.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-md font-medium text-gray-100">
                  {field.name}
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
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-100 placeholder-gray-400 resize-none"
                    placeholder={`Fill the details`}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-100 placeholder-gray-400"
                    placeholder={`Fill the details`}
                  />
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
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
  )};