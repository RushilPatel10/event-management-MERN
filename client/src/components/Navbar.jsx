import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Event Manager</span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <Link 
                  to="/create-event"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Create Event
                </Link>
                <Link 
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 