import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

const EventCard = ({ event, onRSVP, isAuthenticated, currentUser }) => {
	const { showNotification } = useNotification();

	const handleRSVP = async () => {
		if (!isAuthenticated) {
			showNotification('Please login to RSVP', 'error');
			return;
		}

		try {
			await onRSVP(event._id);
			showNotification('Successfully RSVP\'d to event!', 'success');
		} catch (error) {
			showNotification(error.response?.data?.message || 'Failed to RSVP', 'error');
		}
	};

	const isAttending = event.attendees?.some(
		attendee => attendee._id === currentUser?._id
	);

	const isCreator = event.creator?._id === currentUser?._id;

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			{event.imageUrl && (
				<img 
					src={event.imageUrl} 
					alt={event.title} 
					className="w-full h-48 object-cover"
				/>
			)}
			
			<div className="p-6">
				<h3 className="text-xl font-semibold mb-2">{event.title}</h3>
				<p className="text-gray-600 mb-4">{event.description}</p>
				
				<div className="space-y-2">
					<p className="text-sm text-gray-500">
						<span className="font-medium">Date:</span>{' '}
						{format(new Date(event.date), 'PPP')}
					</p>
					<p className="text-sm text-gray-500">
						<span className="font-medium">Location:</span> {event.location}
					</p>
					<p className="text-sm text-gray-500">
						<span className="font-medium">Attendees:</span>{' '}
						{event.attendees?.length || 0} / {event.maxAttendees}
					</p>
				</div>

				<div className="mt-4 flex justify-between items-center">
					<Link
						to={`/events/${event._id}`}
						className="text-blue-600 hover:text-blue-800"
					>
						View Details
					</Link>
					
					{!isCreator && (
						<button
							onClick={handleRSVP}
							disabled={isAttending}
							className={`px-4 py-2 rounded ${
								isAttending
									? 'bg-gray-300 cursor-not-allowed'
									: 'bg-blue-600 hover:bg-blue-700 text-white'
							}`}
						>
							{isAttending ? 'Attending' : 'RSVP'}
						</button>
					)}
					
					{isCreator && (
						<Link
							to={`/events/${event._id}/edit`}
							className="text-gray-600 hover:text-gray-800"
						>
							Edit Event
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default EventCard; 