const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      error.detail || `HTTP error! status: ${response.status}`,
      response.status,
      error
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export const authAPI = {
  login: (email, password) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (email, password) =>
    fetchAPI("/auth/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

export const eventsAPI = {
  getAll: () => fetchAPI("/events"),
  getBySlug: (slug) => fetchAPI(`/events/${slug}`),
  create: (data) =>
    fetchAPI("/events", { method: "POST", body: JSON.stringify(data) }),
  update: (slug, data) =>
    fetchAPI(`/events/${slug}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (slug) => fetchAPI(`/events/${slug}`, { method: "DELETE" }),
};

export const bookingsAPI = {
  // Get all bookings for a user
  getByUserId: (userId) => fetchAPI(`/bookings/${userId}`),

  // Get a single booking by ID
  getById: (bookingId) => fetchAPI(`/bookings/detail/${bookingId}`),

  // Create a new booking
  create: (data) =>
    fetchAPI("/bookings", { method: "POST", body: JSON.stringify(data) }),

  // Delete a booking
  delete: (bookingId) =>
    fetchAPI(`/bookings/${bookingId}`, { method: "DELETE" }),

  // Check if user has booked an event
  checkBooking: (userId, eventSlug) =>
    fetchAPI(`/bookings/check/${userId}/${eventSlug}`),
};

export { APIError };
