import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import './RouteMap.css';

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [35, 35],
});

const parkingIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [35, 35],
});

// Routing component
const RoutingControl = ({ userLoc, parkingLoc }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLoc || !parkingLoc) return;

    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLoc.lat, userLoc.lng),
        L.latLng(parkingLoc.lat, parkingLoc.lng),
      ],
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 6, opacity: 0.7 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => map.removeControl(control);
  }, [userLoc, parkingLoc, map]);

  return null;
};

const RouteMap = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const parkingLoc = state?.parkingLocation;

  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    if (!parkingLoc) navigate('/user/bookings');

    navigator.geolocation.getCurrentPosition(
      pos =>
        setUserLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => alert('Location access required')
    );
  }, [parkingLoc, navigate]);

  if (!userLoc)
    return (
      <div className="route-loading">
        <p>Fetching location...</p>
      </div>
    );

  return (
    <div className="route-page">
      {/* Map Section */}
      <div className="route-map-wrapper">
        <MapContainer
          center={[parkingLoc.lat, parkingLoc.lng]}
          zoom={14}
          className="route-map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Marker */}
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Parking Marker */}
          <Marker
            position={[parkingLoc.lat, parkingLoc.lng]}
            icon={parkingIcon}
          >
            <Popup>Parking Location</Popup>
          </Marker>

          <RoutingControl userLoc={userLoc} parkingLoc={parkingLoc} />
        </MapContainer>

        {/* Optional floating info on map */}
        <div className="map-info-panel">
          <h3>Route Info</h3>
          <p>
            <strong>Your Location:</strong> {userLoc.lat.toFixed(4)},{' '}
            {userLoc.lng.toFixed(4)}
          </p>
          <p>
            <strong>Parking:</strong> {parkingLoc.lat.toFixed(4)},{' '}
            {parkingLoc.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
