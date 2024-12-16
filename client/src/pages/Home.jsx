import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import debounce from 'lodash/debounce';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    date: '',
    location: '',
    price: 'all'
  });

  // Unique locations and categories for filter options
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  // Create a debounced version of fetchEvents
  const debouncedFetch = useCallback(
    debounce((searchValue, filterValues) => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const queryParams = new URLSearchParams();
          
          if (searchValue.trim()) {
            queryParams.append('search', searchValue);
          }

          Object.entries(filterValues).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
          });

          const response = await api.get(`/events?${queryParams}`);
          setEvents(response.data);

          const uniqueLocations = [...new Set(response.data.map(event => event.location))];
          const uniqueCategories = [...new Set(response.data.map(event => event.category))];
          
          setLocations(uniqueLocations);
          setCategories(uniqueCategories);
          setError(null);
        } catch (error) {
          console.error('Error fetching events:', error);
          setError('Failed to load events');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 300), // 300ms delay
    []
  );

  useEffect(() => {
    debouncedFetch(searchTerm, filters);
    // Cleanup function to cancel pending debounced calls
    return () => debouncedFetch.cancel();
  }, [searchTerm, filters, debouncedFetch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      date: '',
      location: '',
      price: 'all'
    });
  };

  const handleRSVP = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp`, { status: 'going' });
      // Refresh events after RSVP
      fetchEvents();
    } catch (error) {
      console.error('RSVP failed:', error);
      // Show error message to user
      setError('Failed to RSVP. Please try again.');
    }
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/events', {
        params: {
          search: searchTerm,
          ...filters
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        {user && (
          <Link
            to="/create-event"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create Event
          </Link>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="w-full sm:w-auto">
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="w-full sm:w-auto">
              <select
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Any Date</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="w-full sm:w-auto">
              <select
                name="price"
                value={filters.price}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Any Price</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 mr-4"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {event.title}
                </h2>
                <span className={`px-2 py-1 text-xs rounded ${
                  event.isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {event.isFull ? 'Full' : `${event.maxAttendees - event.currentAttendees} spots left`}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {event.description.substring(0, 150)}
                {event.description.length > 150 ? '...' : ''}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.date).toLocaleDateString()}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {event.category}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Link
                  to={`/event/${event._id}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Details
                </Link>
                {user && !event.isFull && (
                  <button
                    onClick={() => handleRSVP(event._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    disabled={event.isFull}
                  >
                    RSVP
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Home; 