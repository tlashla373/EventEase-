import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Mail, Download } from 'lucide-react';
import { getEvent, Event } from '../../firebase/events';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import QRTicket from '../../components/events/QRTicket';
import Button from '../../components/ui/Button';

const TicketView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, we would fetch the registration by ticket ID
    // For this demo, we'll simulate it by fetching an event
    const fetchTicketData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // For demo purposes, we're just fetching any event
        // In a real app, this would fetch the specific registration by ticket ID
        const events = await getEvent('tEH2qbCVvRI4WufSehxY');
        
        if (!events) {
          setError('Ticket not found');
        } else {
          setEvent(events);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicketData();
  }, [id]);

  // Require authentication to view ticket
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login', { state: { from: `/tickets/${id}` } });
    }
  }, [currentUser, isLoading, id, navigate]);

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

  if (error || !event || !currentUser || !userData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Ticket not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The ticket you're looking for doesn't exist or has been removed.
            </p>
            <Button
              variant="primary"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/participant/dashboard')}
            >
              Back to My Events
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
      
      <div className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <Link 
              to="/participant/dashboard" 
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to My Events</span>
            </Link>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                leftIcon={<Printer size={16} />}
                onClick={() => window.print()}
              >
                Print
              </Button>
              
              <Button
                variant="secondary"
                leftIcon={<Mail size={16} />}
                onClick={() => alert('Ticket sent to your email!')}
              >
                Email
              </Button>
              
              <Button
                variant="primary"
                leftIcon={<Download size={16} />}
                onClick={() => alert('Ticket downloaded!')}
              >
                Download
              </Button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Ticket</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-primary-600 p-4 text-white text-center">
              <h2 className="text-xl font-bold">Event Ticket</h2>
            </div>
            
            <QRTicket 
              event={event} 
              ticketId={id || 'TICKET-ID'} 
              userName={userData.displayName}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Important Information</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Check-in Instructions:</strong> Please arrive at least 15 minutes before the event starts. 
                Have your QR code ready for scanning at the entrance.
              </p>
              
              <p>
                <strong>Ticket Transfer:</strong> This ticket is non-transferable and linked to your account.
              </p>
              
              <p>
                <strong>Cancellation Policy:</strong> Please contact the event organizer directly if you need to cancel your registration.
              </p>
              
              {event.location.isVirtual && (
                <p>
                  <strong>Virtual Event Access:</strong> A link to join the event will be sent to your email approximately 1 hour before the start time.
                </p>
              )}
              
              <p>
                <strong>Questions?</strong> Contact the event organizer or our support team at support@eventease.com.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TicketView;