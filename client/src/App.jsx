import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events/:id" element={<EventDetails />} />

                {/* Protected Routes */}
                <Route 
                  path="/create-event" 
                  element={
                    <PrivateRoute>
                      <CreateEvent />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/events/:id/edit" 
                  element={
                    <PrivateRoute>
                      <CreateEvent />
                    </PrivateRoute>
                  } 
                />

                {/* 404 Route */}
                <Route 
                  path="*" 
                  element={
                    <div className="text-center mt-20">
                      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                      <p className="mt-4">The page you're looking for doesn't exist.</p>
                    </div>
                  } 
                />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
