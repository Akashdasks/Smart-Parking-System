const express = require('express');
const router = express.Router();

const Parking = require('../db/models/parking-schema');
const aiRecommend = require('../utils/aiParking');

router.get('/recommend', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const parkings = await Parking.find();

    const result = aiRecommend(parseFloat(lat), parseFloat(lng), parkings);

    res.status(200).json(result.slice(0, 3));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI recommendation failed' });
  }
});

module.exports = router;
