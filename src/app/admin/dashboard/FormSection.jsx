'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TABS = {
    CREATE: 'create',
    RESPONSES: 'responses'
};

export default function FormSection() {
    const [activeTab, setActiveTab] = useState(TABS.CREATE);
    const [title, setTitle] = useState('');
    const [fields, setFields] = useState([]);
    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (activeTab === TABS.RESPONSES) {
            fetchForms();
        }
    }, [activeTab]);

    const fetchForms = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/forms', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            console.log("Fetched Forms: ", data);
            setForms(data);
        } catch (error) {
            console.error('Error fetching forms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCSV = async (formId, formTitle) => {
        try {
            const res = await fetch(`/api/forms/${formId}/submissions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            
            if (!data.length) {
                alert('No submissions found for this form');
                return;
            }

            // Create CSV header
            const headers = Object.keys(data[0].data).join(',');
            const csvRows = data.map(submission => 
                Object.values(submission.data).map(field => 
                    `"${String(field).replace(/"/g, '""')}"`
                ).join(',')
            );
            
            const csvContent = [headers, ...csvRows].join('\n');
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${formTitle.replace(/\s+/g, '_')}_responses.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert('Failed to download responses');
        }
    };

    const addField = () => {
        setFields([...fields, { label: '', name: '', type: 'text', required: false }]);
    };

    const updateField = (index, field, value) => {
        const updated = [...fields];

        if (field === 'name') {
            // Auto-generate label from name
            const cleanLabel = value
                .toLowerCase()
                .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
                .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
                .trim()
                .replace(/\s+/g, '-')       // Replace spaces with hyphens
                .replace(/-+/g, '-');       // Remove consecutive hyphens

            updated[index] = {
                ...updated[index],
                name: value,
                label: cleanLabel
            };
        } else {
            updated[index] = {
                ...updated[index],
                [field]: value
            };
        }

        setFields(updated);
    };

    const removeField = (i) => {
        const updated = fields.filter((_, index) => index !== i);
        setFields(updated);
    };

    const createForm = async () => {
        const res = await fetch('/api/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, fields }),
        });
        const data = await res.json();
        alert('Form created with ID: ' + data._id);
    };

    const renderFormFields = () => (
        <div className="space-y-6">
            {fields.map((field, index) => (
                <div key={index} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all hover:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-200">Field {index + 1}</h3>
                        <button
                            onClick={() => removeField(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            aria-label="Remove field"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-400"
                                placeholder="e.g. Full Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Field Name</label>
                            <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateField(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-400 font-mono text-sm"
                                placeholder="e.g. full_name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Field Type</label>
                            <select
                                value={field.type}
                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                            >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="textarea">Text Area</option>
                                <option value="select">Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="radio">Radio Buttons</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                                    className="h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                                />
                                <span className="text-sm text-gray-300">Required</span>
                            </label>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addField}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-600 rounded-xl hover:bg-gray-800/30 hover:border-blue-500/50 transition-colors flex items-center justify-center space-x-2 text-gray-300 hover:text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Field</span>
            </button>
            <button
                onClick={createForm}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-600 rounded-xl hover:bg-gray-800/30 hover:border-blue-500/50 transition-colors flex items-center justify-center space-x-2 text-gray-300 hover:text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create Form</span>
            </button>
        </div>
    );

    const renderTabContent = () => {
        if (activeTab === TABS.CREATE) {
            return (
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-200">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                            Form Title
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter your form title..."
                                className="w-full px-5 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-100 placeholder-gray-400 hover:bg-gray-800/70 hover:border-gray-600"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-200">Form Fields</h2>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                                {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                            </span>
                        </div>
                        {renderFormFields()}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-200">Form Responses</h2>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                            <p className="mt-2 text-gray-400">Loading forms...</p>
                        </div>
                    ) : forms.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No forms found. Create your first form to get started.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {forms.map(form => (
                                <div key={form._id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium text-gray-200">{form.title}</h3>
                                            <p className="text-sm text-gray-400">
                                                {form.responseCount || 0} {form.responseCount === 1 ? 'response' : 'responses'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText("/forms/" + form._id);
                                                toast.success("Copied to clipboard");
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                                        >
                                            <span>Copy the Responder link</span>
                                        </button>
                                        <button
                                            onClick={() => downloadCSV(form._id, form.title)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                                            disabled={!form.responseCount}
                                        >
                                            <span>Download CSV</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 py-8 px-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        {activeTab === TABS.CREATE ? 'Create Form' : 'Form Responses'}
                    </h1>
                    <p className="text-gray-400">
                        {activeTab === TABS.CREATE ? 'Create a new form' : 'View and manage form responses'}
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex mb-8 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab(TABS.CREATE)}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === TABS.CREATE ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Create Form
                    </button>
                    <button
                        onClick={() => setActiveTab(TABS.RESPONSES)}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === TABS.RESPONSES ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Responses
                    </button>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                    <div className="p-8 space-y-8">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}