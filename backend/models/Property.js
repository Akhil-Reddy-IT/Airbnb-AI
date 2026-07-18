import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a property description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price per night'],
    },
    location: {
      street: String,
      city: {
        type: String,
        required: [true, 'Please specify the city'],
      },
      state: String,
      country: {
        type: String,
        required: [true, 'Please specify the country'],
      },
      zip: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
    propertyType: {
      type: String,
      required: [true, 'Please specify the property type'],
      enum: ['Apartment', 'House', 'Villa', 'Cabin', 'Cottage', 'Mansions', 'Treehouse', 'Other'],
    },
    images: {
      type: [String],
      default: [],
    },
    availability: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text',
  'location.country': 'text',
});
propertySchema.index({ price: 1 });
propertySchema.index({ isApproved: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;
