import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Share2,
  ArrowLeft,
  DollarSign,
  Video
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getEvent, Event, registerForEvent } from '../../firebase/events';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistering: false,
    success: false,
    message: null as string | null
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const eventData = await getEvent(id);

        if (!eventData) {
          setError('Event not found');
        } else {
          // Ensure tags is always an array
          setEvent({
            ...eventData,
            tags: Array.isArray(eventData.tags) ? eventData.tags : []
          });
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!event || !currentUser || !userData) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setRegistrationStatus({
      isRegistering: true,
      success: false,
      message: null
    });

    try {
      const ticketId = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await registerForEvent({
        eventId: event.id!,
        userId: currentUser.uid,
        userEmail: userData.email,
        userName: userData.displayName,
        ticketId,
        status: 'confirmed',
        paymentStatus: event.price > 0 ? 'unpaid' : 'paid'
      });

      setRegistrationStatus({
        isRegistering: false,
        success: true,
        message: 'Registration successful! Check your dashboard for ticket details.'
      });

      setTimeout(() => {
        navigate(`/tickets/${ticketId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegistrationStatus({
        isRegistering: false,
        success: false,
        message: err.message || 'Failed to register for the event'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Event not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button
              variant="primary"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/events')}
            >
              Back to Events
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const startDate = event.startDate instanceof Date
    ? event.startDate
    : new Date((event.startDate as any).seconds * 1000);

  const endDate = event.endDate instanceof Date
    ? event.endDate
    : new Date((event.endDate as any).seconds * 1000);

  const formattedStartDate = format(startDate, 'EEE, MMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');

  const isPastEvent = startDate < new Date();

  const registrationDeadline = event.registrationDeadline instanceof Date
    ? event.registrationDeadline
    : new Date((event.registrationDeadline as any).seconds * 1000);

  const isRegistrationClosed = registrationDeadline < new Date();

  const isEventFull = false; // Placeholder for future logic

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="relative bg-primary-800 text-white h-64 md:h-80">
        <img
          src={event.imageUrl || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'}
          alt={event.title}
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/70"></div>

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={event.location.isVirtual ? 'primary' : 'secondary'}>
              {event.location.isVirtual ? 'Virtual Event' : 'In-Person Event'}
            </Badge>
            <Badge variant="accent">
              {event.type.name}
            </Badge>
            {isPastEvent && <Badge variant="error">Past Event</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-white/80 text-lg mb-4">Organized by {event.organizerName}</p>

          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formattedStartDate}</span>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{formattedStartTime} - {formattedEndTime}</span>
            </div>

            <div className="flex items-center">
              {event.location.isVirtual ? (
                <>
                  <Video className="h-5 w-5 mr-2" />
                  <span>Online Event</span>
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location.city}, {event.location.country}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {registrationStatus.success && registrationStatus.message && (
              <Alert variant="success" message={registrationStatus.message} className="mb-6" />
            )}
            {!registrationStatus.success && registrationStatus.message && (
              <Alert variant="error" message={registrationStatus.message} className="mb-6" />
            )}

            <div className="bg-white rounded-lg shadow-[0px_0px_7px_-1px_rgba(0,_0,_0,_0.2)] p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0px_0px_7px_-1px_rgba(0,_0,_0,_0.2)] p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-500" /> Date & Time
                  </h3>
                  <p className="mb-1">{formattedStartDate}</p>
                  <p>{formattedStartTime} - {formattedEndTime}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDistanceToNow(startDate, { addSuffix: true })}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    {event.location.isVirtual ? (
                      <>
                        <Video className="h-5 w-5 mr-2 text-primary-500" />
                        Virtual Location
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                        Location
                      </>
                    )}
                  </h3>
                  {event.location.isVirtual ? (
                    <>
                      <p>Online Event</p>
                      <p className="text-sm text-gray-500 mt-1">Link will be provided after registration</p>
                    </>
                  ) : (
                    <>
                      <p>{event.location.address}</p>
                      <p>{event.location.city}, {event.location.state}</p>
                      <p>{event.location.country} {event.location.postalCode}</p>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary-500" /> Capacity
                  </h3>
                  <p>{event.capacity} attendees maximum</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-primary-500" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(event.tags) && event.tags.length > 0 ? (
                      event.tags.map((tag, index) => (
                        <Badge key={index} variant="neutral" outlined>
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0px_0px_7px_-1px_rgba(0,_0,_0,_0.2)] p-6">
              <h2 className="text-2xl font-bold mb-4">Organizer</h2>
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium text-lg mr-4">
                  {event.organizerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{event.organizerName}</h3>
                  <p className="text-gray-600">Event Organizer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-[0px_0px_7px_-1px_rgba(0,_0,_0,_0.2)] p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-baseline">
                  <DollarSign className="h-6 w-6 text-gray-500" />
                  <span className="text-3xl font-bold ml-1">
                    {event.price === 0 ? 'Free' : `${event.price} ${event.currency}`}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleRegister}
                  isLoading={registrationStatus.isRegistering}
                  disabled={
                    isPastEvent || isRegistrationClosed || isEventFull || registrationStatus.success
                  }
                >
                  {isPastEvent
                    ? 'Event has ended'
                    : isRegistrationClosed
                      ? 'Registration closed'
                      : isEventFull
                        ? 'Event is full'
                        : 'Register for Event'}
                </Button>

                {isPastEvent && (
                  <p className="text-sm text-gray-500 mt-2">This event has already taken place.</p>
                )}
                {!isPastEvent && isRegistrationClosed && (
                  <p className="text-sm text-gray-500 mt-2">Registration deadline has passed.</p>
                )}
                {!isPastEvent && !isRegistrationClosed && isEventFull && (
                  <p className="text-sm text-gray-500 mt-2">This event has reached maximum capacity.</p>
                )}
              </div>

              <div>
                <Button
                  variant="secondary"
                  leftIcon={<Share2 size={20} />}
                  className="w-full flex items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Event link copied to clipboard!');
                  }}
                >
                  Share Event
                </Button>
              </div>

              {!isPastEvent && !isRegistrationClosed && (
                <div className="mt-6 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Registration Deadline:</span>{' '}
                    {format(registrationDeadline, 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetails;
