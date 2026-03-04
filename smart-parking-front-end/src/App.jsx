import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import OwnerHome from './Pages/Home/owner/owner';
import Navbar from './components/Navbar/Navbar';
import Addparking from './Pages/Addparking/Addparking';
import UserHome from './Pages/Home/User/Userhome';
import ParkingDetails from './Pages/Parking/ParkingDetails';
import ViewProfile from './Pages/Profile/ViewProfile';
import EditProfile from './Pages/Profile/EditProfile';
import RouteMap from './Pages/Routemap/RouteMap';
import MyBookings from './Pages/Mybooking/MyBooking';
import OwnerParkingDetails from './Pages/Home/owner/OwnerParkingDetails';
import './App.css';

const App = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // ✅ Navbar visibility control
  const hideNavbarRoutes = ['/', '/login', '/signup'];
  const showNavbar = token && !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* OWNER ROUTES */}
        <Route
          path="/owner/home"
          element={
            token && role === 'owner' ? <OwnerHome /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/addparking"
          element={
            token && role === 'owner' ? (
              <Addparking />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/editparking/:id"
          element={
            token && role === 'owner' ? (
              <Addparking />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* USER ROUTES */}
        <Route
          path="/user/home"
          element={
            token && role === 'user' ? <UserHome /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/user/parking/:id"
          element={
            token && role === 'user' ? (
              <ParkingDetails />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/user/profile"
          element={token ? <ViewProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="/owner/profile"
          element={token ? <ViewProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="/edit-profile"
          element={token ? <EditProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="/user/bookings"
          element={
            token && role === 'user' ? <MyBookings /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/user/route"
          element={
            token && role === 'user' ? <RouteMap /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/owner/parking/:id"
          element={
            token && role === 'owner' ? (
              <OwnerParkingDetails />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;
