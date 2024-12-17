import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../components/Login';
import Register from '../components/Register';
import CreateEvent from '../pages/CreateEvent';
import EventDetails from '../pages/EventDetails';
import Profile from '../pages/Profile';
import PrivateRoute from '../components/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
      <Route path="/event/:id" element={
        <PrivateRoute>
          <EventDetails />
        </PrivateRoute>
      } />
      <Route path="/create-event" element={
        <PrivateRoute>
          <CreateEvent />
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;