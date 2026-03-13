import { useEffect, useState } from "react";
import EventDetailItem from "./EventDetailItem";
import EventAgenda from "./EventAgenda";
import BookEvent from "./BookEvent";
import { eventsAPI } from "@/lib/api";

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
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    eventsAPI
      .getBySlug(slug)
      .then((event) => {
        setEventDetails(event);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setError(err.message || "An error occurred while fetching the event.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-10">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!eventDetails) {
    return <div className="text-center py-10">Event not found.</div>;
  }

  const bookings = 10;

  return (
    <div className="px-8">
      <div className="header">
        <h1>Event Details</h1>
        <p>{eventDetails.description}</p>
      </div>

      <div className="details">
        {/* left side - event content */}
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

          <EventAgenda agendaItems={eventDetails.agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{eventDetails.organizer}</p>
          </section>

          <EventTags tags={eventDetails.tags || []} />
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

            <BookEvent event={eventDetails} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventContent;
