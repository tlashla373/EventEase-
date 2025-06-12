import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Event, EventLocation, EventType } from '../../firebase/events';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

interface EventFormProps {
  onSubmit: (data: Partial<Event>) => Promise<void>;
  initialData?: Partial<Event>;
  isLoading?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Event types
  const eventTypes: EventType[] = [
    { id: 'conference', name: 'Conference', color: '#3B82F6' },
    { id: 'workshop', name: 'Workshop', color: '#10B981' },
    { id: 'seminar', name: 'Seminar', color: '#6366F1' },
    { id: 'networking', name: 'Networking', color: '#F59E0B' },
    { id: 'concert', name: 'Concert', color: '#EC4899' },
    { id: 'exhibition', name: 'Exhibition', color: '#8B5CF6' },
    { id: 'other', name: 'Other', color: '#6B7280' }
  ];

  // Setup form with initial data
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<Partial<Event>>({
    defaultValues: initialData || {
      title: '',
      description: '',
      capacity: 100,
      price: 0,
      currency: 'USD',
      isPublished: false,
      location: {
        isVirtual: false,
        address: '',
        city: '',
        country: '',
      },
      type: eventTypes[0],
      tags: [],
    }
  });
  
  // Watch form values
  const isVirtual = watch('location.isVirtual');
  
  // Handle form submission
  const handleFormSubmit = async (data: Partial<Event>) => {
    try {
      setError(null);
      await onSubmit(data);
      setSuccess('Event successfully saved!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting event:', error);
      setError('Failed to save event. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert 
          variant="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {success && (
        <Alert 
          variant="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      
      {/* Event Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <Input
            label="Event Title"
            id="title"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
            placeholder="Enter event title"
          />
          
          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className={`input ${errors.description ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Describe your event"
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="eventType">
                Event Type
              </label>
              <select
                id="eventType"
                className="input"
                {...register('type.id')}
              >
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              label="Tags (comma separated)"
              id="tags"
              {...register('tags')}
              placeholder="e.g., tech, business, networking"
              helperText="Enter tags separated by commas"
            />
          </div>
        </div>
      </div>
      
      {/* Date & Time */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Date & Time</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="startDate">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="startDate"
              className={`input ${errors.startDate ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              {...register('startDate', { required: 'Start date is required' })}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-error-600">{errors.startDate.message}</p>
            )}
          </div>
          
          <div>
            <label className="label" htmlFor="endDate">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="endDate"
              className={`input ${errors.endDate ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              {...register('endDate', { required: 'End date is required' })}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-error-600">{errors.endDate.message}</p>
            )}
          </div>
          
          <div>
            <label className="label" htmlFor="registrationDeadline">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              id="registrationDeadline"
              className="input"
              {...register('registrationDeadline')}
            />
          </div>
        </div>
      </div>
      
      {/* Location */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-primary-600"
                value="false"
                {...register('location.isVirtual')}
                defaultChecked={!isVirtual}
              />
              <span className="ml-2">In-Person Event</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-primary-600"
                value="true"
                {...register('location.isVirtual')}
                defaultChecked={isVirtual}
              />
              <span className="ml-2">Virtual Event</span>
            </label>
          </div>
          
          {isVirtual ? (
            <Input
              label="Virtual Meeting Link"
              id="virtualLink"
              {...register('location.virtualLink')}
              placeholder="e.g., Zoom, Google Meet, Microsoft Teams link"
              helperText="Link will be shared with registered participants"
            />
          ) : (
            <div className="space-y-4">
              <Input
                label="Address"
                id="address"
                {...register('location.address', { 
                  required: !isVirtual ? 'Address is required' : false 
                })}
                error={errors.location?.address?.message}
                placeholder="Street address"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  id="city"
                  {...register('location.city', { 
                    required: !isVirtual ? 'City is required' : false 
                  })}
                  error={errors.location?.city?.message}
                  placeholder="City"
                />
                
                <Input
                  label="State/Province"
                  id="state"
                  {...register('location.state')}
                  placeholder="State/Province"
                />
                
                <Input
                  label="Country"
                  id="country"
                  {...register('location.country', { 
                    required: !isVirtual ? 'Country is required' : false 
                  })}
                  error={errors.location?.country?.message}
                  placeholder="Country"
                />
              </div>
              
              <Input
                label="Postal Code"
                id="postalCode"
                {...register('location.postalCode')}
                placeholder="Postal Code"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Capacity & Pricing */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity & Pricing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Capacity"
            id="capacity"
            type="number"
            min="1"
            {...register('capacity', { 
              required: 'Capacity is required',
              min: { value: 1, message: 'Capacity must be at least 1' } 
            })}
            error={errors.capacity?.message}
            placeholder="Maximum number of attendees"
          />
          
          <Input
            label="Price"
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price cannot be negative' } 
            })}
            error={errors.price?.message}
            placeholder="Enter 0 for free events"
          />
          
          <div>
            <label className="label" htmlFor="currency">
              Currency
            </label>
            <select
              id="currency"
              className="input"
              {...register('currency')}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="LKR">LKR - Sri Lankan Rupee</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Image</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input
            type="text"
            id="imageUrl"
            {...register('imageUrl')}
            placeholder="Enter image URL"
            helperText="Enter a URL for your event cover image"
          />
        </div>
      </div>
      
      {/* Publish Status */}
      <div className="flex items-center">
        <input
          id="isPublished"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          {...register('isPublished')}
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
          Publish this event (make it visible to participants)
        </label>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="secondary"
          type="button"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button 
          variant="primary"
          type="submit"
          isLoading={isLoading}
        >
          {initialData?.id ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;