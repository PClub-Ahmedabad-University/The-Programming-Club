'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function DynamicForm() {
  const params = useParams();
  const formId = params?.formId;

  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!formId) {
          throw new Error('No form ID provided');
        }
        
        console.log('🔍 Fetching form with ID:', formId);
        const res = await fetch(`/api/forms/${formId}`);
        const data = await res.json();
        const form = data._doc;
        console.log('✅ Form data received:', form);

        if (!res.ok) {
          console.error('❌ API Error:', { status: res.status, data });
          throw new Error(data.error || `Failed to fetch form (${res.status})`);
        }

        console.log('✅ Form data received:', form);
        console.log(form.title)
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Form data before submission:', formData);
      
      // Transform form data to use field _id as keys
      const submissionData = {};
      form.fields.forEach(field => {
        const fieldValue = formData[field.name];
        if (fieldValue !== undefined && fieldValue !== '') {
          // Convert field._id to string if it's an object (for MongoDB ObjectId)
          const fieldId = field._id?.$oid || field._id?.toString() || field.name;
          submissionData[fieldId] = fieldValue;
        }
      });

      console.log('Submitting data:', {
        formId,
        responses: submissionData
      });

      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ responses: submissionData }),
      });

      const responseData = await response.json().catch(() => ({}));
      
      console.log('Submission response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(
          responseData.error || 
          responseData.message || 
          `Submission failed with status ${response.status}`
        );
      }

      alert('Form submitted successfully!');
      // Optionally reset form
      setFormData({});
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (isLoading) return <div className="p-6 text-white">Loading form...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!form) return <div className="p-6 text-white">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
   
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header with gradient and geometric pattern */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-8">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white tracking-tight">{form.title}</h1>
              <div className="mt-2 w-20 h-1 bg-white/50 rounded-full"></div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {form.fields?.map((field, index) => (
              <div key={field.name} className="group space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-200">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                  {field.name}
                  {field.required && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                      Required
                    </span>
                  )}
                </label>
                
                {field.type === 'textarea' ? (
                  <div className="relative">
                    <textarea
                      name={field.name}
                      required={field.required}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none text-gray-100 placeholder-gray-400 hover:bg-gray-800/70 hover:border-gray-600"
                      placeholder={`Enter your ${field.name.toLowerCase()}...`}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      required={field.required}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full px-5 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-100 placeholder-gray-400 hover:bg-gray-800/70 hover:border-gray-600"
                      placeholder={`Enter your ${field.name.toLowerCase()}...`}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Submit Form
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/20 group-hover:via-purple-600/20 group-hover:to-pink-600/20 rounded-xl transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}

