import { useEvents } from "@/hooks/useEvents";
import EventCard from "./EventCard";

const EventList = () => {
  const { data: events, loading, error } = useEvents();

  if (loading) {
    return (
      <div className="flex-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-10">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 underline hover:text-red-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section id="allEvents" className="px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </section>
  );
};

export default EventList;
