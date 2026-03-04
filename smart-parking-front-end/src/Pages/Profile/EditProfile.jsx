import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import './Profile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    upiId: '',
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/user/profile');
        setProfile({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
          phone: res.data.user.phone || '',
          role: res.data.user.role || '',
          upiId: res.data.user.upiId || '',
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = e => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.patch('/user/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        upiId: profile.upiId,
      });

      toast.success('Profile updated successfully');

      // 🔹 Redirect based on role
      if (profile.role === 'owner') {
        navigate('/owner/profile');
      } else {
        navigate('/user/profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Edit Profile</h2>

        <label>Name</label>
        <input name="name" value={profile.name} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={profile.email} onChange={handleChange} />

        <label>Phone</label>
        <input name="phone" value={profile.phone} onChange={handleChange} />

        {/* ✅ OWNER-ONLY UPI FIELD */}
        {profile.role === 'owner' && (
          <>
            <label>UPI ID</label>
            <input
              name="upiId"
              value={profile.upiId}
              onChange={handleChange}
              placeholder="example@upi"
            />
          </>
        )}

        <button className="primary-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
