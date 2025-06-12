import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent } from '../../firebase/events';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import EventForm from '../../components/events/EventForm';
import Button from '../../components/ui/Button';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is authenticated and is an organizer/admin
  if (!currentUser || (userData?.role !== 'organizer' && userData?.role !== 'admin')) {
    navigate('/login');
    return null;
  }
  
  const handleSubmit = async (eventData: any) => {
    setIsSubmitting(true);
    
    try {
      // Add organizer info to event data
      const enrichedEventData = {
        ...eventData,
        organizerId: currentUser.uid,
        organizerName: userData?.displayName || 'Event Organizer',
      };
      
      // Convert string dates to Date objects if they're not already
      if (typeof enrichedEventData.startDate === 'string') {
        enrichedEventData.startDate = new Date(enrichedEventData.startDate);
      }
      
      if (typeof enrichedEventData.endDate === 'string') {
        enrichedEventData.endDate = new Date(enrichedEventData.endDate);
      }
      
      if (typeof enrichedEventData.registrationDeadline === 'string') {
        enrichedEventData.registrationDeadline = new Date(enrichedEventData.registrationDeadline);
      }
      
      const eventId = await createEvent(enrichedEventData);
      
      // Navigate to the event page
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="bg-gradient-to-r from-gray-900 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              className="text-white mr-4 bg-primary-400 hover:bg-primary-600 flex items-center"
              onClick={() => navigate('/organizer/dashboard')}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            Create New Event
          </h1>
          <p className="text-white/90 mt-2">
            Fill in the details to create your new event
          </p>
        </div>
      </div>
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <EventForm 
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

export default CreateEvent;