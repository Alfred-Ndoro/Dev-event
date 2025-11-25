import { Link } from "react-router-dom";

const EventCard = ({ title, image, slug, location, date, time }) => {
  return (
    <>
      <Link to={`/events/${slug}`} id="event-card">
        <img
          src={image}
          alt={title}
          width={140}
          height={140}
          className="poster"
        />

        <div className="flex flex-row gap-2">
          <img
            src="../../public/icons/pin.svg"
            alt="location"
            width={14}
            height={14}
          />
          <p>{location}</p>
        </div>

        <p className="title">{title}</p>

        <div className="datetime">
          <div>
            <img
              src="../../public/icons/calendar.svg"
              alt="calender"
              width={14}
              height={14}
            />
            <p>{date}</p>
          </div>

          <div>
            <img
              src="../../public/icons/clock.svg"
              alt="time"
              width={14}
              height={14}
            />
            <p>{time}</p>
          </div>
        </div>
      </Link>
    </>
  );
};

export default EventCard;
