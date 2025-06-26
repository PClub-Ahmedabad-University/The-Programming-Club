"use client";
import React from 'react';
import { Upload, Trash2, Plus, X } from 'lucide-react';
import Loader from "@/ui-components/LoaderAdmin";
import { Image as ImageIcon } from "lucide-react"

function GallerySection({ fkthetoken }) {
  const [events, setEvents] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [newImages, setNewImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  
  // Create new event state
  const [newEventName, setNewEventName] = React.useState("");
  const [newEventImages, setNewEventImages] = React.useState([]);
  
  // Use in-memory token storage since localStorage isn't available
  const [token] = React.useState("token");

  // Fetch all gallery events
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/gallery/get", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
      else if (Array.isArray(data.data)) setEvents(data.data);
      else if (Array.isArray(data.galleries)) setEvents(data.galleries);
      else setEvents([]);
    } catch (err) {
      alert("Failed to fetch gallery events");
      setEvents([]);
    }
  };

  React.useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  // Select event handler
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setNewImages([]);
  };

  // Add new images to event
  const handleAddImages = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!selectedEvent || newImages.length === 0) {
        alert("Select an event and add images");
        setLoading(false);
        return;
      }
      // Convert files to base64
      const base64Images = await Promise.all(
        Array.from(newImages).map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      const res = await fetch(`/api/gallery/patch/${selectedEvent._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({ newImages: base64Images }),
      });
      if (!res.ok) throw new Error("Failed to add images");
      setNewImages([]);
      await fetchEvents();
      // Refresh selected event
      const updated = await res.json();
      setSelectedEvent(updated.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete individual image
  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("Delete this image?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/patch/${selectedEvent._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          removeImageUrls: [imageUrl],
        }),
      });
      if (!res.ok) throw new Error("Failed to delete image");
      const updated = await res.json();
      setSelectedEvent(updated.data);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete entire event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!confirm("Delete this entire event and all its images?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/delete/${selectedEvent._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setSelectedEvent(null);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!newEventName || newEventImages.length === 0) {
        alert("Event name and images required");
        setLoading(false);
        return;
      }
      const base64Images = await Promise.all(
        Array.from(newEventImages).map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      const res = await fetch("/api/gallery/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({ eventName: newEventName, images: base64Images }),
      });
      if (!res.ok) throw new Error("Failed to add event");
      setNewEventName("");
      setNewEventImages([]);
      setShowCreateForm(false);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    <div className="flex items-center justify-center min-h-screen bg-[#0C1224]">
        <Loader/>
    </div>
  }

  return (
    <div className="min-h-screen bg-[#0C1224] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gallery Manager</h1>
            <p className="text-gray-400">Manage your event galleries and images</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-400/25 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        </div>

        {/* Create New Event Form */}
        {showCreateForm && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Create New Event</h2>
            <div onSubmit={handleAddEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Name</label>
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Images</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewEventImages(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="border-2 border-dashed border-gray-600 hover:border-cyan-400 rounded-lg p-8 text-center transition-all duration-200">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-300">
                      {newEventImages.length > 0 
                        ? `${newEventImages.length} files selected` 
                        : "Click to upload images or drag and drop"
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleAddEvent}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Events</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No events found</p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event._id}
                      onClick={() => handleSelectEvent(event)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedEvent?._id === event._id
                          ? 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/50 shadow-lg'
                          : 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${
                            selectedEvent?._id === event._id ? 'text-cyan-400' : 'text-white'
                          }`}>
                            {event.eventName}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {event.imageUrls?.length || 0} images
                          </p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          selectedEvent?._id === event._id
                            ? 'bg-cyan-400 text-gray-900'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {event.imageUrls?.length || 0}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedEvent ? (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-2xl">
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.eventName}</h2>
                    <p className="text-gray-400">{selectedEvent.imageUrls?.length || 0} images in this event</p>
                  </div>
                  <button
                    onClick={handleDeleteEvent}
                    disabled={loading}
                    className="mt-4 sm:mt-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    <span>Delete Event</span>
                  </button>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {selectedEvent.imageUrls?.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-gray-800/30 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${idx}`}
                        className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteImage(url)}
                          className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition-all duration-200 shadow-lg"
                          title="Delete Image"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Images Form */}
                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-cyan-400">Add More Images</h3>
                  <div>
                    <div className="relative mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setNewImages(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="border-2 border-dashed border-gray-600 hover:border-cyan-400 rounded-lg p-6 text-center transition-all duration-200">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-300">
                          {newImages.length > 0 
                            ? `${newImages.length} files selected` 
                            : "Select images to add to this event"
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImages}
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-400/25 disabled:opacity-50"
                    >
                      {loading ? "Adding..." : "Add Images"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center shadow-2xl">
                <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No Event Selected</h3>
                <p className="text-gray-400">Choose an event from the sidebar to view and manage its images</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GallerySection;