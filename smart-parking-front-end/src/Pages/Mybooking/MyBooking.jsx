import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import './MyBooking.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('/booking/my');
        setBookings(res.data.bookings);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const openCancelModal = bookingId => {
    setSelectedBookingId(bookingId);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    try {
      await axios.patch(`/booking/cancel/${selectedBookingId}`);

      setBookings(prev =>
        prev.map(b =>
          b._id === selectedBookingId ? { ...b, status: 'cancelled' } : b
        )
      );

      setShowModal(false);
      setSelectedBookingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <p className="loading">Loading bookings...</p>;
  if (bookings.length === 0) return <p className="empty">No bookings found</p>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>

      {bookings.map(b => (
        <div key={b._id} className="booking-card">
          <h3>{b.parkingId.parkingName}</h3>
          <p className="address">{b.parkingId.location.address}</p>

          <p>
            <strong>Slot:</strong> {b.slotNumber}
          </p>
          <p>
            <strong>From:</strong> {new Date(b.startTime).toLocaleString()}
          </p>
          <p>
            <strong>To:</strong> {new Date(b.endTime).toLocaleString()}
          </p>
          <p>
            <strong>Price:</strong> ₹{b.price}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            <span className={`status ${b.status}`}>
              {b.status.toUpperCase()}
            </span>
          </p>

          <div className="actions">
            {b.status === 'active' && (
              <>
                <button
                  className="route-btn"
                  onClick={() =>
                    navigate('/user/route', {
                      state: { parkingLocation: b.parkingId.location },
                    })
                  }
                >
                  Show Route
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => openCancelModal(b._id)}
                >
                  Cancel Booking
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Cancel Booking</h3>
            <p>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                No
              </button>
              <button className="btn-danger" onClick={confirmCancel}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
