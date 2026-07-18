import Property from '../models/Property.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { uploadToCloudinaryOrLocal } from '../middleware/uploadMiddleware.js';

// @desc    Get all properties (with filtering, search, sorting)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      country,
      propertyType,
      minPrice,
      maxPrice,
      amenities,
      rating,
      sort,
    } = req.query;

    const query = { isApproved: true }; // Only show approved properties to public

    // If query from Host, they might want all of their own properties. We handle that in a separate host endpoint.

    // Search query (MongoDB text search on title, description, city, state, country)
    if (search) {
      query.$text = { $search: search };
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (country) {
      query['location.country'] = new RegExp(country, 'i');
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Amenities filter (must contain all selected amenities)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    // Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    let queryBuilder = Property.find(query).populate('host', 'name email avatar');

    // Sorting options
    if (sort) {
      if (sort === 'priceLowToHigh') {
        queryBuilder = queryBuilder.sort({ price: 1 });
      } else if (sort === 'priceHighToLow') {
        queryBuilder = queryBuilder.sort({ price: -1 });
      } else if (sort === 'highestRated') {
        queryBuilder = queryBuilder.sort({ 'ratings.average': -1 });
      } else if (sort === 'mostPopular') {
        queryBuilder = queryBuilder.sort({ 'ratings.count': -1 });
      }
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 }); // default newest first
    }

    const properties = await queryBuilder;

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get host specific properties
// @route   GET /api/properties/host
// @access  Private (Host/Admin)
export const getHostProperties = async (req, res) => {
  try {
    const properties = await Property.find({ host: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property details
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('host', 'name email avatar');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a property listing
// @route   POST /api/properties
// @access  Private (Host/Admin)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      street,
      city,
      state,
      country,
      zip,
      lat,
      lng,
      amenities,
      propertyType,
    } = req.body;

    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

    // Handle files upload
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinaryOrLocal(file);
        images.push(url);
      }
    }

    const property = await Property.create({
      host: req.user._id,
      title,
      description,
      price: Number(price),
      location: {
        street,
        city,
        state,
        country,
        zip,
        coordinates: {
          lat: Number(lat || 0),
          lng: Number(lng || 0),
        },
      },
      amenities: parsedAmenities || [],
      propertyType,
      images,
      isApproved: false, // Must be approved by Admin
    });

    // Notify admins about new listing
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Property Listing for Approval',
        message: `Host ${req.user.name} created listing "${title}" and requests approval.`,
        type: 'property_approval',
        link: `/admin-dashboard`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Property created and submitted for admin approval!',
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Host/Admin)
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
    }

    const {
      title,
      description,
      price,
      street,
      city,
      state,
      country,
      zip,
      lat,
      lng,
      amenities,
      propertyType,
    } = req.body;

    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

    // Handle files upload if new files provided
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinaryOrLocal(file);
        newImages.push(url);
      }
    }

    const updatedData = {
      title: title || property.title,
      description: description || property.description,
      price: price ? Number(price) : property.price,
      location: {
        street: street || property.location.street,
        city: city || property.location.city,
        state: state || property.location.state,
        country: country || property.location.country,
        zip: zip || property.location.zip,
        coordinates: {
          lat: lat ? Number(lat) : property.location.coordinates.lat,
          lng: lng ? Number(lng) : property.location.coordinates.lng,
        },
      },
      amenities: parsedAmenities || property.amenities,
      propertyType: propertyType || property.propertyType,
    };

    if (newImages.length > 0) {
      updatedData.images = [...property.images, ...newImages];
    }

    // If edited by host, reset approval status
    if (req.user.role !== 'admin') {
      updatedData.isApproved = false;
    }

    property = await Property.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property listing updated successfully!',
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Host/Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
