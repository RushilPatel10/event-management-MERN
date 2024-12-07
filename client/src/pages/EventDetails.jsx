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

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setLoading(false);
    } catch (error) {
      showNotification('Failed to fetch event details', 'error');
      navigate('/');
    }
  };

  const handleRSVP = async () => {
    try {
      await api.post(`/events/${id}/rsvp`);
      showNotification('Successfully RSVP\'d to event!', 'success');
      fetchEventDetails();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to RSVP', 'error');
    }
  };

  const handleCancelRSVP = async () => {
    try {
      await api.delete(`/events/${id}/rsvp`);
      showNotification('Successfully cancelled RSVP', 'success');
      fetchEventDetails();
    } catch (error) {
      showNotification('Failed to cancel RSVP', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCreator = event?.creator?._id === user?.user?._id;
  const isAttending = event?.attendees?.some(
    attendee => attendee._id === user?.user?._id
  );
  const isFull = event?.attendees?.length >= event?.maxAttendees;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {event?.imageUrl && (
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-64 object-cover"
        />
      )}

      <div className="p-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold mb-4">{event?.title}</h1>
          {isCreator && (
            <div className="space-x-4">
              <button
                onClick={() => navigate(`/events/${id}/edit`)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-6">{event?.description}</p>
            
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-semibold">Date:</span>{' '}
                {format(new Date(event?.date), 'PPP')}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Location:</span> {event?.location}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Event Type:</span>{' '}
                {event?.eventType.charAt(0).toUpperCase() + event?.eventType.slice(1)}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Attendees:</span>{' '}
                {event?.attendees?.length || 0} / {event?.maxAttendees}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Attendees</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {event?.attendees?.length > 0 ? (
                <ul className="space-y-2">
                  {event.attendees.map(attendee => (
                    <li key={attendee._id} className="text-gray-700">
                      {attendee.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No attendees yet</p>
              )}
            </div>

            {!isCreator && user && (
              <div className="mt-6">
                {isAttending ? (
                  <button
                    onClick={handleCancelRSVP}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel RSVP
                  </button>
                ) : (
                  <button
                    onClick={handleRSVP}
                    disabled={isFull}
                    className={`w-full px-4 py-2 rounded ${
                      isFull
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isFull ? 'Event Full' : 'RSVP'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 