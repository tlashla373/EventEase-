import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag,
  Video
} from 'lucide-react';
import Badge from '../ui/Badge';
import { Event } from '../../firebase/events';

interface EventCardProps {
  event: Event;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, className = '' }) => {
  // Convert Firestore Timestamp to Date if needed
  const startDate = event.startDate instanceof Date 
    ? event.startDate 
    : new Date((event.startDate as any).seconds * 1000);
  
  // Check if event is coming soon (less than 7 days away)
  const isComingSoon = formatDistanceToNow(startDate, { addSuffix: true }).includes('in');
  const isVirtual = event.location.isVirtual;
  
  // Format date and time
  const formattedDate = format(startDate, 'EEE, MMM d, yyyy');
  const formattedTime = format(startDate, 'h:mm a');
  
  // Calculate spots remaining
  const spotsRemaining = event.capacity;

  return (
    <Link to={`/events/${event.id}`} className={`event-card block ${className}`}>
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={event.imageUrl || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge 
              variant="accent"
              className="font-medium"
            >
              {isVirtual ? 'Virtual' : 'In-Person'}
            </Badge>
            {isComingSoon && (
              <Badge
                variant="primary"
                className="font-medium"
              >
                Coming Soon
              </Badge>
            )}
            <Badge 
              variant="secondary"
              className="font-medium"
            >
              {event.type.name}
            </Badge>
          </div>
          <h3 className="text-white font-bold text-lg line-clamp-1">
            {event.title}
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <div className="flex items-center mr-4">
            <Calendar size={16} className="mr-1 text-primary-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1 text-primary-500" />
            <span>{formattedTime}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          {isVirtual ? (
            <div className="flex items-center">
              <Video size={16} className="mr-1 text-primary-500" />
              <span>Online Event</span>
            </div>
          ) : (
            <div className="flex items-center">
              <MapPin size={16} className="mr-1 text-primary-500" />
              <span className="line-clamp-1">
                {event.location.city}, {event.location.country}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2 text-sm">
          {event.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-1 text-primary-500" />
            <span>{spotsRemaining} spots left</span>
          </div>
          
          <div className="font-semibold text-gray-900">
            {event.price === 0 ? (
              'Free'
            ) : (
              `${event.price} ${event.currency}`
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;