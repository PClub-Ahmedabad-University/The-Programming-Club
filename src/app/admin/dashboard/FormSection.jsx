'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Switch, Listbox } from '@headlessui/react';


const TABS = {
    RESPONSES: 'responses',
    CREATE: 'create',
};

export default function FormSection() {
    const [activeTab, setActiveTab] = useState(TABS.CREATE);
    const [isEventRegistration, setIsEventRegistration] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [title, setTitle] = useState('');
    const [fields, setFields] = useState([]);
    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingForm, setEditingForm] = useState(null);
    const [previewForm, setPreviewForm] = useState(null);

    const months = {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December',
    };

    const fieldTypes = [
        { value: 'text', label: 'Text Input' },
        { value: 'email', label: 'Email' },
        { value: 'number', label: 'Number' },
        { value: 'textarea', label: 'Long Text' },
        { value: 'radio', label: 'Multiple Choice' },
        { value: 'checkbox', label: 'Checkboxes' },
        { value: 'select', label: 'Dropdown' },
    ];

    const filteredForms = forms.filter(form =>
        form.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (activeTab === TABS.RESPONSES) {
            fetchForms();
        }
    }, [activeTab]);

    const fetchForms = async () => {
        setIsLoading(true);
        try {
            const formsRes = await fetch('/api/forms', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const formsData = await formsRes.json();

            const formsWithResponses = await Promise.all(
                formsData.map(async (form) => {
                    try {
                        const res = await fetch(`/api/forms/${form._id}/submit/get`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        const data = await res.json();
                        return {
                            ...form,
                            responseCount: data.success ? data.totalResponses : 0
                        };
                    } catch (error) {
                        console.error(`Error fetching responses for form ${form._id}:`, error);
                        return {
                            ...form,
                            responseCount: 0
                        };
                    }
                })
            );

            setForms(formsWithResponses);
        } catch (error) {
            console.error('Error fetching forms:', error);
            toast.error('Failed to load forms');
        } finally {
            setIsLoading(false);
        }
    };

    const getEventNameById = (eventId) => {
        const event = events.find(event => event._id === eventId);
        return event ? event.title : 'Unknown Event';
    };


    const handlePreviewClick = (form) => {
        setPreviewForm(form);
    };

    const closePreview = () => {
        setPreviewForm(null);
    };

    const downloadCSV = async (formId, formTitle) => {
        try {
            const res = await fetch(`/api/forms/${formId}/submit/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            const submissions = data.response;

            if (!Array.isArray(submissions) || submissions.length === 0) {
                alert('No submissions found for this form');
                return;
            }

            const allQuestions = new Set();
            submissions.forEach(sub => {
                sub.responses.forEach(resp => {
                    allQuestions.add(resp.question);
                });
            });

            const headers = ['Submission Time', ...Array.from(allQuestions)];

            const csvRows = submissions.map(sub => {
                const submittedDate = new Date(sub.submittedAt);
                const formattedDate = `${submittedDate.getDate().toString().padStart(2, '0')}/${months[submittedDate.getMonth() + 1]}/${submittedDate.getFullYear()}, ${submittedDate.getHours().toString().padStart(2, '0')}:${submittedDate.getMinutes().toString().padStart(2, '0')}:${submittedDate.getSeconds().toString().padStart(2, '0')}`;
                const rowMap = {
                    'Submission Time': formattedDate
                };

                sub.responses.forEach(resp => {
                    rowMap[resp.question] = resp.answer;
                });

                return headers.map(header => {
                    const val = rowMap[header] ?? '';
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',');
            });

            const csvContent = [headers.join(','), ...csvRows].join('\n');

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
        setFields([...fields, {
            name: '',
            type: 'text',
            required: false,
            options: []
        }]);
    };

    const updateField = (index, field, value) => {
        const updated = [...fields];
        const currentField = { ...updated[index] };

        if (field === 'name') {
            const cleanLabel = value
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            currentField.name = value;
        } else if (field === 'type') {
            currentField.type = value;
            if (['radio', 'checkbox', 'select'].includes(value)) {
                if (!currentField.options || currentField.options.length === 0) {
                    currentField.options = [{ name: 'Option 1', value: 'option1' }];
                }
            }
        } else if (field.startsWith('option-')) {
            const [_, optionIndex, optionProp] = field.split('-');
            const optionUpdate = { ...currentField.options[optionIndex], [optionProp]: value };
            currentField.options[optionIndex] = optionUpdate;
        } else {
            currentField[field] = value;
        }

        updated[index] = currentField;
        setFields(updated);
    };

    const addOption = (fieldIndex) => {
        const updated = [...fields];
        const options = updated[fieldIndex].options || [];
        const newOption = {
            name: `Option ${options.length + 1}`,
            value: `option${options.length + 1}`
        };
        updated[fieldIndex].options = [...options, newOption];
        setFields(updated);
    };

    const removeOption = (fieldIndex, optionIndex) => {
        const updated = [...fields];
        const options = [...updated[fieldIndex].options];
        options.splice(optionIndex, 1);
        updated[fieldIndex].options = options;
        setFields(updated);
    };

    const removeField = (i) => {
        const updated = fields.filter((_, index) => index !== i);
        setFields(updated);
    };

    const createForm = async () => {
        try {
            const formData = {
                title,
                fields,
                isEvent: isEventRegistration,
                ...(isEventRegistration && selectedEventId && { eventId: selectedEventId })
            };

            console.log('Sending form data:', formData);

            const res = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log('Server response:', data);

            if (!res.ok) throw new Error(data.error || 'Failed to create form');

            toast.success('Form created successfully');
            setTitle('');
            setFields([]);
            setSelectedEventId(null);
            setIsEventRegistration(false);
            fetchForms();
        } catch (error) {
            console.error('Error creating form:', error);
            toast.error(error.message || 'Failed to create form');
        }
    };

    const updateForm = async () => {
        if (!editingForm) return;

        try {
            const formData = {
                title,
                fields,
                isEvent: isEventRegistration,
                ...(isEventRegistration && selectedEventId && { eventId: selectedEventId })
            };

            console.log('Updating form with data:', formData);

            const res = await fetch(`/api/forms/${editingForm._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update form');
            }

            const data = await res.json();
            console.log('Update response:', data);

            toast.success('Form updated successfully');
            setTitle('');
            setFields([]);
            setSelectedEventId(null);
            setIsEventRegistration(false);
            setEditingForm(null);
            setIsEditModalOpen(false);
            fetchForms();
        } catch (error) {
            console.error('Error updating form:', error);
            toast.error(error.message || 'Failed to update form');
        }
    };

    const handleEditClick = (form) => {
        setTitle(form.title);
        setFields(form.fields);
        setEditingForm(form);
        setIsEventRegistration(form.isEvent);
        setSelectedEventId(form.eventId);
        setIsEditModalOpen(true);
        setActiveTab(TABS.CREATE);
        setSelectedEventTitle(getEventTitle(form.eventId));
    };

    const handleCancelEdit = () => {
        setTitle('');
        setFields([]);
        setEditingForm(null);
        setIsEditModalOpen(false);
    };

    const getEventTitle = (event) => event?.title || 'Untitled Event';
    const getEventId = (event) => event?._id || '';

    const handleEventSelect = (eventId) => {
        if (eventId) {
            // Find the full event object from the events array
            const event = events.find(e => e._id === eventId);
            setSelectedEvent(event || null);
            setSelectedEventId(eventId);
            console.log('Selected event ID:', eventId);
        } else {
            setSelectedEvent(null);
            setSelectedEventId(null);
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoadingEvents(true);
                const res = await fetch('/api/events/get');
                const data = await res.json();
                console.log(data)
                const validEvents = Array.isArray(data.data)
                    ? data.data.filter(event => event?._id && event?.title)
                    : [];
                console.log(validEvents)
                setEvents(validEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
                toast.error('Failed to load events');
                setEvents([]);
            } finally {
                setIsLoadingEvents(false);
            }
        };

        fetchEvents();
    }, []);
    const renderFormFields = (isEditModal = false) => (
        <div className="space-y-6">
            {fields.map((field, index) => (
                <div key={index} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all hover:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-200">
                            {field.name || `Field ${index + 1}`}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => removeField(index)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                aria-label="Remove field"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Field Type
                                </label>
                                <select
                                    value={field.type}
                                    onChange={(e) => updateField(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                                >
                                    {fieldTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Field Name
                                </label>
                                <input
                                    type="text"
                                    value={field.name}
                                    onChange={(e) => updateField(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                                    placeholder="e.g., full_name"
                                />
                            </div>
                        </div>



                        {/* Options for radio, checkbox, and select fields */}
                        {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">
                                    Options
                                </label>
                                <div className="space-y-2">
                                    {field.options?.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center space-x-2">
                                            {/* <input
                                                type="text"
                                                value={option.name}
                                                onChange={(e) =>
                                                    updateField(index, `option-${optionIndex}-name`, e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                                                placeholder={`Option ${optionIndex + 1}`}
                                            /> */}
                                            <input
                                                type="text"
                                                value={option.value}
                                                onChange={(e) =>
                                                    updateField(index, `option-${optionIndex}-value`, e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                                                placeholder={`value${optionIndex + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index, optionIndex)}
                                                className="text-red-400 hover:text-red-300 p-2"
                                                disabled={field.options.length <= 1}
                                                title={field.options.length <= 1 ? "At least one option is required" : "Remove option"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(index)}
                                        className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add Option
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Additional settings for textarea */}
                        {field.type === 'textarea' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Rows
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={field.rows || 3}
                                    onChange={(e) => updateField(index, 'rows', parseInt(e.target.value) || 3)}
                                    className="w-24 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                                />
                            </div>
                        )}

                        {/* Additional settings for file upload */}
                        {/* {field.type === 'file' && (
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Accept File Types
                                    </label>
                                    <input
                                        type="text"
                                        value={field.accept || ''}
                                        onChange={(e) => updateField(index, 'accept', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                                        placeholder="e.g., .pdf,.docx,image/*"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Comma-separated list of file types (e.g., .pdf,.jpg,image/*)
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`multiple-${index}`}
                                        checked={field.multiple || false}
                                        onChange={(e) => updateField(index, 'multiple', e.target.checked)}
                                        className="h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                                    />
                                    <label htmlFor={`multiple-${index}`} className="ml-2 text-sm text-gray-300">
                                        Allow multiple file uploads
                                    </label>
                                </div>
                            </div>
                        )} */}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`required-${index}`}
                                checked={field.required}
                                onChange={(e) => updateField(index, 'required', e.target.checked)}
                                className="h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                            />
                            <label htmlFor={`required-${index}`} className="ml-2 text-sm text-gray-300">
                                Required field
                            </label>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderFormPreview = (form) => (
        <div className="space-y-4">
            {form.isEvent && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Event
                    </label>
                    <p className="text-sm text-gray-400">{getEventNameById(form.eventId)}</p>
                </div>
            )}
            {fields.map((field, index) => (
                <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        {field.label || `Field ${index + 1}`}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderFieldPreview(field)}
                </div>
            ))}
        </div>
    );

    const renderFieldPreview = (field) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                        rows={field.rows || 3}
                        placeholder={field.placeholder || `Enter ${field.label || 'text'}...`}
                        disabled
                    />
                );
            case 'select':
                return (
                    <select
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                        disabled
                    >
                        {field.options?.map((option, i) => (
                            <option key={i} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, i) => (
                            <div key={i} className="flex items-center">
                                <input
                                    type="radio"
                                    name={`preview-${field.name}`}
                                    className="h-4 w-4 text-blue-500 border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                                    disabled
                                />
                                <label className="ml-2 text-gray-300">{option.name}</label>
                            </div>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, i) => (
                            <div key={i} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-500 rounded border-gray-600 focus:ring-blue-500/50 bg-gray-700/50"
                                    disabled
                                />
                                <label className="ml-2 text-gray-300">{option.name}</label>
                            </div>
                        ))}
                    </div>
                );
            case 'file':
                return (
                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="flex text-sm text-gray-400">
                                <span className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input type="file" className="sr-only" disabled />
                                </span>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                {field.accept ? `Accepts: ${field.accept}` : 'Any file type'}
                                {field.multiple ? ' (Multiple files allowed)' : ''}
                            </p>
                        </div>
                    </div>
                );
            default:
                return (
                    <input
                        type={field.type}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100"
                        placeholder={field.placeholder || `Enter ${field.label || 'text'}...`}
                        disabled
                    />
                );
        }
    };

    const renderFormActions = () => (
        <>
            <button
                onClick={addField}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-600 rounded-xl hover:bg-gray-800/30 hover:border-blue-500/50 transition-colors flex items-center justify-center space-x-2 text-gray-300 hover:text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Field</span>
            </button>
            <div className="flex space-x-4">
                <button
                    onClick={editingForm ? updateForm : createForm}
                    className="flex-1 py-3 px-4 border-2 border-gray-800 rounded-xl text-white bg-blue-800 hover:bg-blue-800/30 hover:border-blue-500/50 transition-colors flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{editingForm ? 'Update Form' : 'Create Form'}</span>
                </button>
                {editingForm && (
                    <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </>
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

                    {/* Event Registration Toggle */}
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm font-semibold text-gray-200">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                Is this an event registration form?
                            </label>
                            <Switch
                                checked={isEventRegistration}
                                onChange={() => setIsEventRegistration(!isEventRegistration)}
                                className={`${isEventRegistration ? 'bg-blue-600' : 'bg-gray-700'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            >
                                <span className="sr-only">Enable event registration</span>
                                <span
                                    className={`${isEventRegistration ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>

                        {isEventRegistration && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Select Event
                                </label>
                                <div className="relative">

                                    <Listbox value={selectedEvent} onChange={handleEventSelect}>
                                        <Listbox.Button className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200">
                                            <span className="block truncate">
                                                {selectedEvent ? selectedEvent.title : 'Select an event...'}
                                            </span>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                            {isLoadingEvents ? (
                                                <div className="px-4 py-2 text-sm text-gray-400">Loading events...</div>
                                            ) : events.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-gray-400">No events available</div>
                                            ) : (
                                                events.map((event) => (
                                                    <Listbox.Option
                                                        key={event._id}
                                                        value={event._id}
                                                        className={({ active, selected }) =>
                                                            `${active ? 'bg-blue-600 text-white' : 'text-gray-200'}
                                                            cursor-pointer select-none relative py-2 pl-3 pr-9`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="relative">
                                                                <span className={`${selected ? 'font-semibold' : 'font-normal'} block truncate`}>
                                                                    {event.title}
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-400">
                                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))
                                            )}
                                        </Listbox.Options>
                                    </Listbox>
                                </div>
                                {!selectedEvent && isEventRegistration && (
                                    <p className="mt-1 text-sm text-red-400">Please select an event</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-200">
                                {editingForm ? 'Edit Form' : 'Create New Form'}
                            </h2>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                                {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                            </span>
                        </div>
                        {renderFormFields()}
                        {renderFormActions()}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-200">Form Responses</h2>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search forms by title..."
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                            <p className="mt-2 text-gray-400">Loading forms...</p>
                        </div>
                    ) : filteredForms.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No forms found matching "{searchTerm}".
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredForms.map(form => (
                                <div key={form._id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-colors">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <div>
                                            <h3 className="font-medium text-gray-200">{form.title}</h3>
                                            <p className="text-sm text-gray-400">
                                                {form.responseCount || 0} {form.responseCount === 1 ? 'response' : 'responses'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Preview Button
                                            <button
                                                onClick={() => handlePreviewClick(form)}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 relative group"
                                                aria-label="Preview form"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Preview form
                                                </span>
                                            </button> */}
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEditClick(form)}
                                                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 relative group"
                                                aria-label="Edit form"
                                                data-tooltip-content="Edit form"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Edit form
                                                </span>
                                            </button>

                                            {/* Copy Link Button */}
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText("/forms/" + form._id);
                                                    toast.success("Link copied to clipboard");
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 relative group"
                                                aria-label="Copy form link"
                                                data-tooltip-content="Copy form link"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Copy form link
                                                </span>
                                            </button>

                                            {/* Download CSV Button */}
                                            <button
                                                onClick={() => downloadCSV(form._id, form.title)}
                                                disabled={!form.responseCount}
                                                className={`p-2 rounded-lg transition-colors duration-200 relative group ${!form.responseCount ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-green-400 hover:bg-gray-700/50'}`}
                                                aria-label="Download responses"
                                                data-tooltip-content={form.responseCount ? "Download responses as CSV" : "No responses to download"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    {form.responseCount ? 'Download responses' : 'No responses'}
                                                </span>
                                            </button>
                                            <div className="flex items-center">
                                                <span className={`text-sm mr-2 ${form.state === 'open' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {form.state === 'open' ? 'Open' : 'Closed'}
                                                </span>
                                                <Switch
                                                    checked={form.state === 'open'}
                                                    onChange={async () => {
                                                        try {
                                                            const response = await fetch(`/api/forms/${form._id}`, {
                                                                method: 'PATCH',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                },
                                                                body: JSON.stringify({
                                                                    state: form.state === 'open' ? 'closed' : 'open'
                                                                })
                                                            });

                                                            if (!response.ok) throw new Error('Failed to toggle form state');

                                                            const result = await response.json();
                                                            const newState = result.state;

                                                            // Update the local state to reflect the change
                                                            setForms(forms.map(f =>
                                                                f._id === form._id
                                                                    ? { ...f, state: newState }
                                                                    : f
                                                            ));

                                                            toast.success(`Form ${newState} successfully`);
                                                        } catch (error) {
                                                            console.error('Error toggling form state:', error);
                                                            toast.error('Failed to update form state');
                                                        }
                                                    }}
                                                    className={`${form.state === 'open' ? 'bg-blue-600' : 'bg-gray-600'
                                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                                >
                                                    <span className="sr-only">Toggle form state</span>
                                                    <span
                                                        className={`${form.state === 'open' ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                    />
                                                </Switch>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
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