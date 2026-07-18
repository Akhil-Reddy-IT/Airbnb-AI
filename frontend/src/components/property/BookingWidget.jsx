import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { FaStar, FaMinus, FaPlus, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BookingWidget = ({ property }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate nights and price totals
  let nightsCount = 0;
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end.getTime() - start.getTime();
    nightsCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  const basePrice = nightsCount > 0 ? nightsCount * property.price : 0;
  const serviceFee = nightsCount > 0 ? Math.round(basePrice * 0.08) : 0;
  const totalPrice = basePrice + serviceFee;

  const handleGuestsChange = (type) => {
    if (type === 'inc') {
      setGuestCount((prev) => Math.min(prev + 1, 10));
    } else {
      setGuestCount((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role !== 'guest' && user.role !== 'admin') {
      setErrorMessage('Hosts cannot book property listings.');
      return;
    }

    if (!checkIn || !checkOut) {
      setErrorMessage('Please select check-in and check-out dates.');
      return;
    }

    if (nightsCount <= 0) {
      setErrorMessage('Check-out must be after check-in date.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        propertyId: property._id,
        checkIn,
        checkOut,
        guestCount,
        paymentMethod: 'Simulated MasterCard',
      });

      if (res.data.success) {
        setBookingSuccess(true);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error processing reservation.');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="rounded-2xl border border-accent/20 p-6 bg-accent/5 glass-effect text-center space-y-4 glow-card select-none">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent text-2xl animate-bounce">
          ✓
        </div>
        <h3 className="text-lg font-bold text-text-main">Booking Confirmed!</h3>
        <p className="text-xs text-text-muted">
          Your stay at <strong>{property.title}</strong> has been successfully booked and paid via credit card simulation.
        </p>
        <div className="border-t border-border-main pt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate('/bookings')}
            className="w-full bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-accent/95 cursor-pointer transition-colors"
          >
            View Bookings
          </button>
          <button
            onClick={() => setBookingSuccess(false)}
            className="w-full text-xs text-text-muted hover:underline cursor-pointer"
          >
            Book Another Stay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-main p-6 bg-bg-card glass-effect shadow-lg glow-card space-y-4 text-left">
      {/* Price Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border-main/50">
        <div>
          <span className="text-xl font-bold text-text-main">₹{property.price}</span>
          <span className="text-xs text-text-muted"> / night</span>
        </div>
        {property.ratings?.average > 0 && (
          <div className="flex items-center gap-1 text-xs text-text-main font-semibold">
            <FaStar className="text-yellow-400" />
            <span>{property.ratings.average}</span>
            <span className="text-text-muted">({property.ratings.count})</span>
          </div>
        )}
      </div>

      <form onSubmit={handleBooking} className="space-y-4">
        {/* Date Selectors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Check-In
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="glass-input text-xs w-full cursor-pointer"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Check-Out
            </label>
            <input
              type="date"
              required
              min={checkIn || new Date().toISOString().split('T')[0]}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="glass-input text-xs w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Guest Counter */}
        <div className="flex items-center justify-between p-3 border border-border-main rounded-lg bg-bg-main/20">
          <div className="text-left">
            <h4 className="text-xs font-bold text-text-main">Guests</h4>
            <p className="text-[10px] text-text-muted">Max 10 guests</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleGuestsChange('dec')}
              className="p-1 rounded-full border border-border-main hover:bg-bg-main text-text-main cursor-pointer"
            >
              <FaMinus className="w-2.5 h-2.5" />
            </button>
            <span className="text-xs font-bold text-text-main w-4 text-center">{guestCount}</span>
            <button
              type="button"
              onClick={() => handleGuestsChange('inc')}
              className="p-1 rounded-full border border-border-main hover:bg-bg-main text-text-main cursor-pointer"
            >
              <FaPlus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Pricing Calculations */}
        {nightsCount > 0 && (
          <div className="space-y-2 pt-2 border-t border-border-main/50 text-xs">
            <div className="flex justify-between text-text-muted">
              <span>
                ₹{property.price} x {nightsCount} nights
              </span>
              <span>₹{basePrice}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>AirbnbAI service fee (8%)</span>
              <span>₹{serviceFee}</span>
            </div>
            <div className="flex justify-between text-text-main font-bold border-t border-border-main pt-2">
              <span>Total before taxes</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="text-xs text-red-500 text-center font-medium bg-red-500/5 p-2 rounded-lg border border-red-500/10">
            {errorMessage}
          </p>
        )}

        {/* Reserve Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <FaCreditCard className="w-4 h-4" />
          {loading ? 'Processing Checkout...' : 'Reserve Stay'}
        </button>
      </form>
    </div>
  );
};

export default BookingWidget;
