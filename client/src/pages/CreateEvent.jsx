import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters'),
    date: Yup.date()
      .required('Date is required')
      .min(new Date(), 'Date cannot be in the past'),
    location: Yup.string()
      .required('Location is required'),
    category: Yup.string()
      .required('Category is required'),
    maxAttendees: Yup.number()
      .required('Maximum attendees is required')
      .min(1, 'Must allow at least 1 attendee'),
    price: Yup.number()
      .min(0, 'Price cannot be negative')
      .required('Price is required')
  });

  const initialValues = {
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    maxAttendees: 1,
    price: 0,
    tags: []
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await api.post('/events', {
        ...values,
        creator: user.id
      });
      
      navigate(`/event/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {error}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <Field
                type="text"
                name="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date and Time
              </label>
              <Field
                type="datetime-local"
                name="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="date" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Field
                type="text"
                name="location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Field
                as="select"
                name="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="concert">Concert</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                Maximum Attendees
              </label>
              <Field
                type="number"
                name="maxAttendees"
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="maxAttendees" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <Field
                type="number"
                name="price"
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateEvent; 