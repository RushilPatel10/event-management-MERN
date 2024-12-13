import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRSVP, setUserRSVP] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      if (user) {
        const rsvp = response.data.attendees.find(
          a => a.user._id === user.id
        );
        setUserRSVP(rsvp?.status || null);
      }
    } catch (error) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await api.post(`/events/${id}/rsvp`, { status });
      await fetchEventDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update RSVP');
    }
  };

  const getRSVPButtonClass = (status) => {
    const baseClass = "px-4 py-2 rounded-md font-medium transition-colors";
    const isSelected = userRSVP === status;
    
    switch (status) {
      case 'going':
        return `${baseClass} ${isSelected 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`;
      case 'maybe':
        return `${baseClass} ${isSelected 
          ? 'bg-yellow-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'}`;
      case 'not_going':
        return `${baseClass} ${isSelected 
          ? 'bg-red-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-red-100'}`;
      default:
        return baseClass;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || 'Event not found'}</p>
      </div>
    );
  }

  const isEventFull = event.currentAttendees >= event.maxAttendees;
  const canRSVP = !isEventFull || userRSVP === 'going';
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex flex-col items-end">
              {event.price > 0 ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ${event.price}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Free
                </span>
              )}
              <span className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                isEventFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {event.currentAttendees} / {event.maxAttendees} spots filled
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {eventDate.toLocaleString()}
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Organized by {event.creator.username}
              </div>
            </div>
          </div>

          {!isPastEvent && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {user ? 'Your RSVP Status' : 'RSVP to this event'}
              </h3>
              
              {user ? (
                <div className="space-y-4">
                  {!canRSVP && isEventFull && (
                    <p className="text-red-600 mb-2">
                      This event is full. You can join the waiting list or choose "Maybe" to be notified if spots open up.
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleRSVP('going')}
                      disabled={!canRSVP}
                      className={getRSVPButtonClass('going')}
                    >
                      Going
                    </button>
                    <button
                      onClick={() => handleRSVP('maybe')}
                      className={getRSVPButtonClass('maybe')}
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRSVP('not_going')}
                      className={getRSVPButtonClass('not_going')}
                    >
                      Not Going
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Please log in to RSVP for this event
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          )}

          {isPastEvent && (
            <div className="border-t pt-6">
              <p className="text-center text-gray-600">
                This event has already taken place
              </p>
            </div>
          )}

          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-semibold mb-4">Attendees</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.attendees
                .filter(a => a.status === 'going')
                .map(attendee => (
                  <div key={attendee.user._id} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {attendee.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700">{attendee.user.username}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 