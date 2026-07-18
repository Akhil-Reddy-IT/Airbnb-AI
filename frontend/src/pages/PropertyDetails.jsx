import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DetailPageSkeleton } from '../components/common/LoadingSkeleton.jsx';
import BookingWidget from '../components/property/BookingWidget.jsx';
import ReviewSummaryWidget from '../components/dashboard/ReviewSummaryWidget.jsx';
import AIChatbot from '../components/property/AIChatbot.jsx';
import { FaStar, FaUserCircle, FaMapMarkerAlt, FaRegCalendarAlt } from 'react-icons/fa';

const PropertyDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Host response state
  const [activeResponseReviewId, setActiveResponseReviewId] = useState(null);
  const [hostReplyText, setHostReplyText] = useState('');

  const fetchPropertyData = async () => {
    try {
      const propRes = await api.get(`/properties/${id}`);
      if (propRes.data.success) {
        setProperty(propRes.data.property);
      }

      const revRes = await api.get(`/reviews/property/${id}`);
      if (revRes.data.success) {
        setReviews(revRes.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching property data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!userComment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        propertyId: id,
        rating: userRating,
        comment: userComment,
      });

      if (res.data.success) {
        setReviewSuccess(true);
        setUserComment('');
        // Reload property details to get new averages
        await fetchPropertyData();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'You can only review property listings you have booked.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHostResponseSubmit = async (e, reviewId) => {
    e.preventDefault();
    if (!hostReplyText.trim()) return;

    try {
      const res = await api.put(`/reviews/${reviewId}/respond`, { response: hostReplyText });
      if (res.data.success) {
        setActiveResponseReviewId(null);
        setHostReplyText('');
        await fetchPropertyData();
      }
    } catch (error) {
      console.error('Error submitting host response:', error.message);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-text-main">
        <h2 className="text-xl font-bold">Property Listing Not Found</h2>
        <p className="text-xs text-text-muted mt-2">The property listing might have been removed by the host or admin.</p>
        <Link to="/" className="text-xs text-primary underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  const isOwner = user && property.host && user._id.toString() === property.host._id.toString();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8 text-left">
      {/* Title Header */}
      <section className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-main leading-tight">
          {property.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          {property.ratings?.average > 0 && (
            <div className="flex items-center gap-1 text-text-main">
              <FaStar className="text-yellow-400" />
              <span>{property.ratings.average}</span>
              <span className="text-text-muted">({property.ratings.count} reviews)</span>
            </div>
          )}
          <span className="text-text-muted flex items-center gap-1">
            <FaMapMarkerAlt /> {property.location.street ? `${property.location.street}, ` : ''}
            {property.location.city}, {property.location.country}
          </span>
          <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
            {property.propertyType}
          </span>
        </div>
      </section>

      {/* Image Gallery Layout */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px] overflow-hidden rounded-2xl shadow-md select-none">
        {property.images.length === 0 ? (
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
            alt={property.title}
            className="w-full h-full object-cover col-span-4"
          />
        ) : (
          <>
            <img
              src={property.images[0]}
              alt={`${property.title} main`}
              className="w-full h-full object-cover col-span-2 hover:scale-101 transition-transform cursor-pointer"
            />
            <img
              src={property.images[1] || property.images[0]}
              alt={`${property.title} gallery 1`}
              className="w-full h-full object-cover hidden md:block hover:scale-101 transition-transform cursor-pointer"
            />
            <img
              src={property.images[2] || property.images[0]}
              alt={`${property.title} gallery 2`}
              className="w-full h-full object-cover hidden md:block hover:scale-101 transition-transform cursor-pointer"
            />
          </>
        )}
      </section>

      {/* Splits: Left Description, Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side details */}
        <div className="lg:col-span-2 space-y-8 select-none">
          {/* Host description */}
          <div className="flex items-center justify-between pb-6 border-b border-border-main/50">
            <div>
              <h2 className="text-lg font-bold text-text-main">
                Hosted by {property.host?.name || 'Local Host'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{property.propertyType} stay portal</p>
            </div>
            {property.host?.avatar ? (
              <img
                src={property.host.avatar}
                alt={property.host.name}
                className="w-12 h-12 rounded-full object-cover border border-border-main"
              />
            ) : (
              <FaUserCircle className="w-12 h-12 text-text-muted" />
            )}
          </div>

          {/* Description text */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-text-main uppercase tracking-wider text-text-muted">
              About this property
            </h3>
            <p className="text-xs md:text-sm text-text-main leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities grid */}
          <div className="space-y-3 pt-6 border-t border-border-main/50">
            <h3 className="font-bold text-sm text-text-main uppercase tracking-wider text-text-muted">
              What this place offers
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-text-main">
                  <span className="text-primary">•</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Location Section */}
          <div className="space-y-4 pt-8 border-t border-border-main/50 text-left">
            <h3 className="font-bold text-sm text-text-main uppercase tracking-wider text-text-muted">
              Where you'll be
            </h3>
            <p className="text-xs text-text-main font-semibold flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-primary" />
              {property.location.street ? `${property.location.street}, ` : ''}
              {property.location.city}, {property.location.state ? `${property.location.state}, ` : ''}
              {property.location.country}
            </p>
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-border-main shadow-sm">
              <iframe
                title="Google Map Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  `${property.location.street || ''} ${property.location.city} ${property.location.country}`
                )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
          </div>

          {/* Gemini reviews summarizer */}
          <div className="pt-8 border-t border-border-main/50">
            <ReviewSummaryWidget propertyId={property._id} reviewsCount={reviews.length} />
          </div>

          {/* Guest Reviews Section */}
          <div className="space-y-6 pt-8 border-t border-border-main/50">
            <h3 className="text-lg font-bold text-text-main">
              Guest Feedback ({reviews.length})
            </h3>

            {/* Post review form */}
            {isAuthenticated && !isOwner && (
              <form onSubmit={handleReviewSubmit} className="bg-bg-card border border-border-main p-5 rounded-2xl space-y-4 glow-card">
                <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                  Review Your Stay
                </h4>
                {reviewSuccess && (
                  <p className="text-xs text-accent font-semibold bg-accent/5 p-2 rounded-lg border border-accent/10">
                    Your feedback was recorded successfully!
                  </p>
                )}
                {reviewError && (
                  <p className="text-xs text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    {reviewError}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-muted font-bold">Rating:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`text-lg transition-transform hover:scale-110 cursor-pointer ${
                          star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Describe your stay, comfort, neighborhood, cleanliness, host details..."
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="glass-input text-xs w-full h-20 resize-none font-medium"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/95 shadow transition-colors cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* List Reviews */}
            {reviews.length === 0 ? (
              <p className="text-xs text-text-muted italic">No guest reviews listed for this property yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 border border-border-main bg-bg-card/30 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {r.guest?.avatar ? (
                          <img
                            src={r.guest.avatar}
                            alt="guest avatar"
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="w-7 h-7 text-text-muted" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-text-main">
                            {r.guest?.name || 'Anonymous Guest'}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-text-main">
                        <FaStar className="text-yellow-400" />
                        <span>{r.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-main leading-relaxed pl-1">{r.comment}</p>

                    {/* Host response display */}
                    {r.response && (
                      <div className="ml-6 mt-2 bg-primary/5 border-l-2 border-primary p-2.5 rounded-r-lg">
                        <p className="text-[10px] text-primary font-bold">Host Response:</p>
                        <p className="text-[11px] text-text-main mt-0.5 leading-relaxed">{r.response}</p>
                      </div>
                    )}

                    {/* Host response edit button */}
                    {isOwner && !r.response && (
                      <div className="pl-1 pt-1">
                        {activeResponseReviewId === r._id ? (
                          <form
                            onSubmit={(e) => handleHostResponseSubmit(e, r._id)}
                            className="space-y-2 mt-2"
                          >
                            <input
                              type="text"
                              placeholder="Write a response reply to this guest..."
                              value={hostReplyText}
                              onChange={(e) => setHostReplyText(e.target.value)}
                              className="glass-input text-xs w-full"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded hover:bg-primary/95 cursor-pointer"
                              >
                                Post Reply
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveResponseReviewId(null)}
                                className="text-[10px] font-semibold text-text-muted hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveResponseReviewId(r._id);
                              setHostReplyText('');
                            }}
                            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            Reply to review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side Booking widget */}
        <aside className="lg:col-span-1 lg:sticky lg:top-28">
          <BookingWidget property={property} />
        </aside>
      </div>

      {/* Floating property-specific chatbot */}
      <AIChatbot property={property} />
    </div>
  );
};

export default PropertyDetails;
