import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Save, X } from 'lucide-react';
import axios from '../../../utils/axios';
import './Owner.css';

const OwnerHome = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [slotValue, setSlotValue] = useState(0);

  const navigate = useNavigate();

  const fetchParkings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/parking/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParkings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const startEdit = parking => {
    setEditingId(parking._id);
    setSlotValue(parking.availableSlots);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveSlots = async id => {
    try {
      await axios.put(`/parking/${id}/slots`, { availableSlots: slotValue });
      setParkings(prev =>
        prev.map(p => (p._id === id ? { ...p, availableSlots: slotValue } : p))
      );
      setEditingId(null);
    } catch {
      alert('Failed to update slots');
    }
  };

  if (loading) return <div className="loader">Loading parking places...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="owner-home">
      <div className="owner-header">
        <h2>My Parking Places</h2>
        <Link to="/addparking" className="add-parking-btn">
          <Plus size={20} /> Add Parking
        </Link>
      </div>

      {parkings.length === 0 ? (
        <div className="empty-state">
          <p>No parking places added yet</p>
          <Link to="/addparking">
            <button className="primary-btn">Add Your First Parking</button>
          </Link>
        </div>
      ) : (
        <div className="parking-grid">
          {parkings.map(parking => (
            <div key={parking._id} className="parking-card">
              <h3
                className="parking-title"
                onClick={() => navigate(`/owner/parking/${parking._id}`)}
              >
                {parking.parkingName}
              </h3>

              <p className="address">{parking.location?.address}</p>

              <div className="stats">
                <span>Total: {parking.totalSlots}</span>
                {editingId === parking._id ? (
                  <input
                    type="number"
                    min="0"
                    max={parking.totalSlots}
                    value={slotValue}
                    onChange={e => setSlotValue(Number(e.target.value))}
                  />
                ) : (
                  <span>Available: {parking.availableSlots}</span>
                )}
              </div>

              <p className="price">₹{parking.pricePerHour}/hour</p>

              <div className="card-actions">
                {editingId === parking._id ? (
                  <>
                    <button
                      className="save-btn"
                      onClick={() => saveSlots(parking._id)}
                    >
                      <Save size={16} /> Save
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>
                      <X size={16} /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="edit-btn"
                    onClick={() => startEdit(parking)}
                  >
                    <Edit2 size={16} /> Edit Slots
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerHome;
