import { useEffect, useState } from "react";
import EventDetailItem from "./EventDetailItem";
import EventAgenda from "./EventAgenda";
import BookEvent from "./BookEvent";

// // utility function to generate a slug from a title
// const createSlug = (title) => {
//   return title
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, "") // Remove all non-word characters (except spaces and hyphens)
//     .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with a single hyphen
//     .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
// };

// tags components
const EventTags = ({ tags }) => (
  <div className="flex flex-row gap-2 flex-wrap">
    {tags.map((tag) => (
      <div className="pill mb-8" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const EventContent = ({ slug }) => {
  // State to hold event details (should be an object for a single event)
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * fetch event by slug
   * the use effect will run with dependency of slug
   */
  useEffect(() => {
    // Reset state for new fetch
    setIsLoading(true);
    setError(null);

    fetch("http://localhost:3000/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events from server.");
        }
        return response.json(); // Parse the data in JSON format
      })
      .then((events) => {
        // filter the events array to find the match
        const foundEvent = events.find((event) => {
          return event.slug === slug;
        });

        if (foundEvent) {
          setEventDetails(foundEvent);
        } else {
          setError(`No event found for slug: ${slug}`);
        }
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setError("An error occurred while fetching the data.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]); // Rerun effect when the 'slug' prop changes

  //   Render logic based on state
  if (isLoading) {
    return <div>Loading event details...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!eventDetails) {
    // Should be covered by the error state above, but good as a fallback
    return <div>Event not found.</div>;
  }

  //  constant for number of bookings
  const bookings = 10;

  return (
    <div className="px-8">
      <div className="header">
        <h1>Event Details</h1>

        <p>{eventDetails.description}</p>
      </div>

      <div className="details">
        {/* left side -event content */}

        <div className="content">
          <img
            src={eventDetails.image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{eventDetails.overview}</p>
          </section>

          <section className="flex-col gap-2">
            <h2>Event Details</h2>

            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calender"
              label={eventDetails.date}
            />
            <EventDetailItem
              icon="/icons/clock.svg"
              alt="clock"
              label={eventDetails.time}
            />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="location"
              label={eventDetails.location}
            />
            <EventDetailItem
              icon="/icons/mode.svg"
              alt="mode"
              label={eventDetails.mode}
            />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={eventDetails.audience}
            />
          </section>
          {/* agenda component */}
          <EventAgenda agendaItems={eventDetails.agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{eventDetails.organizer}</p>
          </section>

          <EventTags tags={eventDetails.tags} />
        </div>

        {/* right side - booking form */}

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>

            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            {/* book event component */}
            <BookEvent />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventContent;
