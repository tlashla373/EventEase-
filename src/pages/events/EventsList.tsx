import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Filter, Sliders } from 'lucide-react';
import { getEvents, Event } from '../../firebase/events';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import EventCard from '../../components/events/EventCard';
import EventFilters, { FilterOptions } from '../../components/events/EventFilters';
import Button from '../../components/ui/Button';

const EventsList: React.FC = () => {
  const location = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    keyword: '',
    dateRange: {
      from: '',
      to: ''
    },
    location: '',
    eventType: '',
    priceRange: {
      min: 0,
      max: 1000
    },
    isVirtual: null
  });

  // Get search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get('search');
    
    if (searchTerm) {
      setFilters(prev => ({
        ...prev,
        keyword: searchTerm
      }));
    }
  }, [location.search]);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const fetchedEvents = await getEvents({ 
          isPublished: true,
          fromDate: new Date()
        });
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let result = [...events];
    
    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(keyword) || 
        event.description.toLowerCase().includes(keyword) ||
        event.location.city.toLowerCase().includes(keyword) ||
        event.location.country.toLowerCase().includes(keyword) ||
        event.type.name.toLowerCase().includes(keyword)
      );
    }
    
    // Date range filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      result = result.filter(event => {
        const eventDate = event.startDate instanceof Date 
          ? event.startDate 
          : new Date((event.startDate as any).seconds * 1000);
        return eventDate >= fromDate;
      });
    }
    
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      result = result.filter(event => {
        const eventDate = event.startDate instanceof Date 
          ? event.startDate 
          : new Date((event.startDate as any).seconds * 1000);
        return eventDate <= toDate;
      });
    }
    
    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      result = result.filter(event => 
        event.location.city.toLowerCase().includes(location) || 
        event.location.country.toLowerCase().includes(location)
      );
    }
    
    // Event type filter
    if (filters.eventType) {
      result = result.filter(event => 
        event.type.id === filters.eventType
      );
    }
    
    // Price range filter
    result = result.filter(event => 
      event.price >= filters.priceRange.min && 
      event.price <= filters.priceRange.max
    );
    
    // Virtual/In-person filter
    if (filters.isVirtual !== null) {
      result = result.filter(event => 
        event.location.isVirtual === filters.isVirtual
      );
    }
    
    setFilteredEvents(result);
  }, [filters, events]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="bg-gradient-to-r from-gray-900 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl uppercase font-bold mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Find and join exciting events happening around you or online.
            Filter by date, location, and more to find the perfect event.
          </p>
        </div>
      </div>
      
      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:gap-6">
            {/* Mobile Filters Toggle */}
            <div className="md:hidden mb-4">
              <Button
                variant="secondary"
                leftIcon={<Filter size={16} />}
                onClick={toggleFilters}
                className="w-full flex items-center"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            
            {/* Filters Sidebar */}
            <div 
              className={`md:w-1/4 mb-6 md:mb-0 ${showFilters ? 'block' : 'hidden md:block'}`}
            >
              <EventFilters onFilterChange={handleFilterChange} />
            </div>
            
            {/* Event Grid */}
            <div className="md:w-3/4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {filteredEvents.length} Events Found
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
                  <p className="mt-2 text-gray-500">
                    Try adjusting your filters or search criteria
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

export default EventsList;