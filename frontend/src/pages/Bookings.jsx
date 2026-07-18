import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaCalendarCheck, FaRegTimesCircle } from 'react-icons/fa';
import ImageSlider from '../components/common/ImageSlider.jsx';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;

    setCancellingId(id);
    try {
      const res = await api.put(`/bookings/${id}/cancel`);
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
        );
        alert('Reservation cancelled. Refund has been simulated.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4 animate-pulse">
        <div className="h-6 bg-border-main rounded w-1/4"></div>
        <div className="h-28 bg-border-main rounded w-full"></div>
        <div className="h-28 bg-border-main rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 space-y-6 text-left select-none">
      <div className="flex items-center gap-2 border-b border-border-main pb-4">
        <FaRegCalendarAlt className="text-primary w-5 h-5" />
        <h1 className="text-2xl font-bold text-text-main">Your Stays & Trips</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 px-4 bg-bg-card border border-border-main rounded-2xl glass-effect">
          <h3 className="font-bold text-lg text-text-main mb-2">No bookings yet</h3>
          <p className="text-xs text-text-muted max-w-xs mx-auto mb-4">
            You haven't booked any accommodations yet. Explore our properties page to book your next trip!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/95 shadow cursor-pointer transition-colors"
          >
            Explore Listings
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const prop = booking.property;
            if (!prop) return null;

            return (
              <div
                key={booking._id}
                className="border border-border-main rounded-2xl p-4 bg-bg-card glass-effect glow-card grid grid-cols-1 md:grid-cols-4 gap-6 items-center"
              >
                {/* Image */}
                <div className="md:col-span-1 aspect-[4/3] w-full h-full rounded-xl overflow-hidden min-h-24">
                  <ImageSlider images={prop.images} title={prop.title} />
                </div>

                {/* Info */}
                <div className="md:col-span-2 space-y-2">
                  <h3 className="font-bold text-sm text-text-main line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-text-muted">
                    {prop.location?.city}, {prop.location?.country}
                  </p>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-text-main">
                    <div className="flex items-center gap-1">
                      <FaCalendarCheck className="text-accent" />
                      <span>In: {new Date(booking.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRegTimesCircle className="text-primary" />
                      <span>Out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted">
                    Guests: <span className="font-semibold text-text-main">{booking.guestCount} guests</span>
                  </p>

                  <p className="text-xs text-text-muted">
                    Status:{' '}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        booking.status === 'confirmed'
                          ? 'bg-accent/10 text-accent border-accent/20'
                          : booking.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </p>
                </div>

                {/* Price & Action */}
                <div className="md:col-span-1 text-right space-y-3 shrink-0">
                  <div>
                    <p className="text-xs text-text-muted">Total Paid</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{booking.totalPrice.toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-text-muted font-normal">
                        (${Math.round(booking.totalPrice / 83)})
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 justify-end">
                    <button
                      onClick={() => navigate(`/properties/${prop._id}`)}
                      className="bg-bg-main border border-border-main text-text-main text-[11px] font-bold py-1.5 rounded-lg hover:bg-border-main transition-colors cursor-pointer text-center"
                    >
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold py-1.5 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-colors cursor-pointer text-center"
                      >
                        Cancel Stay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
