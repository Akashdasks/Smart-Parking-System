import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [user, setUser] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const onChange = (e, key) => {
    setUser({ ...user, [key]: e.target.value });
  };

  const onBtnClick = async () => {
    if (!user.email || !user.password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post('/user/login', user);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', res.data.userId);

        toast.success('Login successful!');

        if (res.data.role === 'owner') {
          navigate('/owner/home');
        } else {
          navigate('/user/home');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Smart Parking Login</h2>

        <input
          type="text"
          placeholder="Email"
          value={user.email}
          onChange={e => onChange(e, 'email')}
        />

        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={e => onChange(e, 'password')}
        />

        <button className="primary-btn" onClick={onBtnClick}>
          Login
        </button>

        <p>
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>

        <p>
          Forgot Password? <Link to="/forgot-password">Reset</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
