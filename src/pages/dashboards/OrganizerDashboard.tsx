import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Users, 
  CircleDollarSign,
  BarChart3,
  Filter, 
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getEvents, Event, getEventRegistrations, EventRegistration } from '../../firebase/events';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'draft'>('upcoming');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });

  // Fetch events on component mount
  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      if (userData?.role !== 'organizer' && userData?.role !== 'admin') {
        navigate('/');
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch all events for this organizer
        const fetchedEvents = await getEvents({ 
          organizerId: currentUser.uid
        });
        
        setEvents(fetchedEvents);
        
        // Calculate stats
        const now = new Date();
        const upcoming = fetchedEvents.filter(event => {
          const startDate = event.startDate instanceof Date 
            ? event.startDate 
            : new Date((event.startDate as any).seconds * 1000);
          return startDate > now;
        });
        
        const past = fetchedEvents.filter(event => {
          const startDate = event.startDate instanceof Date 
            ? event.startDate 
            : new Date((event.startDate as any).seconds * 1000);
          return startDate <= now;
        });
        
        const draft = fetchedEvents.filter(event => !event.isPublished);
        
        let totalRev = 0;
        let totalRegs = 0;
        
        // For demo, we'll just calculate based on events and not actual registrations
        fetchedEvents.forEach(event => {
          // Simulate between 5-20 registrations per event
          const regCount = Math.floor(Math.random() * 15) + 5;
          totalRegs += regCount;
          totalRev += event.price * regCount;
        });
        
        setStats({
          totalEvents: fetchedEvents.length,
          totalRegistrations: totalRegs,
          totalRevenue: totalRev,
          upcomingEvents: upcoming.length
        });
        
        // If we have events, fetch registrations for the first one
        if (fetchedEvents.length > 0) {
          setSelectedEventId(fetchedEvents[0].id);
          const eventRegs = await getEventRegistrations(fetchedEvents[0].id!);
          setRegistrations(eventRegs);
        }
      } catch (err) {
        console.error('Error fetching organizer data:', err);
        setError('Failed to load organizer data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizerData();
  }, [currentUser, userData, navigate]);
  
  // Fetch registrations when selected event changes
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedEventId) return;
      
      try {
        const eventRegs = await getEventRegistrations(selectedEventId);
        setRegistrations(eventRegs);
      } catch (err) {
        console.error('Error fetching registrations:', err);
      }
    };
    
    fetchRegistrations();
  }, [selectedEventId]);
  
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
  
  if (!currentUser || (userData?.role !== 'organizer' && userData?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the organizer dashboard.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/')}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const filteredEvents = events.filter(event => {
    const startDate = event.startDate instanceof Date 
      ? event.startDate 
      : new Date((event.startDate as any).seconds * 1000);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return startDate > now && event.isPublished;
    } else if (activeTab === 'past') {
      return startDate <= now && event.isPublished;
    } else {
      return !event.isPublished;
    }
  });

  return (
    <div className="min-h-screen  flex flex-col">
      <Navigation />
      
      <div className="bg-gradient-to-r from-gray-900 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl uppercase md:text-4xl font-bold mb-2">
                Organizer Dashboard
              </h1>
              <p className="text-white/90">
                Manage your events and view analytics
              </p>
            </div>
            
            <Button
              variant="accent"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate('/organizer/create-event')}
              className='flex items-center'
            >
              Create Event
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-grow py-10 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardBody className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Events</p>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                  <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <CircleDollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                  <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events List */}
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
                        variant={activeTab === 'draft' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('draft')}
                      >
                        Drafts
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
                
                {filteredEvents.length === 0 ? (
                  <div className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                    <p className="text-gray-500 mt-1">
                      {activeTab === 'upcoming' 
                        ? "You don't have any upcoming events yet." 
                        : activeTab === 'past'
                          ? "You don't have any past events."
                          : "You don't have any draft events."}
                    </p>
                    <Button
                      variant="primary"
                      className="mt-4 flex items-center"
                      leftIcon={<Plus size={16} />}
                      onClick={() => navigate('/organizer/create-event')}
                    >
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredEvents.map(event => {
                      // Format the date
                      const startDate = event.startDate instanceof Date 
                        ? event.startDate 
                        : new Date((event.startDate as any).seconds * 1000);
                      
                      return (
                        <div 
                          key={event.id} 
                          className={`p-6 hover:bg-gray-50 cursor-pointer ${
                            selectedEventId === event.id ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => setSelectedEventId(event.id!)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{format(startDate, 'MMM d, yyyy, h:mm a')}</span>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{event.capacity} max attendees</span>
                              </div>
                              
                              <div className="mt-2 flex space-x-2">
                                {event.isPublished ? (
                                  <Badge 
                                    variant="success" 
                                    size="sm"
                                  >
                                    Published
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="warning" 
                                    size="sm"
                                  >
                                    Draft
                                  </Badge>
                                )}
                                
                                <Badge 
                                  variant="primary"
                                  size="sm"
                                >
                                  {event.location.isVirtual ? 'Virtual' : 'In-Person'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex space-y-2 flex-col mr-4 mt-4">
                              <Button
                                variant="secondary"
                                size="sm"
                                className='flex items-center'
                                leftIcon={<Eye size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/events/${event.id}`);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className='flex items-center'
                                leftIcon={<Edit size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/organizer/edit-event/${event.id}`);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
            
            {/* Registrations Panel */}
            <div>
              <Card>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-bold">Registrations</h2>
                </div>
                
                {!selectedEventId ? (
                  <div className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No event selected</h3>
                    <p className="text-gray-500 mt-1">
                      Select an event to view registrations
                    </p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No registrations</h3>
                    <p className="text-gray-500 mt-1">
                      This event has no registrations yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {registrations.slice(0, 5).map(registration => (
                      <div key={registration.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{registration.userName}</h4>
                            <p className="text-sm text-gray-500">{registration.userEmail}</p>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {registration.registrationDate instanceof Date 
                                  ? format(registration.registrationDate, 'MMM d, yyyy') 
                                  : format(new Date((registration.registrationDate as any).seconds * 1000), 'MMM d, yyyy')
                                }
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 items-end">
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
                      </div>
                    ))}
                    
                    {registrations.length > 5 && (
                      <div className="p-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => alert('View all registrations')}
                        >
                          View All ({registrations.length}) Registrations
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
              
              {/* Quick Actions */}
              <Card className="mt-6">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-4">
                  <Button
                    variant="primary"
                    className="w-full flex items-center"
                    leftIcon={<Plus size={16} />}
                    onClick={() => navigate('/organizer/create-event')}
                  >
                    Create New Event
                  </Button>
                  
                  <Button
                    variant="secondary"
                    className="w-full flex items-center"
                    leftIcon={<BarChart3 size={16} />}
                    onClick={() => alert('View Analytics')}
                  >
                    View Analytics
                  </Button>
                  
                  <Button
                    variant="secondary"
                    className="w-full flex items-center"
                    leftIcon={<Users size={16} />}
                    onClick={() => alert('Manage Attendees')}
                  >
                    Manage Attendees
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrganizerDashboard;