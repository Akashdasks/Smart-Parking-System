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
      <div className="signup-box">
        <h2>Create Account</h2>

        <form onSubmit={submitHandler}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={changeHandler}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={changeHandler}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={changeHandler}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={changeHandler}
            required
          />

          <select name="role" value={form.role} onChange={changeHandler}>
            <option value="user">User</option>
            <option value="owner">Parking Owner</option>
          </select>

          <button type="submit" className="primary-btn">
            Create Account
          </button>
        </form>

        <p>
          Already have an account?{' '}
          <span className="login-link" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
