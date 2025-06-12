import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Search, MapPin, Users, ArrowRight } from 'lucide-react';
import { getEvents, Event } from '../firebase/events';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import EventCard from '../components/events/EventCard';


const Home: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch upcoming published events
        const events = await getEvents({ 
          isPublished: true,
          fromDate: new Date(),
          limit: 6
        });
        
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-indigo-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-indigo-600 opacity-90"></div>
          {/* Background pattern */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
          <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 mb-10 lg:mb-0 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold uppercase mb-6 animate-fade-in leading-tight">
                Simplify Your Event Management
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 animate-slide-up">
                EventEase helps you create, manage, and attend events seamlessly. 
                From registration to feedback, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
                <Button variant="accent" size="lg" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/events')}>
                  Explore Events
                </Button>
              </div>
            </div>

            {/* Image on the right – hidden on small devices */}
            <div className="hidden lg:flex lg:w-1/2 justify-center">
              <video
                className="w-full max-w-md lg:max-w-lg rounded-xl shadow-lg"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="public\0_Social_Media_Social_Networking_1080x1080.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>


        
        {/* Search Bar */}
        <div className="bg-white py-5 shadow-md relative z-10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search for events..."
                  className="w-full px-4 py-3 pl-12 text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <Button 
                variant="primary"
                type="submit"
                className="md:whitespace-nowrap"
              >
                Search Events
              </Button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase text-gray-900 mb-4">Why Choose EventEase?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform streamlines every aspect of event management, providing 
              powerful tools for organizers and a seamless experience for attendees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Simplified Event Creation</h3>
              <p className="text-gray-600">
                Create beautiful event pages in minutes with our intuitive interface.
                Manage registrations, tickets, and communications all in one place.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Effortless Registration</h3>
              <p className="text-gray-600">
                Streamlined registration process with customizable forms.
                Generate QR code tickets for easy check-in at your events.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Virtual & In-Person Events</h3>
              <p className="text-gray-600">
                Support for both physical and virtual events with specialized tools
                for each format. Create hybrid experiences with ease.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl  font-bold uppercase  text-gray-900">Upcoming Events</h2>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-2 text-gray-500">Check back soon for new events</p>
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Button 
              variant="primary"
              size="lg"
              onClick={() => navigate('/organizer/create-event')}
            >
              Create Your Own Event
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover why event organizers and attendees love using EventEase.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                  JS
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Jamie Smith</h4>
                  <p className="text-sm text-gray-500">Event Organizer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "EventEase has transformed how I manage my conferences. The intuitive
                interface and powerful features have saved me countless hours of work."
              </p>
              <div className="mt-4 flex text-accent-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                  ML
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Maria Lopez</h4>
                  <p className="text-sm text-gray-500">Regular Attendee</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I love how easy it is to find and register for events. The QR ticket
                system makes check-in so smooth, and I can keep track of all my events in one place."
              </p>
              <div className="mt-4 flex text-accent-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                  DR
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">David Reyes</h4>
                  <p className="text-sm text-gray-500">Corporate Event Manager</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The analytics and feedback collection tools have been game-changers for
                our corporate events. We're able to improve our events based on real data."
              </p>
              <div className="mt-4 flex text-accent-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="inset-0 bg-gradient-to-t from-gray-700 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold uppercase mb-4">Ready to Simplify Your Event Management?</h2>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Join thousands of event organizers and attendees who use EventEase to create
              memorable experiences with less hassle.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="accent"
                size="lg"
                onClick={() => navigate('/register')}
              >
                Sign Up Now
              </Button>
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

// Star component for testimonials
const Star = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default Home;