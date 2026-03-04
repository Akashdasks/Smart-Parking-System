import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import './Addparking.css';

const Addparking = () => {
  const { id } = useParams(); // edit mode if exists
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [data, setData] = useState({
    parkingName: '',
    address: '',
    lat: '',
    lng: '',
    totalSlots: '',
    availableSlots: '',
    pricePerHour: '',
  });

  useEffect(() => {
    if (id) fetchParking();
  }, [id]);

  const fetchParking = async () => {
    try {
      const res = await axios.get(`/parking/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const parking = res.data.data;

      setData({
        parkingName: parking.parkingName || '',
        address: parking.location?.address || '',
        lat: parking.location?.lat || '',
        lng: parking.location?.lng || '',
        totalSlots: parking.totalSlots || '',
        availableSlots: parking.availableSlots || '',
        pricePerHour: parking.pricePerHour || '',
      });
    } catch (err) {
      toast.error('Failed to load parking info');
    }
  };

  const onChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const body = {
      parkingName: data.parkingName,
      location: {
        address: data.address,
        lat: Number(data.lat),
        lng: Number(data.lng),
      },
      totalSlots: Number(data.totalSlots),
      availableSlots: Number(data.availableSlots),
      pricePerHour: Number(data.pricePerHour),
    };

    try {
      if (id) {
        await axios.patch(`/parking/update/${id}`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Parking updated successfully');
      } else {
        await axios.post('/parking', body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Parking added successfully');
      }

      navigate('/owner/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="addparking-page">
      <div className="addparking-card">
        <h2>{id ? 'Edit Parking' : 'Add New Parking'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Parking Name</label>
            <input
              name="parkingName"
              value={data.parkingName}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              name="address"
              value={data.address}
              onChange={onChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Latitude</label>
              <input
                name="lat"
                type="number"
                value={data.lat}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Longitude</label>
              <input
                name="lng"
                type="number"
                value={data.lng}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Total Slots</label>
              <input
                name="totalSlots"
                type="number"
                value={data.totalSlots}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Available Slots</label>
              <input
                name="availableSlots"
                type="number"
                value={data.availableSlots}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Price / Hour (₹)</label>
              <input
                name="pricePerHour"
                type="number"
                value={data.pricePerHour}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <button className="submit-btn">
            {id ? 'Update Parking' : 'Add Parking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addparking;
