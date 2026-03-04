const { Schema, model } = require('mongoose');

const parkingSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    parkingName: { type: String, required: true },

    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    totalSlots: { type: Number, required: true },

    availableSlots: { type: Number, required: true },

    pricePerHour: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = model('Parking', parkingSchema);
