import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

const API_URL = "http://localhost:3000/events";

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // null = adding, object = editing

  // Form state
  const initialFormState = {
    title: "",
    image: "",
    location: "",
    venue: "",
    date: "",
    time: "",
    mode: "offline",
    audience: "",
    overview: "",
    description: "",
    organizer: "",
    tags: "",
    slug: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Check if user is admin
  const isAdmin = currentUser?.email === "admin@gmail.com";

  // --- Data Fetching ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if user is admin
    if (isAdmin) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchEvents]);

  // --- Access Control (after hooks) ---
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white pt-20">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-gray-400 mb-6">
          You need to be logged in to access the admin dashboard.
        </p>
        <Link
          to="/signin"
          className="bg-linear-to-r from-[#5dfeca] to-[#4adbc0] text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white pt-20">
        <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
        <p className="text-gray-400 mb-6">
          You do not have permission to access the admin dashboard.
        </p>
        <Link
          to="/home"
          className="bg-linear-to-r from-[#5dfeca] to-[#4adbc0] text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  // --- CRUD Actions ---

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    // Optimistic update: Remove from UI immediately
    const previousEvents = [...events];
    setEvents((prev) => prev.filter((event) => event.id !== id));

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
      // Rollback UI change if server request fails
      setEvents(previousEvents);
    }
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      image: event.image || "",
      location: event.location || "",
      venue: event.venue || "",
      date: event.date || "",
      time: event.time || "",
      mode: event.mode || "offline",
      audience: event.audience || "",
      overview: event.overview || "",
      description: event.description || "",
      organizer: event.organizer || "",
      tags: Array.isArray(event.tags)
        ? event.tags.join(", ")
        : event.tags || "",
      slug: event.slug || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.title ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      alert(
        "Please fill in all required fields (Title, Date, Time, Location)."
      );
      return;
    }

    // Prepare data (convert tags string to array)
    const payload = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      slug: formData.slug || generateSlug(formData.title),
      agenda: editingEvent?.agenda || [],
    };

    try {
      if (editingEvent) {
        // Update existing event
        const response = await fetch(`${API_URL}/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingEvent.id }),
        });
        if (!response.ok) throw new Error("Failed to update event");

        const updatedEvent = await response.json();
        setEvents(
          events.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
        );
      } else {
        // Create new event
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create event");

        const newEvent = await response.json();
        setEvents([...events, newEvent]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event. Please try again.");
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="text-center text-white mt-20">Loading events...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-white mt-20">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen text-white relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Management</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-linear-to-r from-[#5dfeca] to-[#4adbc0] text-black px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#5dfeca]/20"
        >
          Add New Event
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-slate-400 text-sm border-b border-gray-800">
                <th className="p-4 font-medium">Events</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Time</th>
                <th className="p-4 font-medium">Booked spot</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-gray-800/30 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={event.image || "https://via.placeholder.com/150"}
                        alt={event.title}
                        className="w-12 h-12 rounded-md object-cover bg-gray-700"
                      />
                      <span className="font-medium text-white">
                        {event.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{event.location}</td>
                  <td className="p-4 text-gray-300">{event.date}</td>
                  <td className="p-4 text-gray-300">{event.time}</td>
                  <td className="p-4 text-gray-300">
                    {event.bookedSpots || 0}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handleOpenEditModal(event)}
                        className="text-[#5dfeca] hover:text-[#4adbc0] text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No events found. Click "Add New Event" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl my-8 mx-4 relative">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#1e293b] p-5 border-b border-gray-700 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-5">
              {/* Title - Full Width */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                  placeholder="Enter event title"
                  required
                />
              </div>

              {/* Image URL - Full Width */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                  placeholder="/images/event1.png or https://..."
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Location & Venue Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    placeholder="San Francisco, CA"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    placeholder="Convention Center"
                  />
                </div>
              </div>

              {/* Mode & Audience Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Mode
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Audience
                  </label>
                  <input
                    type="text"
                    name="audience"
                    value={formData.audience}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    placeholder="Developers, Engineers"
                  />
                </div>
              </div>

              {/* Organizer - Full Width */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleFormChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                  placeholder="Organization name"
                />
              </div>

              {/* Overview */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Overview
                </label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors resize-none"
                  placeholder="Brief overview of the event"
                ></textarea>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors resize-none"
                  placeholder="Detailed description of the event"
                ></textarea>
              </div>

              {/* Tags & Slug Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    placeholder="react, javascript, conference"
                  />
                  <p className="text-gray-500 text-xs">Comma separated</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:ring-1 focus:ring-[#5dfeca] focus:outline-none transition-colors"
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-gray-500 text-xs">
                    Leave empty to auto-generate
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-700 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-linear-to-r from-[#5dfeca] to-[#4adbc0] text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
