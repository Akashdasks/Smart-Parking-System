import { useState } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });

  const navigate = useNavigate();

  const changeHandler = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async e => {
    e.preventDefault();
    try {
      await axios.post('/user/signup', form);
      toast.success('Signup successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-bg-glow"></div>
      <div className="signup-bg-grid"></div>
      <div className="signup-box">
        <div className="signup-logo">
          <div className="signup-logo-icon">🅿</div>
          <div className="signup-logo-text">
            Smart<span>Park</span>
          </div>
        </div>

        <h2>Create Account</h2>
        <p className="signup-subheading">
          Join SmartPark to find parking easily
        </p>

        <form onSubmit={submitHandler}>
          <div className="signup-field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={changeHandler}
              required
            />
          </div>

          <div className="signup-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={changeHandler}
              required
            />
          </div>

          <div className="signup-field">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={changeHandler}
              required
            />
          </div>

          <div className="signup-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={changeHandler}
              required
            />
          </div>

          <div className="signup-field">
            <label>I am a</label>
            <select name="role" value={form.role} onChange={changeHandler}>
              <option value="user">User</option>
              <option value="owner">Parking Owner</option>
            </select>
          </div>

          <button type="submit" className="primary-btn">
            Create Account
          </button>
        </form>

        <p>
          Already have an account?{' '}
          <span className="login-link" onClick={() => navigate('/login')}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
