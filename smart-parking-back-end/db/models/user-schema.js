const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, select: false },

    phone: { type: String, required: true },

    role: {
      type: String,
      enum: ['user', 'owner'],
      default: 'user',
    },

    // ✅ NEW FIELD FOR OWNER PAYMENT
    upiId: {
      type: String,
      trim: true,
      default: null, // only owners will have this
    },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
