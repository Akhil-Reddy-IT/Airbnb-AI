import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a review comment'],
    },
    response: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per property (optional: we can keep it open or restrict it)
// reviewSchema.index({ property: 1, guest: 1 }, { unique: true });
reviewSchema.index({ property: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
