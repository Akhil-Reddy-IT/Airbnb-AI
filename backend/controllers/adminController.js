import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard metrics and stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Aggregate total revenue from completed bookings
    const revenueQuery = await Booking.aggregate([
      { $match: { status: 'confirmed', paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueQuery.length > 0 ? revenueQuery[0].total : 0;

    // Fetch details for activity list
    const latestBookings = await Booking.find()
      .populate('property', 'title price')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const propertiesPendingApproval = await Property.find({ isApproved: false })
      .populate('host', 'name email');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue,
      },
      latestBookings,
      latestUsers,
      propertiesPendingApproval,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject property listing
// @route   PUT /api/admin/properties/:id/approve
// @access  Private (Admin)
export const approveProperty = async (req, res) => {
  try {
    const { approve } = req.body; // boolean
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (approve) {
      property.isApproved = true;
      await property.save();

      // Notify host
      await Notification.create({
        user: property.host,
        title: 'Listing Approved!',
        message: `Your property listing "${property.title}" has been approved by the admin and is now live!`,
        type: 'property_approval',
        link: `/properties/${property._id}`,
      });

      res.status(200).json({
        success: true,
        message: 'Property listing approved successfully!',
        property,
      });
    } else {
      // Reject: delete property or just mark as rejected
      const title = property.title;
      const hostId = property.host;

      await Property.findByIdAndDelete(req.params.id);

      // Notify host
      await Notification.create({
        user: hostId,
        title: 'Listing Rejected',
        message: `Your property listing "${title}" was rejected and removed by the administration.`,
        type: 'property_approval',
      });

      res.status(200).json({
        success: true,
        message: 'Property listing rejected and deleted.',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details/role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role || user.role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully!',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
