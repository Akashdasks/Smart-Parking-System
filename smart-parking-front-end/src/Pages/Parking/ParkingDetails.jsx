import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import './ParkingDetails.css';

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [slotNumber, setSlotNumber] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  // QR modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentTimer, setPaymentTimer] = useState(300);
  const [currentBookingId, setCurrentBookingId] = useState('');

  // Fetch parking
  useEffect(() => {
    const fetchParking = async () => {
      try {
        const res = await axios.get(`/parking/${id}`);
        setParking(res.data.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load parking');
      }
    };
    fetchParking();
  }, [id]);

  // QR countdown
  useEffect(() => {
    if (!qrModalOpen) return;
    if (paymentTimer <= 0) {
      alert('Payment time expired!');
      setQrModalOpen(false);
      setPaymentTimer(300);
      return;
    }
    const timer = setTimeout(() => setPaymentTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [qrModalOpen, paymentTimer]);

  // Booking handler
  const handleBooking = async () => {
    if (!startTime || !endTime) {
      alert('Please select start and end time');
      return;
    }

    const slot = Number(slotNumber);
    if (!slot || slot < 1 || slot > parking.totalSlots) {
      alert('Invalid slot number');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      alert('End time must be after start time');
      return;
    }

    try {
      setLoading(true);

      const startISO = new Date(startTime).toISOString();
      const endISO = new Date(endTime).toISOString();

      const res = await axios.post('/booking', {
        parkingId: id,
        slotNumber: slot,
        startTime: startISO,
        endTime: endISO,
      });

      const bookingId = res.data.booking._id;
      const totalAmount = Number(res.data.amount);

      setCurrentBookingId(bookingId);
      setAmount(totalAmount);

      // Generate QR
      const qrRes = await axios.post('/generate-owner-qr', {
        parkingId: id,
        amount: totalAmount,
      });

      setQrCode(qrRes.data.qrCode);
      setQrModalOpen(true);
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQR = () => {
    setQrModalOpen(false);
    setPaymentTimer(300);
  };

  const handlePaymentDone = async () => {
    try {
      await axios.post('/booking/confirm-payment', {
        bookingId: currentBookingId,
      });
      alert('Payment confirmed!');
      setQrModalOpen(false);
      setPaymentTimer(300);
      navigate('/user/home');
    } catch (err) {
      alert('Payment confirmation failed');
    }
  };

  if (!parking)
    return <p className="loading-text">Loading parking details...</p>;

  return (
    <div className="parking-details-page">
      <div className="parking-card">
        <h2 className="parking-title">{parking.parkingName}</h2>
        <p className="parking-address">{parking.location.address}</p>

        <div className="info-grid">
          <div>
            <span>Price</span>
            <strong>₹{parking.pricePerHour} / hour</strong>
          </div>
          <div>
            <span>Available Slots</span>
            <strong>
              {parking.availableSlots} / {parking.totalSlots}
            </strong>
          </div>
        </div>

        <div className="booking-form">
          <div className="form-group">
            <label>Slot Number</label>
            <input
              type="number"
              min="1"
              max={parking.totalSlots}
              value={slotNumber}
              onChange={e => setSlotNumber(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>

          <button
            className="book-btn"
            onClick={handleBooking}
            disabled={loading || parking.availableSlots === 0}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>

          {parking.availableSlots === 0 && (
            <p className="sold-out">No slots available</p>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <div className="qr-modal">
          <div className="qr-modal-content">
            <h3>Scan QR to Pay</h3>
            <p>Amount: ₹{amount}</p>
            {qrCode ? (
              <img src={qrCode} alt="UPI QR Code" />
            ) : (
              <p>Loading QR...</p>
            )}
            <p>Time remaining: {paymentTimer}s</p>
            <div className="qr-modal-buttons">
              <button onClick={handlePaymentDone} className="confirm-btn">
                I've Paid
              </button>
              <button onClick={handleCancelQR} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingDetails;
