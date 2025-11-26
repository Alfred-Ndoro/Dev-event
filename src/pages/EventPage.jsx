import EventContent from "@/components/EventContent";
import React from "react";
import { useParams } from "react-router-dom";

const EventPage = () => {
  // get the slug as param
  const { slug } = useParams();

  return (
    <section id="event">
      {/* event content component */}
      <EventContent slug={slug} />
    </section>
  );
};

export default EventPage;
