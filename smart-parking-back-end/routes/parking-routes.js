const express = require('express');
const checkToken = require('../middleware/check-token');
const Parking = require('../db/models/parking-schema');
const router = express.Router();
require('dotenv').config();

router.get('/parking', async (req, res) => {
  try {
    const parkings = await Parking.find().sort({ createdAt: -1 });
    res.status(200).json({ parkings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/parking/my', checkToken, async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id;

    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID missing in token' });
    }

    // Fetch parking places owned by this owner
    const parkings = await Parking.find({ ownerId }).select(
      'parkingName location totalSlots availableSlots pricePerHour'
    );

    res.status(200).json({
      message: 'Owner parking places fetched successfully',
      data: parkings,
    });
  } catch (err) {
    console.error('ERROR fetching owner parking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/parking', checkToken, async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id; // <--- IMPORTANT FIX

    const { parkingName, location, totalSlots, availableSlots, pricePerHour } =
      req.body;

    const newParking = new Parking({
      ownerId,
      parkingName,
      location,
      totalSlots,
      availableSlots,
      pricePerHour,
    });

    const saved = await newParking.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET parking by ID
router.get('/parking/:id', checkToken, async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ message: 'Parking not found' });
    }

    res.status(200).json({
      message: 'Parking fetched successfully',
      data: parking, // ✅ CONSISTENT
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/parking/update/:id', checkToken, async (req, res) => {
  try {
    const updated = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All Parking

router.get('/parking/all', async (req, res) => {
  try {
    const allParkings = await Parking.find();

    res.status(200).json(allParkings);
  } catch (error) {
    console.error('Error fetching parkings:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Nearby parking

router.get('/parking/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Lat & Lng required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const parkings = await Parking.find();

    const R = 6371; // Earth radius in KM

    const nearbyParkings = parkings
      .map(p => {
        const dLat = ((p.location.lat - userLat) * Math.PI) / 180;
        const dLng = ((p.location.lng - userLng) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((p.location.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { ...p._doc, distance };
      })
      .filter(p => p.distance <= 5); // 5 KM radius

    res.status(200).json({ parkings: nearbyParkings });
  } catch (err) {
    console.error('NEARBY PARKING ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE AVAILABLE SLOTS (OWNER ONLY)
router.put('/parking/:id/slots', checkToken, async (req, res) => {
  try {
    const { availableSlots } = req.body;
    const ownerId = req.user._id || req.user.id;

    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ message: 'Parking not found' });
    }

    // Ensure only owner can update
    if (parking.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (availableSlots < 0 || availableSlots > parking.totalSlots) {
      return res.status(400).json({ message: 'Invalid slot value' });
    }

    parking.availableSlots = availableSlots;
    await parking.save();

    res.status(200).json({
      message: 'Slots updated successfully',
      data: parking,
    });
  } catch (err) {
    console.error('SLOT UPDATE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
