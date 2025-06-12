import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEvent, updateEvent } from '../../firebase/events';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import EventForm from '../../components/events/EventForm';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch event data on component mount
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const eventData = await getEvent(id);
        
        if (!eventData) {
          setError('Event not found');
        } else {
          // Check if current user is the organizer
          if (eventData.organizerId !== currentUser?.uid && userData?.role !== 'admin') {
            setError('You do not have permission to edit this event');
          } else {
            setEvent(eventData);
          }
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if user is authenticated and is an organizer/admin
    if (!currentUser || (userData?.role !== 'organizer' && userData?.role !== 'admin')) {
      navigate('/login');
    } else {
      fetchEvent();
    }
  }, [id, currentUser, userData, navigate]);
  
  const handleSubmit = async (eventData: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert string dates to Date objects if they're not already
      if (typeof eventData.startDate === 'string') {
        eventData.startDate = new Date(eventData.startDate);
      }
      
      if (typeof eventData.endDate === 'string') {
        eventData.endDate = new Date(eventData.endDate);
      }
      
      if (typeof eventData.registrationDeadline === 'string') {
        eventData.registrationDeadline = new Date(eventData.registrationDeadline);
      }
      
      await updateEvent(id, eventData);
      
      // Navigate to the event page
      navigate(`/events/${id}`);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
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
              {!error ? 'The event you\'re trying to edit doesn\'t exist or has been removed.' : ''}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/organizer/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="bg-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              className="text-white mr-4 hover:bg-primary-600"
              onClick={() => navigate('/organizer/dashboard')}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            Edit Event
          </h1>
          <p className="text-white/90 mt-2">
            Update the details of your event
          </p>
        </div>
      </div>
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <EventForm 
              initialData={event}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditEvent;