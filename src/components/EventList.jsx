import { events } from "../lib/constant";
import EventCard from "./EventCard";

const EventList = () => {
  return (
    <div className="mt-20 space-y-7 px-6" id="allEvents">
      <h3>Featured Events</h3>

      <ul className="events">
        {events.map((event, index) => (
          <li key={index} className="list-none">
            <EventCard {...event} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
