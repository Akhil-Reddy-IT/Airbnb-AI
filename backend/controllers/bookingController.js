import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { sendBookingConfirmationEmail } from '../utils/email.js';

// Helper to check date overlap
const checkAvailabilityConflict = async (propertyId, checkIn, checkOut) => {
  const conflictingBookings = await Booking.find({
    property: propertyId,
    status: { $ne: 'cancelled' },
    $or: [
      {
        checkIn: { $lte: new Date(checkOut) },
        checkOut: { $gte: new Date(checkIn) },
      },
    ],
  });
  return conflictingBookings.length > 0;
};

// @desc    Create booking and simulate payment
// @route   POST /api/bookings
// @access  Private (Guest/Admin)
export const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guestCount, paymentMethod } = req.body;

    const property = await Property.findById(propertyId).populate('host');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (!property.isApproved) {
      return res.status(400).json({ success: false, message: 'This property listing is not active' });
    }

    // Check date availability
    const conflict = await checkAvailabilityConflict(propertyId, checkIn, checkOut);
    if (conflict) {
      return res.status(400).json({ success: false, message: 'Dates are already booked. Please choose different dates.' });
    }

    // Calculate total price
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end.getTime() - start.getTime();
    const nightsCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (nightsCount <= 0) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const totalPrice = nightsCount * property.price;

    // 1. Create booking in pending status
    const booking = await Booking.create({
      property: propertyId,
      guest: req.user._id,
      checkIn: start,
      checkOut: end,
      totalPrice,
      guestCount: Number(guestCount || 1),
      status: 'pending',
      paymentStatus: 'pending',
    });

    // 2. Payment Simulation
    const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    // Simulate successful payment
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: totalPrice,
      transactionId,
      status: 'success',
      paymentMethod: paymentMethod || 'Mock Credit Card',
    });

    // 3. Confirm booking
    booking.status = 'confirmed';
    booking.paymentStatus = 'completed';
    await booking.save();

    // 4. Create in-app notifications
    // Notify Guest
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your stay at "${property.title}" from ${start.toLocaleDateString()} to ${end.toLocaleDateString()} is confirmed.`,
      type: 'booking',
      link: `/bookings`,
    });

    // Notify Host
    await Notification.create({
      user: property.host._id,
      title: 'New Booking Received',
      message: `${req.user.name} booked "${property.title}" for ${nightsCount} nights. Total: ₹${totalPrice}`,
      type: 'booking',
      link: `/host-dashboard`,
    });

    // 5. Send confirmation email
    try {
      await sendBookingConfirmationEmail(req.user.email, req.user.name, {
        propertyTitle: property.title,
        location: `${property.location.city}, ${property.location.country}`,
        checkIn: start,
        checkOut: end,
        guestCount,
        totalPrice,
      });
    } catch (err) {
      console.error('Email confirmation sending failed:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking placed and paid successfully!',
      booking,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings of the current logged-in guest
// @route   GET /api/bookings/my-bookings
// @access  Private (Guest/Admin)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate({
        path: 'property',
        populate: { path: 'host', select: 'name email avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get host booking requests for properties owned by host
// @route   GET /api/bookings/host-requests
// @access  Private (Host/Admin)
export const getHostBookings = async (req, res) => {
  try {
    // Find all properties owned by host
    const properties = await Property.find({ host: req.user._id });
    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property')
      .populate('guest', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check: Must be the guest who booked or the host of the property or admin
    const isGuest = booking.guest.toString() === req.user._id.toString();
    const isHost = booking.property.host.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Create notifications
    if (isGuest) {
      // Notify host
      await Notification.create({
        user: booking.property.host,
        title: 'Booking Cancelled by Guest',
        message: `${req.user.name} cancelled their stay at "${booking.property.title}".`,
        type: 'booking',
        link: `/host-dashboard`,
      });
    } else {
      // Notify guest
      await Notification.create({
        user: booking.guest,
        title: 'Booking Cancelled by Host',
        message: `Your booking at "${booking.property.title}" was cancelled by the host. A refund has been issued.`,
        type: 'booking',
        link: `/bookings`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully! Refund simulated.',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
