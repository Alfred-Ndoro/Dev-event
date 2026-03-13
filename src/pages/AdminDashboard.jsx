import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { eventsAPI } from "../lib/api";
import { useAPI, useMutation } from "../hooks/useAPI";

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  // Check if user is admin
  const isAdmin = currentUser?.email === "deveventadmin@gmail.com";

  // Fetch events using useAPI hook
  const {
    data: events,
    loading,
    error,
    setData: setEvents,
    execute: refetchEvents,
  } = useAPI(() => eventsAPI.getAll(), [], {
    immediate: isAdmin,
    initialData: [],
  });

  // Mutations
  const { mutate: createEvent } = useMutation(eventsAPI.create);
  const { mutate: updateEvent } = useMutation((data) =>
    eventsAPI.update(data.slug, data)
  );
  const { mutate: deleteEvent } = useMutation(eventsAPI.delete);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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

  // --- Access Control ---
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
  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    const previousEvents = [...events];
    setEvents((prev) => prev.filter((event) => event.slug !== slug));

    try {
      await deleteEvent(slug);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

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
        const updatedEvent = await updateEvent(payload);
        setEvents((prev) =>
          prev.map((ev) => (ev.slug === editingEvent.slug ? updatedEvent : ev))
        );
      } else {
        const newEvent = await createEvent(payload);
        setEvents((prev) => [...prev, newEvent]);
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
          onClick={refetchEvents}
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
                  key={event.slug}
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
                    {event.booked_spots || 0}
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
                        onClick={() => handleDelete(event.slug)}
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

      {/* Modal - Keep existing modal code */}
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
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                  placeholder="Enter event title"
                  required
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                  placeholder="/images/event1.png or https://..."
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-[#5dfeca] focus:outline-none"
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
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-[#5dfeca] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Location & Venue */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
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
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                    placeholder="Convention Center"
                  />
                </div>
              </div>

              {/* Mode & Audience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Mode
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-[#5dfeca] focus:outline-none"
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
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                    placeholder="Developers, Engineers"
                  />
                </div>
              </div>

              {/* Organizer */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleFormChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                  placeholder="Organization name"
                />
              </div>

              {/* Overview & Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Overview
                </label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none resize-none"
                  placeholder="Brief overview"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none resize-none"
                  placeholder="Detailed description"
                ></textarea>
              </div>

              {/* Tags & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                    placeholder="react, javascript"
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
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#5dfeca] focus:outline-none"
                    placeholder="auto-generated"
                  />
                  <p className="text-gray-500 text-xs">
                    Leave empty to auto-generate
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-300 border border-gray-600 rounded-lg hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-linear-to-r from-[#5dfeca] to-[#4adbc0] text-gray-900 font-semibold rounded-lg hover:opacity-90"
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
