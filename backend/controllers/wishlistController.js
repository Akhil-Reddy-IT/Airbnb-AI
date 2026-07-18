import Wishlist from '../models/Wishlist.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'properties',
      populate: { path: 'host', select: 'name avatar' }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, properties: [] });
    }

    res.status(200).json({
      success: true,
      properties: wishlist.properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle property in user's wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, properties: [] });
    }

    const index = wishlist.properties.indexOf(propertyId);
    let added = false;

    if (index === -1) {
      wishlist.properties.push(propertyId);
      added = true;
    } else {
      wishlist.properties.splice(index, 1);
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: added ? 'Added to wishlist' : 'Removed from wishlist',
      isWishlisted: added,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
