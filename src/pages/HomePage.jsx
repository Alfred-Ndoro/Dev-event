import ExploreButton from "@/components/ExploreButton";
import EventList from "@/components/EventList";

const HomePage = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br />
        Event You Can`t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreButton />

      {/* event list components */}
      <EventList />
    </section>
  );
};

export default HomePage;
