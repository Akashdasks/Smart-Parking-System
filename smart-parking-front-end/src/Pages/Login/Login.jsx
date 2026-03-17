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
      <div className="login-bg-glow"></div>
      <div className="login-bg-grid"></div>
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-icon">🅿</div>
          <div className="login-logo-text">
            Smart<span>Park</span>
          </div>
        </div>
        <h2 className="login-heading">Welcome back</h2>
        <p className="login-subheading">Sign in to manage your parking</p>

        <div className="login-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={user.email}
            onChange={e => onChange(e, 'email')}
          />
        </div>

        <div className="login-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={user.password}
            onChange={e => onChange(e, 'password')}
          />
        </div>

        <button className="primary-btn" onClick={onBtnClick}>
          Sign In
        </button>

        <div className="login-links">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            Forgot password? <Link to="/forgot-password">Reset it</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
