import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { useAuth } from "@/lib/auth-context";
import { bookingsAPI } from "@/lib/api";
import { useMutation } from "@/hooks/useAPI";

const BookEvent = ({ event }) => {
  const { currentUser } = useAuth();
  const form = useRef();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  const {
    mutate: createBooking,
    loading,
    error,
  } = useMutation(bookingsAPI.create);

  // Auto-fill email if user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Check if user already booked this event
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (currentUser?.id && event?.slug) {
        try {
          const result = await bookingsAPI.checkBooking(
            currentUser.id,
            event.slug
          );
          setAlreadyBooked(result.booked);
        } catch (err) {
          console.error("Error checking booking:", err);
        }
      }
    };
    checkExistingBooking();
  }, [currentUser, event?.slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save Booking to Database (if user is logged in)
    if (currentUser) {
      const newBooking = {
        userId: currentUser.id,
        eventSlug: event.slug,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        userName: name,
        userEmail: email,
      };

      try {
        await createBooking(newBooking);
      } catch (err) {
        console.error("Error saving booking:", err);
        alert(err.message || "Failed to save booking");
        return;
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
        },
        (error) => {
          console.log("FAILED...", error.text);
          alert("Failed to send email. Please try again.");
        }
      );
  };

  if (alreadyBooked) {
    return (
      <div id="book-event">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-blue-400">
            You have already booked this event!
          </p>
          <p className="text-xs text-gray-400">
            Check "My Bookings" to manage this event.
          </p>
        </div>
      </div>
    );
  }

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

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

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
