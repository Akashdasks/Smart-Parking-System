const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = v => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const aiRecommend = (userLat, userLng, parkings) => {
  return parkings
    .map(p => {
      const distance = getDistance(
        userLat,
        userLng,
        p.location.lat,
        p.location.lng
      );

      const score = distance * 0.5 + p.price * 0.3 - p.availableSlots * 0.2;

      return {
        ...p._doc,
        aiScore: score,
        distance: distance.toFixed(2),
      };
    })
    .sort((a, b) => a.aiScore - b.aiScore);
};

module.exports = aiRecommend;
