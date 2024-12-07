import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import EventCard from '../components/EventCard';

const Profile = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const [createdResponse, attendingResponse] = await Promise.all([
        api.get('/events/created'),
        api.get('/events/attending')
      ]);

      console.log('Created events:', createdResponse.data);
      console.log('Attending events:', attendingResponse.data);

      setCreatedEvents(createdResponse.data);
      setAttendingEvents(attendingResponse.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification(
        error.response?.data?.message || 'Failed to fetch events',
        'error'
      );
    } finally {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Events I'm Hosting</h2>
        {createdEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any events yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Events I'm Attending</h2>
        {attendingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendingEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You're not attending any events yet.</p>
        )}
      </section>
    </div>
  );
};

export default Profile; 