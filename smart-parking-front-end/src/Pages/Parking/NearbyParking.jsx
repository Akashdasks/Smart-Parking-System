import axios from '../../utils/axios';
import './NearbyParking.css';

const NearbyParkings = ({ coords, onDataLoaded }) => {
  const fetchNearby = async () => {
    try {
      const res = await axios.get(
        `/parking/nearby?lat=${coords.lat}&lng=${coords.lng}`
      );

      onDataLoaded(res.data.parkings);
    } catch (err) {
      console.error('Nearby parking error:', err);
    }
  };

  if (!coords) return null;

  return (
    <div className="nearby-container">
      <button onClick={fetchNearby}>Load Nearby Parkings</button>
    </div>
  );
};

export default NearbyParkings;
