import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(id ? true : false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      maxAttendees: '',
      eventType: 'conference',
      imageUrl: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      date: Yup.date()
        .min(new Date(), 'Date cannot be in the past')
        .required('Date is required'),
      location: Yup.string().required('Location is required'),
      maxAttendees: Yup.number()
        .min(1, 'Must be at least 1')
        .required('Maximum attendees is required'),
      eventType: Yup.string().required('Event type is required'),
      imageUrl: Yup.string().url('Must be a valid URL')
    }),
    onSubmit: async (values) => {
      try {
        if (id) {
          await api.put(`/events/${id}`, values);
        } else {
          await api.post('/events', values);
        }
        navigate('/');
      } catch (error) {
        console.error('Event creation failed:', error);
      }
    },
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      const event = response.data;
      formik.setValues({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        location: event.location,
        maxAttendees: event.maxAttendees,
        eventType: event.eventType,
        imageUrl: event.imageUrl || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      navigate('/');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
            <h2 className="text-2xl font-bold text-white">
              {id ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                {...formik.getFieldProps('title')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                {...formik.getFieldProps('description')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your event"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
              )}
            </div>

            {/* Date and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  {...formik.getFieldProps('date')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.date && formik.errors.date && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  {...formik.getFieldProps('location')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Event location"
                />
                {formik.touched.location && formik.errors.location && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.location}</p>
                )}
              </div>
            </div>

            {/* Event Type and Max Attendees Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                  Event Type
                </label>
                <select
                  id="eventType"
                  {...formik.getFieldProps('eventType')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="conference">Conference</option>
                  <option value="meetup">Meetup</option>
                  <option value="workshop">Workshop</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  {...formik.getFieldProps('maxAttendees')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter maximum attendees"
                />
                {formik.touched.maxAttendees && formik.errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.maxAttendees}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                {...formik.getFieldProps('imageUrl')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL"
              />
              {formik.touched.imageUrl && formik.errors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.imageUrl}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {id ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 