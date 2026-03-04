// import { useEffect, useState } from 'react';
// import axios from '../../utils/axios';
// import { toast } from 'react-toastify';
// import './EditProfile.css';

// const EditProfile = () => {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState({
//     name: '',
//     phone: '',
//     email: '',
//   });

//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const res = await axios.get('/user/viewprofile', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setProfile(res.data);
//       } catch (err) {
//         toast.error('Failed to load profile');
//       }
//       setLoading(false);
//     };

//     loadProfile();
//   }, []);

//   const handleChange = e => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   const updateProfile = async () => {
//     try {
//       await axios.patch(
//         '/user/update-basic-profile',
//         {
//           name: profile.name,
//           phone: profile.phone,
//           email: profile.email,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast.success('Profile updated!');
//     } catch (err) {
//       toast.error('Update failed');
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="edit-container">
//       <h2>Edit Profile</h2>

//       <label>Name:</label>
//       <input
//         type="text"
//         name="name"
//         value={profile.name}
//         onChange={handleChange}
//       />

//       <label>Phone:</label>
//       <input
//         type="text"
//         name="phone"
//         value={profile.phone}
//         onChange={handleChange}
//       />

//       <label>Email:</label>
//       <input
//         type="email"
//         name="email"
//         value={profile.email}
//         onChange={handleChange}
//       />

//       <button onClick={updateProfile} className="save-btn">
//         Save Changes
//       </button>
//     </div>
//   );
// };

// export default EditProfile;
