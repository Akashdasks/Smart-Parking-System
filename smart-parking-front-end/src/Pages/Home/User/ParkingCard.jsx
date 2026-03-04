import './ParkingCard.css';

const ParkingCard = ({ parking, onClick }) => {
  return (
    <div
      className={`parking-card ${parking.isAI ? 'ai-card' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="parking-card-header">
        <h3 className="parking-name">{parking.parkingName}</h3>
        {parking.isAI && <span className="ai-badge">AI Recommended</span>}
      </div>

      {/* Body */}
      <p className="parking-address">{parking.location.address}</p>
      <p className="parking-price">₹{parking.pricePerHour} / hour</p>
      <p className="parking-slots">
        Slots: {parking.availableSlots} / {parking.totalSlots}
      </p>
    </div>
  );
};

export default ParkingCard;
