import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './UserMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const UserMap = ({ onLocationFound, parkings = [] }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setPosition([coords.lat, coords.lng]);
        onLocationFound && onLocationFound(coords);
      },
      err => {
        console.error(err);
      }
    );
  }, [onLocationFound]);

  if (!position) {
    return <div className="map-loading">Fetching location...</div>;
  }

  return (
    <div className="map-wrapper">
      <MapContainer center={position} zoom={15} className="leaflet-map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* User marker */}
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Parking markers */}
        {parkings.map(p => (
          <Marker key={p._id} position={[p.location.lat, p.location.lng]}>
            <Popup>
              <strong>{p.parkingName}</strong>
              <br />₹{p.pricePerHour}/hr
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UserMap;
