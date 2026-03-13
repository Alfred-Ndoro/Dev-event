import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import BookingCard from "@/components/BookingCard";
import { Link } from "react-router-dom";
import { bookingsAPI } from "@/lib/api";
import { useAPI, useMutation } from "@/hooks/useAPI";

const ManageBookings = () => {
  const { currentUser } = useAuth();

  const {
    data: bookings,
    loading,
    error,
    setData: setBookings,
  } = useAPI(
    () => bookingsAPI.getByUserId(currentUser?.id),
    [currentUser?.id],
    {
      immediate: !!currentUser?.id,
      initialData: [],
    }
  );

  const { mutate: deleteBooking } = useMutation(bookingsAPI.delete);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    // Optimistic update: Remove from UI immediately
    const previousBookings = [...bookings];
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));

    try {
      await deleteBooking(bookingId);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
      // Rollback UI change if server request fails
      setBookings(previousBookings);
    }
  };

  // Not Logged In State
  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        <h2 className="text-2xl font-bold mb-4 text-white">Please Log In</h2>
        <p className="text-gray-400 mb-6">
          You need to be logged in to view your bookings.
        </p>
        <Link
          to="/signin"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-400 animate-pulse">
          Loading your bookings...
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 gap-4">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="underline">
          Try Again
        </button>
      </div>
    );
  }

  // Main Content
  return (
    <section className="container mx-auto px-6 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
          <p className="text-gray-400 mt-1">Manage your upcoming events</p>
        </div>
        <Link
          to="/home"
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          Browse more events &rarr;
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-dark-100 rounded-lg border border-gray-800 dashed-border">
          <p className="text-xl text-gray-400 mb-6">
            You haven't booked any events yet.
          </p>
          <Link
            to="/home"
            className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-6 py-3 rounded-lg hover:bg-indigo-600/30 transition-all"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ManageBookings;
