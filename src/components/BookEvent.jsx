import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { useAuth } from "@/lib/auth-context";

const BookEvent = ({ event }) => {
  const { currentUser } = useAuth();
  const form = useRef();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-fill email if user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Save Booking to Database (if user is logged in)
    if (currentUser) {
      const newBooking = {
        userId: currentUser.id,
        eventSlug: event.slug,
        eventTitle: event.title,
        eventImage: event.image,
        date: event.date,
        time: event.time,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await fetch("http://localhost:3000/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBooking),
        });

        if (!response.ok) {
          console.error("Failed to save booking to database");
        }
      } catch (error) {
        console.error("Error saving booking:", error);
      }
    } else {
      console.warn(
        "User not logged in - booking will not appear in Manage Page"
      );
    }

    // Send Email
    const SERVICE_ID = "service_eqs914o";
    const TEMPLATE_ID = "template_fpfg7tl";
    const PUBLIC_KEY = "v8pA_DkmPyxjPG5T0";

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
        publicKey: PUBLIC_KEY,
      })
      .then(
        () => {
          console.log("SUCCESS!");
          setSubmitted(true);
          setLoading(false);
        },
        (error) => {
          console.log("FAILED...", error.text);
          setLoading(false);
          alert("Failed to send email. Please try again.");
        }
      );
  };

  return (
    <div id="book-event">
      {submitted ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-green-400">Thank you for signing up!</p>
          <p className="text-xs text-gray-400">
            Check "My Bookings" to manage this event.
          </p>
        </div>
      ) : (
        <form ref={form} onSubmit={handleSubmit}>
          {/* Hidden inputs for EmailJS */}
          <input type="hidden" name="event_name" value={event.title} />
          <input type="hidden" name="message" value={event.description} />
          <input
            type="hidden"
            name="subject"
            value={`Booking for ${event.title}`}
          />

          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="user_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="button-submit">
            {loading ? "Processing..." : "Book Now"}
          </button>

          {!currentUser && (
            <p className="text-xs text-yellow-500 mt-2">
              Note: You are not logged in. This booking won't appear in your
              dashboard.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default BookEvent;
