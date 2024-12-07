import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch events');
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp`);
      // Refresh events after RSVP
      fetchEvents();
    } catch (err) {
      console.error('RSVP failed:', err);
    }
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {user ? `Welcome, ${user.user.name}!` : 'Upcoming Events'}
        </h1>
        {user && (
          <button
            onClick={handleCreateEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Event
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onRSVP={handleRSVP}
            isAuthenticated={!!user}
            currentUser={user?.user}
          />
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </div>
  );
};

export default Home; 