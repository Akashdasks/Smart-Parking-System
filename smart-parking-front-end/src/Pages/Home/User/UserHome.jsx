import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import axios from '../../../utils/axios';
import ParkingCard from './ParkingCard';
import 'leaflet/dist/leaflet.css';
import './UserHome.css';

// Fix default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// User marker icon
const userIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [32, 32],
});

// Auto-fit bounds
const FitBounds = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (!locations || locations.length === 0) return;
    const bounds = L.latLngBounds(locations);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [locations, map]);
  return null;
};

// Distance helper
const getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const UserHome = () => {
  const [parkings, setParkings] = useState([]);
  const [displayParkings, setDisplayParkings] = useState([]);
  const [aiParkings, setAiParkings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  // Fetch parkings
  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const res = await axios.get('/parking');
        const data = res.data.parkings || [];
        setParkings(data);
        setDisplayParkings(data);
      } catch (err) {
        console.error('Error fetching parkings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParkings();
  }, []);

  // Fetch AI recommended parkings
  useEffect(() => {
    const fetchAIParkings = async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await axios.get(
            `/ai/recommend?lat=${latitude}&lng=${longitude}`
          );
          setAiParkings(res.data);
        } catch (err) {
          console.error('AI parking fetch failed', err);
        }
      });
    };
    fetchAIParkings();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery) {
      setDisplayParkings(parkings);
      setFilterType('all');
      return;
    }
    const filtered = parkings.filter(p =>
      p.parkingName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDisplayParkings(filtered);
    setUserLocation(null);
    setFilterType('search');
  }, [searchQuery, parkings]);

  // Get user location
  const getUserLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject();
      navigator.geolocation.getCurrentPosition(
        pos =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        err => reject(err)
      );
    });

  // Nearby filter
  const handleNearbyClick = async () => {
    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
      const nearby = parkings.filter(p => {
        const d = getDistanceInKm(
          loc.lat,
          loc.lng,
          p.location.lat,
          p.location.lng
        );
        return d <= 5;
      });
      setDisplayParkings(nearby);
      setFilterType('nearby');
    } catch {
      alert('Please allow location access');
    }
  };

  // All filter
  const handleAllClick = () => {
    setDisplayParkings(parkings);
    setFilterType('all');
    setUserLocation(null);
  };
  // Show AI for limited time (e.g., 5 seconds)
  useEffect(() => {
    if (aiParkings.length === 0) return;

    setShowAI(true); // show AI

    const timer = setTimeout(() => {
      setShowAI(false); // hide after 5 seconds
    }, 5000);

    return () => clearTimeout(timer);
  }, [aiParkings]);

  if (loading)
    return <p className="loading text-center mt-10">Loading parkings...</p>;

  const mapLocations = [
    ...(userLocation ? [[userLocation.lat, userLocation.lng]] : []),
    ...displayParkings.map(p => [p.location.lat, p.location.lng]),
  ];

  return (
    <div className="user-home">
      <div className="user-home-header">
        <h2 className="user-home-title">
          Find <span>Parking</span>
        </h2>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={handleAllClick}
        >
          All Parkings
        </button>
        <button
          className={`filter-btn ${filterType === 'nearby' ? 'active' : ''}`}
          onClick={handleNearbyClick}
        >
          📍 Nearby
        </button>
      </div>

      <div className="map-container">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>You are here</Popup>
            </Marker>
          )}
          {displayParkings.map(p => (
            <Marker key={p._id} position={[p.location.lat, p.location.lng]}>
              <Popup>
                <strong>{p.parkingName}</strong>
                <br />₹{p.pricePerHour} / hour
                <br />
                <button
                  style={{
                    marginTop: '6px',
                    padding: '4px 10px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                  onClick={() => navigate(`/user/parking/${p._id}`)}
                >
                  View Details
                </button>
              </Popup>
            </Marker>
          ))}
          <FitBounds locations={mapLocations} />
        </MapContainer>
      </div>

      <div className="parking-list">
        {displayParkings.length === 0 ? (
          <p className="no-parkings">No parkings found</p>
        ) : (
          displayParkings.map(p => (
            <ParkingCard
              key={p._id}
              parking={p}
              onClick={() => navigate(`/user/parking/${p._id}`)}
            />
          ))
        )}
      </div>

      {aiParkings.length > 0 && showAI && (
        <div className="ai-section">
          <div className="ai-section-header">
            <div className="ai-section-title">
              🤖 <span>AI</span> Recommended
            </div>
            <span className="close-btn" onClick={() => setShowAI(false)}>
              ✕
            </span>
          </div>
          <div className="ai-list">
            {aiParkings.map(p => (
              <ParkingCard
                key={p._id}
                parking={{ ...p, isAI: true }}
                onClick={() => navigate(`/user/parking/${p._id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
