import Review from '../models/Review.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// Helper to update property rating aggregates
const updatePropertyRatingStats = async (propertyId) => {
  const reviews = await Review.find({ property: propertyId });
  const count = reviews.length;
  
  let average = 0;
  if (count > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    average = Number((sum / count).toFixed(1));
  }

  await Property.findByIdAndUpdate(propertyId, {
    'ratings.average': average,
    'ratings.count': count,
  });
};

// @desc    Add review to property
// @route   POST /api/reviews
// @access  Private (Guest/Admin)
export const addReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Optional Check: User should have a completed booking for this property
    const userHasBooked = await Booking.findOne({
      property: propertyId,
      guest: req.user._id,
      status: 'confirmed',
    });

    if (!userHasBooked) {
      return res.status(403).json({ success: false, message: 'You can only review properties you have booked' });
    }

    const review = await Review.create({
      property: propertyId,
      guest: req.user._id,
      rating: Number(rating),
      comment,
    });

    // Update Property average and count
    await updatePropertyRatingStats(propertyId);

    // Notify host
    await Notification.create({
      user: property.host,
      title: 'New Review Added',
      message: `Guest ${req.user.name} rated your property "${property.title}" ${rating} stars.`,
      type: 'review',
      link: `/properties/${propertyId}`,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('guest', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Host response to a review
// @route   PUT /api/reviews/:id/respond
// @access  Private (Host/Admin)
export const respondToReview = async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id).populate('property');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Authorization: Must be host of property or admin
    if (review.property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this review' });
    }

    review.response = response;
    await review.save();

    // Notify guest
    await Notification.create({
      user: review.guest,
      title: 'Host Replied to Your Review',
      message: `The host left a reply to your feedback on "${review.property.title}".`,
      type: 'review',
      link: `/bookings`,
    });

    res.status(200).json({
      success: true,
      message: 'Response posted successfully!',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
