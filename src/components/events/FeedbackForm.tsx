import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

interface FeedbackFormProps {
  eventId: string;
  registrationId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

interface FeedbackFormData {
  rating: number;
  comment: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  eventId, 
  registrationId, 
  onSubmit 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FeedbackFormData>({
    defaultValues: {
      rating: 0,
      comment: ''
    }
  });
  
  const currentRating = watch('rating');
  
  const handleRatingClick = (rating: number) => {
    setValue('rating', rating);
  };
  
  const handleMouseEnter = (rating: number) => {
    setHoverRating(rating);
  };
  
  const handleMouseLeave = () => {
    setHoverRating(0);
  };
  
  const onFormSubmit = async (data: FeedbackFormData) => {
    if (data.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data.rating, data.comment);
      setSuccess('Thank you for your feedback!');
      
      // Reset form
      setValue('rating', 0);
      setValue('comment', '');
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Share Your Feedback</h2>
      
      {error && (
        <Alert 
          variant="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}
      
      {success && (
        <Alert 
          variant="success"
          message={success}
          onClose={() => setSuccess(null)}
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate your experience?
          </label>
          
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || currentRating)
                      ? 'fill-accent-400 text-accent-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          <input
            type="hidden"
            {...register('rating', {
              validate: (value) => value > 0 || 'Please select a rating'
            })}
          />
          
          {errors.rating && (
            <p className="mt-1 text-sm text-error-600">{errors.rating.message}</p>
          )}
        </div>
        
        {/* Comment Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="comment">
            Additional Comments
          </label>
          
          <textarea
            id="comment"
            rows={4}
            className={`input ${errors.comment ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Share your experience with this event..."
            {...register('comment')}
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
