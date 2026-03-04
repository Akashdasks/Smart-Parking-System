import { useNavigate } from 'react-router-dom';
import { Slack, Search, LogOut, Home, User, BookOpen } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const role = localStorage.getItem('role'); // 'user' | 'owner'

  const handleSearch = e => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/user/home?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate(role === 'user' ? '/user/profile' : '/owner/profile');
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-left" onClick={() => navigate('/user/home')}>
        <Slack className="logo" size={32} />
        <span className="brand">SmartParking</span>
      </div>

      {/* User Role */}
      {role === 'user' && (
        <>
          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by place..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="navbar-buttons">
            <button onClick={() => navigate('/user/home')} className="nav-btn">
              <Home size={16} /> Home
            </button>

            <button
              onClick={() => navigate('/user/bookings')}
              className="nav-btn"
            >
              <BookOpen size={16} /> Bookings
            </button>

            <button onClick={goToProfile} className="nav-btn">
              <User size={16} /> Profile
            </button>

            <button onClick={handleLogout} className="nav-btn danger">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      )}

      {role === 'owner' && (
        <div className="navbar-buttons">
          <button onClick={() => navigate('/owner/home')} className="nav-btn">
            <Home size={16} /> Dashboard
          </button>

          <button onClick={goToProfile} className="nav-btn">
            <User size={16} /> Profile
          </button>

          <button onClick={handleLogout} className="nav-btn danger">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
