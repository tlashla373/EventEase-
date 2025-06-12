import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock,
  MapPin, 
  TicketCheck,
  Star,
  Bookmark,
  Search,
  ChevronRight,
  Filter,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getUserRegistrations, getEvent, Event, EventRegistration } from '../../firebase/events';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import QRTicket from '../../components/events/QRTicket';
import FeedbackForm from '../../components/events/FeedbackForm';

type RegistrationWithEvent = EventRegistration & { event?: Event };

const ParticipantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'saved'>('upcoming');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithEvent | null>(null);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Fetch user registrations on component mount
  useEffect(() => {
    const fetchParticipantData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch all registrations for this user
        const fetchedRegistrations = await getUserRegistrations(currentUser.uid);
        
        // For each registration, fetch the corresponding event
        const registrationsWithEvents = await Promise.all(
          fetchedRegistrations.map(async (registration) => {
            try {
              const event = await getEvent(registration.eventId);
              return { ...registration, event };
            } catch (err) {
              console.error(`Error fetching event ${registration.eventId}:`, err);
              return registration;
            }
          })
        );
        
        setRegistrations(registrationsWithEvents);
        
        // Set the first registration as selected by default if available
        if (registrationsWithEvents.length > 0) {
          setSelectedRegistration(registrationsWithEvents[0]);
        }
      } catch (err) {
        console.error('Error fetching participant data:', err);
        setError('Failed to load your events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParticipantData();
  }, [currentUser, navigate]);
  
  const handleSubmitFeedback = async (rating: number, comment: string) => {
    if (!selectedRegistration || !selectedRegistration.id) {
      return;
    }
    
    // Here we would submit the feedback to Firebase
    // For demo, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the local state
    setRegistrations(prevRegs => 
      prevRegs.map(reg => 
        reg.id === selectedRegistration.id 
          ? {
              ...reg,
              feedback: {
                rating,
                comment,
                submittedAt: new Date()
              }
            }
          : reg
      )
    );
    
    setSelectedRegistration(prev => 
      prev ? {
        ...prev,
        feedback: {
          rating,
          comment,
          submittedAt: new Date()
        }
      } : null
    );
    
    setShowFeedback(false);
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
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please Log In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your dashboard.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter registrations based on active tab
  const filteredRegistrations = registrations.filter(registration => {
    if (!registration.event) return false;
    
    const startDate = registration.event.startDate instanceof Date 
      ? registration.event.startDate 
      : new Date((registration.event.startDate as any).seconds * 1000);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return startDate > now;
    } else if (activeTab === 'past') {
      return startDate <= now;
    } else {
      // saved events - this would be implemented with a separate "saved events" collection
      return false;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="bg-gradient-to-r from-gray-900 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl uppercase font-bold mb-2">
            My Events
          </h1>
          <p className="text-white/90">
            Manage your event registrations and tickets
          </p>
        </div>
      </div>
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Registrations List */}
            <div className="lg:col-span-2">
              <Card>
                <div className="border-b border-gray-200">
                  <div className="flex justify-between items-center px-6 py-4">
                    <h2 className="text-xl font-bold">Your Events</h2>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={activeTab === 'upcoming' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('upcoming')}
                      >
                        Upcoming
                      </Button>
                      <Button
                        variant={activeTab === 'past' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('past')}
                      >
                        Past
                      </Button>
                      <Button
                        variant={activeTab === 'saved' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('saved')}
                      >
                        Saved
                      </Button>
                    </div>
                  </div>
                  
                  <div className="px-6 py-2 flex justify-between items-center">
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="input pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Filter size={16} />}
                      className='flex items-center'
                    >
                      Filter
                    </Button>
                  </div>
                </div>
                
                {filteredRegistrations.length === 0 ? (
                  <div className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                    <p className="text-gray-500 mt-1">
                      {activeTab === 'upcoming' 
                        ? "You don't have any upcoming events." 
                        : activeTab === 'past'
                          ? "You don't have any past events."
                          : "You don't have any saved events."}
                    </p>
                    <Button
                      variant="primary"
                      className="mt-4"
                      onClick={() => navigate('/events')}
                    >
                      Browse Events
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRegistrations.map(registration => {
                      if (!registration.event) return null;
                      
                      // Format the date
                      const startDate = registration.event.startDate instanceof Date 
                        ? registration.event.startDate 
                        : new Date((registration.event.startDate as any).seconds * 1000);
                      
                      // Check if event is in the past
                      const isPastEvent = startDate < new Date();
                      
                      return (
                        <div 
                          key={registration.id} 
                          className={`p-6 hover:bg-gray-50 cursor-pointer ${
                            selectedRegistration?.id === registration.id ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowTicket(false);
                            setShowFeedback(false);
                          }}
                        >
                          <div className="sm:flex justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{registration.event.title}</h3>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{format(startDate, 'EEE, MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{format(startDate, 'h:mm a')}</span>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                {registration.event.location.isVirtual ? (
                                  <>
                                    <Video className="h-4 w-4 mr-1" />
                                    <span>Virtual Event</span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>
                                      {registration.event.location.city}, {registration.event.location.country}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              <div className="mt-2 flex space-x-2">
                                <Badge 
                                  variant={registration.status === 'confirmed' ? 'success' : 'warning'} 
                                  size="sm"
                                >
                                  {registration.status}
                                </Badge>
                                
                                {registration.paymentStatus && (
                                  <Badge 
                                    variant={registration.paymentStatus === 'paid' ? 'success' : 'warning'}
                                    size="sm"
                                  >
                                    {registration.paymentStatus}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex sm:flex-col sm:items-end space-x-2 sm:space-x-0 sm:space-y-2 mt-4 sm:mt-0">
                              <Button
                                variant="primary"
                                size="sm"
                                className='flex items-center'
                                leftIcon={<TicketCheck size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRegistration(registration);
                                  setShowTicket(true);
                                  setShowFeedback(false);
                                }}
                              >
                                View Ticket
                              </Button>
                              
                              {isPastEvent && !registration.feedback && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className='flex items-center'
                                  leftIcon={<Star size={16} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRegistration(registration);
                                    setShowFeedback(true);
                                    setShowTicket(false);
                                  }}
                                >
                                  Give Feedback
                                </Button>
                              )}
                              
                              {isPastEvent && registration.feedback && (
                                <Badge variant="success" size="sm">
                                  Feedback Submitted
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
            
            {/* Selected Event Panel */}
            <div>
              {selectedRegistration && selectedRegistration.event ? (
                <div className="space-y-6">
                  {/* Event Details or Ticket View */}
                  {showTicket ? (
                    <QRTicket 
                      event={selectedRegistration.event}
                      ticketId={selectedRegistration.ticketId}
                      userName={selectedRegistration.userName}
                    />
                  ) : showFeedback ? (
                    <FeedbackForm 
                      eventId={selectedRegistration.eventId}
                      registrationId={selectedRegistration.id!}
                      onSubmit={handleSubmitFeedback}
                    />
                  ) : (
                    <Card>
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={selectedRegistration.event.imageUrl || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                          alt={selectedRegistration.event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-xl">
                            {selectedRegistration.event.title}
                          </h3>
                        </div>
                      </div>
                      
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Event Details</h4>
                            <div className="space-y-2 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-primary-500 mr-2" />
                                <span>
                                  {format(
                                    selectedRegistration.event.startDate instanceof Date 
                                      ? selectedRegistration.event.startDate 
                                      : new Date((selectedRegistration.event.startDate as any).seconds * 1000),
                                    'EEE, MMM d, yyyy'
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-5 w-5 text-primary-500 mr-2" />
                                <span>
                                  {format(
                                    selectedRegistration.event.startDate instanceof Date 
                                      ? selectedRegistration.event.startDate 
                                      : new Date((selectedRegistration.event.startDate as any).seconds * 1000),
                                    'h:mm a'
                                  )}
                                  {' - '}
                                  {format(
                                    selectedRegistration.event.endDate instanceof Date 
                                      ? selectedRegistration.event.endDate 
                                      : new Date((selectedRegistration.event.endDate as any).seconds * 1000),
                                    'h:mm a'
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                {selectedRegistration.event.location.isVirtual ? (
                                  <>
                                    <Video className="h-5 w-5 text-primary-500 mr-2" />
                                    <span>Virtual Event</span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-5 w-5 text-primary-500 mr-2" />
                                    <span>
                                      {selectedRegistration.event.location.address}, 
                                      {selectedRegistration.event.location.city}, 
                                      {selectedRegistration.event.location.country}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Registration Status</h4>
                            <div className="flex space-x-2">
                              <Badge 
                                variant={selectedRegistration.status === 'confirmed' ? 'success' : 'warning'} 
                              >
                                {selectedRegistration.status}
                              </Badge>
                              
                              {selectedRegistration.paymentStatus && (
                                <Badge 
                                  variant={selectedRegistration.paymentStatus === 'paid' ? 'success' : 'warning'}
                                >
                                  {selectedRegistration.paymentStatus}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="pt-4 flex justify-between">
                            <Button
                              variant="secondary"
                              onClick={() => navigate(`/events/${selectedRegistration.eventId}`)}
                            >
                              Event Details
                            </Button>
                            
                            <Button
                              variant="primary"
                              className='flex items-center'
                              leftIcon={<TicketCheck size={16} />}
                              onClick={() => setShowTicket(true)}
                            >
                              View Ticket
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                  
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <h2 className="font-bold">Quick Actions</h2>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <Button
                          variant="secondary"
                          className="w-full flex items-center"
                          leftIcon={<Calendar size={16} />}
                          onClick={() => navigate('/events')}
                        >
                          Browse More Events
                        </Button>
                        
                        {selectedRegistration && 
                         selectedRegistration.event && 
                         !showTicket && 
                         !showFeedback && (
                          <Button
                            variant="secondary"
                            className="w-full flex items-center"
                            leftIcon={<TicketCheck size={16} />}
                            onClick={() => setShowTicket(true)}
                          >
                            View Ticket
                          </Button>
                        )}
                        
                        {selectedRegistration && 
                         selectedRegistration.event && 
                         (showTicket || showFeedback) && (
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                              setShowTicket(false);
                              setShowFeedback(false);
                            }}
                          >
                            Back to Event Details
                          </Button>
                        )}
                        
                        {selectedRegistration && 
                         selectedRegistration.event && 
                         !showFeedback &&
                         (selectedRegistration.event.startDate instanceof Date 
                          ? selectedRegistration.event.startDate 
                          : new Date((selectedRegistration.event.startDate as any).seconds * 1000)) < new Date() &&
                         !selectedRegistration.feedback && (
                          <Button
                            variant="primary"
                            className="w-full"
                            leftIcon={<Star size={16} />}
                            onClick={() => {
                              setShowFeedback(true);
                              setShowTicket(false);
                            }}
                          >
                            Give Feedback
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardBody>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No event selected</h3>
                      <p className="text-gray-500 mt-1">
                        Select an event from the list to view details
                      </p>
                      <Button
                        variant="primary"
                        className="mt-4"
                        onClick={() => navigate('/events')}
                      >
                        Browse Events
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ParticipantDashboard;