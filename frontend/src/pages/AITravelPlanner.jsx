import React, { useState } from 'react';
import api from '../utils/api.js';
import { Link } from 'react-router-dom';
import { FaRobot, FaMagic, FaCalendarAlt, FaMapMarkedAlt, FaDollarSign, FaLightbulb } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AITravelPlanner = () => {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('3');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  // Recommended Stays States
  const [matchingStays, setMatchingStays] = useState([]);
  const [loadingStays, setLoadingStays] = useState(false);

  const fetchMatchingStays = async (cityName) => {
    setLoadingStays(true);
    try {
      const res = await api.get(`/properties?city=${encodeURIComponent(cityName)}`);
      if (res.data.success) {
        // Limit to top 4 recommendations
        setMatchingStays(res.data.properties.slice(0, 4));
      }
    } catch (err) {
      console.error('Error loading properties for planner:', err.message);
    } finally {
      setLoadingStays(false);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setError('');
    setPlan(null);
    setMatchingStays([]);

    if (!destination.trim() || !budget || !days) {
      setError('Please fill in Destination, Budget, and Days count.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/travel-plan', {
        destination,
        budget: Number(budget),
        days: Number(days),
      });

      if (res.data.success) {
        setPlan(res.data.itinerary);
        
        // Extract city (first token before comma) and fetch matching stays
        const cityName = destination.split(',')[0].trim();
        fetchMatchingStays(cityName);
      }
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8 text-left select-none">
      {/* Title */}
      <section className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wider uppercase font-mono">
          <FaMagic /> Gemini Planner
        </span>
        <h1 className="text-3xl font-extrabold text-text-main">
          AI Travel Planner
        </h1>
        <p className="text-xs md:text-sm text-text-muted max-w-md mx-auto">
          Input your next destination and budget, and let Gemini compile a custom day-by-day travel itinerary along with matching local property rentals.
        </p>
      </section>

      {/* Grid splits inputs Form vs results Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Inputs Form */}
        <div className="lg:col-span-1 border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1">
            <FaRobot /> Trip Parameters
          </h3>
          {error && <p className="text-xs text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10">{error}</p>}

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            {/* Destination */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Destination</label>
              <input
                type="text"
                required
                placeholder="e.g. Goa, Manali, Shimla"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="glass-input text-xs"
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Budget (INR / ₹)</label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-3 text-text-muted text-xs" />
                <input
                  type="number"
                  required
                  min={100}
                  placeholder="15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="glass-input text-xs pl-8.5 w-full"
                />
              </div>
            </div>

            {/* Days */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Number of Days</label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="glass-input text-xs bg-transparent cursor-pointer"
              >
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white text-xs font-bold w-full py-2.5 rounded-xl hover:bg-primary/95 flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all disabled:opacity-50"
            >
              <FaMagic />
              {loading ? 'Compiling Itinerary...' : 'Generate Itinerary'}
            </button>
          </form>
        </div>

        {/* Right Results Display */}
        <div className="lg:col-span-2">
          {/* Loading Shimmer */}
          {loading && (
            <div className="border border-border-main p-6 rounded-2xl bg-bg-card glass-effect space-y-4 animate-pulse">
              <div className="h-6 bg-border-main rounded w-1/3"></div>
              <div className="h-10 bg-border-main rounded w-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-border-main rounded w-full"></div>
                <div className="h-4 bg-border-main rounded w-full"></div>
                <div className="h-4 bg-border-main rounded w-3/4"></div>
              </div>
            </div>
          )}

          {/* Results display */}
          <AnimatePresence>
            {plan && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header overview Card */}
                <div className="border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card">
                  <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                    <FaMapMarkedAlt className="text-primary" /> {plan.destination} Itinerary
                  </h2>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed bg-bg-main/50 p-2.5 rounded-lg border border-border-main/50">
                    <span className="font-bold text-text-main">Estimated Expenses:</span> {plan.totalEstimatedExpense}
                  </p>
                </div>

                {/* Recommended Stays Section */}
                <div className="border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    🏨 Recommended Stays in {destination.split(',')[0]}
                  </h3>
                  
                  {loadingStays ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                      <div className="h-20 bg-border-main rounded-lg"></div>
                      <div className="h-20 bg-border-main rounded-lg"></div>
                    </div>
                  ) : matchingStays.length === 0 ? (
                    <p className="text-xs text-text-muted italic bg-bg-main/30 p-4 rounded-xl">
                      No registered listings found in {destination.split(',')[0]} right now. Expand your search or check other cities!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {matchingStays.map((p) => (
                        <Link
                          key={p._id}
                          to={`/properties/${p._id}`}
                          className="border border-border-main/50 p-2 rounded-xl bg-bg-main/10 hover:bg-primary/5 hover:border-primary/30 flex gap-3 hover:scale-101 transition-all cursor-pointer"
                        >
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'}
                            alt={p.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="text-left flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-bold text-text-main truncate">{p.title}</h4>
                              <p className="text-[9px] text-text-muted truncate mt-0.5">{p.propertyType} • {p.location.city}</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[11px] font-bold text-primary">₹{p.price}/night</span>
                              <span className="text-[9px] text-text-muted hover:text-primary underline">View Details</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day-by-Day schedule list */}
                <div className="space-y-4">
                  {plan.itinerary?.map((dayObj) => (
                    <div
                      key={dayObj.day}
                      className="border border-border-main p-4 rounded-xl bg-bg-card glass-effect glow-card flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                        D{dayObj.day}
                      </div>
                      <div className="space-y-2 text-left">
                        <h4 className="text-xs font-bold text-text-main flex items-center gap-2">
                          Day {dayObj.day} Schedule
                        </h4>
                        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                          {dayObj.schedule}
                        </p>
                        
                        {/* Attractions list */}
                        {dayObj.places && dayObj.places.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {dayObj.places.map((place, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full font-medium"
                              >
                                {place}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] font-mono text-accent font-semibold">{dayObj.expense}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Travel Tips Card */}
                {plan.tips && plan.tips.length > 0 && (
                  <div className="border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                      <FaLightbulb className="text-yellow-400" /> AI Travel Guidelines & Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-text-main leading-relaxed">
                      {plan.tips.map((tip, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!plan && !loading && (
            <div className="border border-border-main p-12 rounded-2xl bg-bg-card glass-effect text-center text-text-muted italic">
              Itinerary schedule will populate here once you submit travel parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITravelPlanner;
