import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { Event } from '../../firebase/events';

interface QRTicketProps {
  event: Event;
  ticketId: string;
  userName: string;
  className?: string;
}

const QRTicket: React.FC<QRTicketProps> = ({
  event,
  ticketId,
  userName,
  className = '',
}) => {
  // Convert Firestore Timestamp to Date if needed
  const startDate = event.startDate instanceof Date 
    ? event.startDate 
    : new Date((event.startDate as any).seconds * 1000);
  
  // Format date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 ${className}`}>
      <div className="bg-primary-600 p-4 text-white">
        <h3 className="text-lg font-bold text-center">Event Ticket</h3>
      </div>
      
      <div className="flex flex-col p-14">
        <div className="flex items-start flex-col md:flex-row">
          {/* QR Code */}
          <div className="flex justify-center md:w-1/3 mb-6 md:mb-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <QRCodeSVG
                value={ticketId}
                size={150}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/event-icon.svg",
                  x: undefined,
                  y: undefined,
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
              <p className="text-xs text-gray-500 text-center mt-2">Ticket ID: {ticketId.slice(0, 8)}...</p>
            </div>
          </div>
          
          {/* Event Details */}
          <div className="md:w-2/3 md:pl-16">
            <h2 className="text-xl font-bold mb-4">{event.title}</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600">{formatDate(startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-4 w-4 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">{formatTime(startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Location</p>
                  {event.location.isVirtual ? (
                    <p className="text-gray-600">Virtual Event</p>
                  ) : (
                    <p className="text-gray-600">
                      {event.location.address}, {event.location.city}, {event.location.country}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Attendee</p>
                  <p className="text-gray-600">{userName}</p>
                </div>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-4">
              <div className="font-medium">Ticket Price</div>
              <div className="text-xl font-bold text-primary-600">
                {event.price === 0 
                  ? 'FREE' 
                  : `${event.price} ${event.currency}`
                }
              </div>
            </div>
          </div>
        </div>
        
        {/* Important Notice */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Important Information:</h4>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Please arrive 15 minutes before the event starts</li>
            <li>Present this QR code at the entrance for check-in</li>
            <li>Ticket is non-transferable and non-refundable</li>
            {event.location.isVirtual && (
              <li>A link to join the event will be sent to your email 1 hour before the event</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRTicket;