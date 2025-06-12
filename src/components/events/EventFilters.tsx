import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Filter,
  MapPin,
  Tag,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export interface FilterOptions {
  keyword: string;
  dateRange: {
    from: string;
    to: string;
  };
  location: string;
  eventType: string;
  priceRange: {
    min: number;
    max: number;
  };
  isVirtual: boolean | null;
}

interface EventFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const EventFilters: React.FC<EventFiltersProps> = ({ 
  onFilterChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Event types
  const eventTypes = [
    { id: 'conference', name: 'Conference' },
    { id: 'workshop', name: 'Workshop' },
    { id: 'seminar', name: 'Seminar' },
    { id: 'networking', name: 'Networking' },
    { id: 'concert', name: 'Concert' },
    { id: 'exhibition', name: 'Exhibition' },
    { id: 'other', name: 'Other' }
  ];

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FilterOptions],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle radio button changes for virtual/in-person
  const handleVirtualChange = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      isVirtual: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
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
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Toggle filter panel on mobile
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  // Apply filters when they change
  useEffect(() => {
    // Debounce filter changes
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters.keyword]); // Only apply immediately for keyword search

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden p-4">
        <Button 
          variant="secondary"
          leftIcon={<Filter size={16} />}
          onClick={toggleFilters}
          className="w-full justify-center flex items-center"
        >
          {isOpen ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {/* Search Bar (Always Visible) */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Input
            type="text"
            name="keyword"
            placeholder="Search events..."
            value={filters.keyword}
            onChange={handleInputChange}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {filters.keyword && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              onClick={() => setFilters(prev => ({ ...prev, keyword: '' }))}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        {/* Date Range */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <CalendarRange size={20} className="mr-2" />
            Date Range
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">From</label>
              <Input 
                type="date"
                name="dateRange.from"
                value={filters.dateRange.from}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">To</label>
              <Input 
                type="date"
                name="dateRange.to"
                value={filters.dateRange.to}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <MapPin size={20} className="mr-2" />
            Location
          </h3>
          <Input 
            type="text"
            name="location"
            placeholder="Enter city or country"
            value={filters.location}
            onChange={handleInputChange}
          />
          
          <div className="mt-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">Event Type:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    filters.isVirtual === null
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleVirtualChange(null)}
                >
                  All
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    filters.isVirtual === true
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleVirtualChange(true)}
                >
                  Virtual
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    filters.isVirtual === false
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleVirtualChange(false)}
                >
                  In-Person
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Type */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <Tag size={20} className="mr-2" />
            Event Type
          </h3>
          <select
            name="eventType"
            value={filters.eventType}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">All Types</option>
            {eventTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price Range */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Min ($)</label>
              <Input 
                type="number"
                name="priceRange.min"
                min="0"
                value={filters.priceRange.min}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Max ($)</label>
              <Input 
                type="number"
                name="priceRange.max"
                min="0"
                value={filters.priceRange.max}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        {/* Filter Actions */}
        <div className="p-4 flex justify-between">
          <Button 
            variant="secondary"
            onClick={resetFilters}
          >
            Reset
          </Button>
          <Button 
            variant="primary"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;