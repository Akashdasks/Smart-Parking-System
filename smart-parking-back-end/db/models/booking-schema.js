const { Schema, model } = require('mongoose');

const bookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
      required: true,
    },

    slotNumber: {
      type: Number,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Booking', bookingSchema);
