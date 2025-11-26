import { useEffect, useState } from "react";
import EventCard from "./EventCard";

const EventList = () => {
  // State to hold event details (should be an object for a single event)
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * fetch event by slug
   * the use effect will run once when the component mounts
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
        setAllEvents(events);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setError("An error occurred while fetching the data.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  //   Render logic based on state
  if (isLoading) {
    return <div>Loading event details...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!allEvents) {
    // Should be covered by the error state above, but good as a fallback
    return <div>Event not found.</div>;
  }

  return (
    <div className="mt-20 space-y-7 px-6" id="allEvents">
      <h3>Featured Events</h3>

      <ul className="events">
        {allEvents.map((event) => (
          <li key={event.title} className="list-none">
            <EventCard {...event} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
