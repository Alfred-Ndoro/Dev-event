import { Link } from "react-router-dom";

const BookingCard = ({ booking, onCancel }) => {
  const { id, eventSlug, eventTitle, eventImage, date, time, createdAt } =
    booking;

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-700 rounded-lg bg-dark-100 hover:border-indigo-500/30 transition-colors">
      <Link to={`/events/${eventSlug}`} className="flex flex-col gap-3 group">
        <img
          src={eventImage || "/images/event1.png"} // Fallback image
          alt={eventTitle}
          className="h-[180px] w-full rounded-lg object-cover transition-transform group-hover:scale-105"
        />

        <h3 className="text-[18px] font-semibold line-clamp-1 text-white group-hover:text-indigo-400 transition-colors">
          {eventTitle}
        </h3>
      </Link>

      <div className="text-light-200 flex flex-col gap-2 text-sm mt-1">
        <div className="flex items-center gap-2">
          <img
            src="/icons/calendar.svg"
            alt="calendar"
            width={16}
            height={16}
          />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="/icons/clock.svg" alt="time" width={16} height={16} />
          <span>{time}</span>
        </div>
        {createdAt && (
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800">
            Booked on: {new Date(createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <button
        onClick={() => onCancel(id)}
        className="mt-auto w-full rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
        aria-label={`Cancel booking for ${eventTitle}`}
      >
        Cancel Booking
      </button>
    </div>
  );
};

export default BookingCard;
