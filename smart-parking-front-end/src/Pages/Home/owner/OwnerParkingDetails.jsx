import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axios';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './OwnerParkingDetails.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OwnerParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [parking, setParking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchParking();
  }, [id]);

  const fetchParking = async () => {
    try {
      const res = await axios.get(`/parking/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParking(res.data.data);
    } catch {
      toast.error('Failed to load parking');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/parking/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Parking deleted');
      navigate('/owner/home');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (!parking) return null;

  return (
    <div className="owner-parking-page">
      <div className="details-card">
        <h2>{parking.parkingName}</h2>

        <p>
          <b>Address:</b> {parking.location.address}
        </p>
        <p>
          <b>Total Slots:</b> {parking.totalSlots}
        </p>
        <p>
          <b>Available Slots:</b> {parking.availableSlots}
        </p>
        <p>
          <b>Price:</b> ₹{parking.pricePerHour}/hour
        </p>

        {/* ACTION BUTTONS */}
        <div className="action-buttons">
          <button
            className="edit-btn"
            onClick={() => navigate(`/editparking/${id}`)}
          >
            Edit
          </button>

          <button className="delete-btn" onClick={() => setShowModal(true)}>
            Delete
          </button>
        </div>
      </div>

      {/* MAP */}
      <div className="map-wrapper">
        <MapContainer
          center={[parking.location.lat, parking.location.lng]}
          zoom={15}
          className="parking-map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[parking.location.lat, parking.location.lng]}
            icon={markerIcon}
          >
            <Popup>{parking.parkingName}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* DELETE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerParkingDetails;
