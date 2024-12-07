import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import EventCard from '../components/EventCard';

const Profile = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const [createdEvents, attending] = await Promise.all([
        api.get('/events/created'),
        api.get('/events/attending')
      ]);
      setMyEvents(createdEvents.data);
      setRegisteredEvents(attending.data);
      setLoading(false);
    } catch (error) {
      showNotification('Failed to fetch events', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">My Created Events</h2>
        {myEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                isAuthenticated={true}
                currentUser={user?.user}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any events yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Events I'm Attending</h2>
        {registeredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                isAuthenticated={true}
                currentUser={user?.user}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You're not registered for any events.</p>
        )}
      </div>
    </div>
  );
};

export default Profile; 