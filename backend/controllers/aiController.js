import * as gemini from '../utils/gemini.js';
import Property from '../models/Property.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Wishlist from '../models/Wishlist.js';
import User from '../models/User.js';

// @desc    1. AI Property Description Generator
// @route   POST /api/ai/generate-description
// @access  Private (Host/Admin)
export const generateDescription = async (req, res) => {
  try {
    const { propertyType, location, amenities } = req.body;
    if (!propertyType || !location || !amenities) {
      return res.status(400).json({ success: false, message: 'Property type, location, and amenities are required' });
    }

    const result = await gemini.generatePropertyDetails(propertyType, location, amenities);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    2. AI Smart Search query processing
// @route   POST /api/ai/smart-search
// @access  Public
export const processSmartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required' });
    }

    const filters = await gemini.parseSmartSearch(query);

    // Save query to user search history if logged in
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        // Keep max 10 queries
        user.searchHistory.unshift(query);
        if (user.searchHistory.length > 10) user.searchHistory.pop();
        await user.save();
      }
    }

    res.status(200).json({ success: true, filters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    3. AI Travel Planner
// @route   POST /api/ai/travel-plan
// @access  Public
export const generateTravelPlan = async (req, res) => {
  try {
    const { destination, budget, days } = req.body;
    if (!destination || !budget || !days) {
      return res.status(400).json({ success: false, message: 'Destination, budget tier, and days are required' });
    }

    const itinerary = await gemini.generateTravelPlan(destination, Number(budget), Number(days));
    res.status(200).json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    4. AI Review Summarizer for a Property
// @route   POST /api/ai/summarize-reviews
// @access  Public
export const summarizePropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    const reviews = await Review.find({ property: propertyId });
    const summary = await gemini.summarizeReviews(reviews);

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    5. AI Personalized Recommendations
// @route   POST /api/ai/recommendations
// @access  Private (Guest/Host/Admin)
export const getRecommendations = async (req, res) => {
  try {
    // 1. Fetch user search history
    const user = await User.findById(req.user._id);
    const searchQueries = user?.searchHistory || [];

    // 2. Fetch user bookings
    const bookings = await Booking.find({ guest: req.user._id }).populate('property');

    // 3. Fetch user wishlist
    let wishlistProps = [];
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('properties');
    if (wishlist) {
      wishlistProps = wishlist.properties;
    }

    // 4. Fetch available properties (only approved ones)
    const availableListings = await Property.find({ isApproved: true }).limit(8);

    if (availableListings.length === 0) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const recommendationsResult = await gemini.getPersonalizedRecommendations(
      bookings,
      wishlistProps,
      searchQueries,
      availableListings
    );

    // Populate property details for final response
    const recommendedProperties = [];
    for (const rec of recommendationsResult.recommendations) {
      const prop = await Property.findById(rec.propertyId).populate('host', 'name avatar');
      if (prop && prop.isApproved) {
        recommendedProperties.push({
          property: prop,
          reason: rec.reason,
        });
      }
    }

    res.status(200).json({ success: true, recommendations: recommendedProperties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    6. AI Chatbot assistant for a specific Property
// @route   POST /api/ai/chatbot
// @access  Public
export const chatWithProperty = async (req, res) => {
  try {
    const { propertyId, message, chatHistory } = req.body;
    if (!propertyId || !message) {
      return res.status(400).json({ success: false, message: 'Property ID and message are required' });
    }

    const property = await Property.findById(propertyId).populate('host');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const result = await gemini.askPropertyChatbot(property, chatHistory || [], message);
    res.status(200).json({ success: true, reply: result.reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
