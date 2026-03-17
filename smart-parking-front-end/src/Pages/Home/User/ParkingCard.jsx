import './ParkingCard.css';

const ParkingCard = ({ parking, onClick }) => {
  return (
    <div
      className={`parking-card ${parking.isAI ? 'ai-card' : ''}`}
      onClick={onClick}
    >
      <div className="parking-card-header">
        <h3 className="parking-name">{parking.parkingName}</h3>
        {parking.isAI && <span className="ai-badge">AI Pick</span>}
      </div>
      <p className="parking-address">{parking.location.address}</p>
      <div className="parking-card-footer">
        <span className="parking-price">₹{parking.pricePerHour}/hr</span>
        <span className="parking-slots">
          {parking.availableSlots}/{parking.totalSlots} slots
        </span>
      </div>
    </div>
  );
};

export default ParkingCard;
