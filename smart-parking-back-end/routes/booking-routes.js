const express = require('express');
const router = express.Router();
const Booking = require('../db/models/booking-schema');
const Parking = require('../db/models/parking-schema');
const checkToken = require('../middleware/check-token');
const QRCode = require('qrcode');

/* -----------------------------
   HELPER: Auto-expire bookings
----------------------------- */
const updateExpiredBookings = async userId => {
  const now = new Date();
  const expiredBookings = await Booking.find({
    userId,
    status: 'active',
    endTime: { $lte: now },
  });

  for (const booking of expiredBookings) {
    booking.status = 'completed';
    await booking.save();
    await Parking.findByIdAndUpdate(booking.parkingId, {
      $inc: { availableSlots: 1 },
    });
  }
};

/* -----------------------------
   CREATE BOOKING
----------------------------- */
router.post('/booking', checkToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { parkingId, slotNumber, startTime, endTime } = req.body;

    // Basic validation
    if (!parkingId || !slotNumber || slotNumber < 1 || !startTime || !endTime)
      return res.status(400).json({ message: 'All fields required' });

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start)
      return res.status(400).json({ message: 'Invalid time range' });

    const parking = await Parking.findById(parkingId);
    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    if (slotNumber > parking.totalSlots)
      return res.status(400).json({ message: 'Invalid slot number' });

    if (parking.availableSlots <= 0)
      return res.status(400).json({ message: 'No slots available' });

    // Check for conflicts
    const conflict = await Booking.findOne({
      parkingId,
      slotNumber,
      status: 'active',
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (conflict)
      return res
        .status(400)
        .json({ message: 'Slot already booked for this time' });

    const hours = (end - start) / (1000 * 60 * 60);
    const price = Math.ceil(hours) * parking.pricePerHour;

    const booking = await Booking.create({
      userId,
      ownerId: parking.ownerId,
      parkingId,
      slotNumber,
      startTime: start,
      endTime: end,
      price,
      status: 'active',
    });

    parking.availableSlots -= 1;
    await parking.save();

    res.status(201).json({ booking, amount: price });
  } catch (err) {
    console.error('BOOKING ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -----------------------------
   GET MY BOOKINGS
----------------------------- */
router.get('/booking/my', checkToken, async (req, res) => {
  try {
    const userId = req.user._id;
    await updateExpiredBookings(userId);

    const bookings = await Booking.find({ userId })
      .populate(
        'parkingId',
        'parkingName location totalSlots pricePerHour ownerId'
      )
      .sort({ startTime: -1 });

    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load bookings' });
  }
});

/* -----------------------------
   CANCEL BOOKING
----------------------------- */
router.patch('/booking/cancel/:bookingId', checkToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'active')
      return res
        .status(400)
        .json({ message: 'Only active bookings can be cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    await Parking.findByIdAndUpdate(booking.parkingId, {
      $inc: { availableSlots: 1 },
    });

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cancel failed' });
  }
});

/* -----------------------------
   GENERATE OWNER UPI QR
----------------------------- */
router.post('/generate-owner-qr', checkToken, async (req, res) => {
  try {
    const { parkingId, amount } = req.body;

    const parking = await Parking.findById(parkingId).populate('ownerId');
    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    const owner = parking.ownerId;

    const upiUrl = owner.upiId
      ? `upi://pay?pa=${owner.upiId}&pn=${owner.name}&am=${amount}&cu=INR`
      : `upi://pay?pa=example@upi&pn=Placeholder&am=${amount}&cu=INR`;

    const qrCode = await QRCode.toDataURL(upiUrl);

    res.status(200).json({ qrCode });
  } catch (err) {
    console.error('QR GENERATION ERROR:', err);
    res.status(500).json({ message: 'QR generation failed' });
  }
});

/* -----------------------------
   CONFIRM PAYMENT
----------------------------- */
router.post('/booking/confirm-payment', checkToken, async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Validate input
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Prevent double payment
    if (booking.status === 'paid') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    // Only allow active bookings to be paid
    if (booking.status !== 'active') {
      return res
        .status(400)
        .json({ message: `Cannot pay for a ${booking.status} booking` });
    }

    // Update status
    booking.status = 'paid';
    await booking.save();

    res.status(200).json({ message: 'Payment confirmed successfully' });
  } catch (err) {
    console.error('CONFIRM PAYMENT ERROR:', err);
    res.status(500).json({ message: 'Payment confirmation failed' });
  }
});

module.exports = router;
