import { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const ViewProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/user/profile');
        setUser(res.data.user);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!user) return <p className="loading">Profile not found</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My Profile</h2>

        <div className="profile-row">
          <span>Name</span>
          <p>{user.name}</p>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <p>{user.email}</p>
        </div>

        <div className="profile-row">
          <span>Phone</span>
          <p>{user.phone}</p>
        </div>
        <div className="profile-row">
          <span>UPI ID</span>
          <p>{user.upiId}</p>
        </div>

        <div className="profile-row">
          <span>Role</span>
          <p className="role">{user.role}</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate('/edit-profile')}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ViewProfile;
