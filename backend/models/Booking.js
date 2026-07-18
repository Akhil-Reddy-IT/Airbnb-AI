import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
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
    checkIn: {
      type: Date,
      required: [true, 'Please add a check-in date'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Please add a check-out date'],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    guestCount: {
      type: Number,
      required: [true, 'Please add guest count'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ guest: 1 });
bookingSchema.index({ property: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
