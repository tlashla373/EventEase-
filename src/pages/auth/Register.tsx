import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { registerUser, UserRole } from '../../firebase/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'participant'
    }
  });
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user } = await registerUser(data.email, data.password, data.name, data.role);
      
      // Store user data in local storage
      localStorage.setItem('userData', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: data.name,
        role: data.role
      }));
      
      // Redirect based on role
      if (data.role === 'organizer' || data.role === 'admin') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/participant/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please try another one or log in.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url(https://png.pngtree.com/thumb_back/fh260/background/20220428/pngtree-digital-marketing-doodle-business-campaign-image_1111013.jpg)] flex flex-col justify-center py-12 sm:px-4 lg:px-6">
      
      <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-[0px_0px_25px_-3px_#4c4b4d] sm:rounded-lg sm:px-10">
        

          <div className="space-y-2">
            <div className="flex justify-center">
              <Link to="/" className="bg-gray-200 p-2 rounded-lg shadow-md flex items-center text-primary-600 hover:text-primary-700">
                <Calendar className="h-10 w-10" />
              </Link>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                sign in to your existing account
              </Link>
            </p>
          </div>
        

        
          <div className="mt-8">
            {error && (
              <Alert 
                variant="error"
                message={error}
                onClose={() => setError(null)}
                className="mb-6"
              />
            )}
            
            <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    className={`input pl-10 ${errors.name ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                    {...register('name', {
                      required: 'Name is required'
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`input pl-10 ${errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    className={`input pl-10 ${errors.password ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={`input pl-10 ${errors.confirmPassword ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">I want to register as</label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <label className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer 
                    ${watch('role') === 'participant' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      value="participant"
                      className="sr-only"
                      {...register('role')}
                    />
                    <span className={`text-sm font-medium ${watch('role') === 'participant' ? 'text-primary-700' : 'text-gray-700'}`}>
                      Participant
                    </span>
                  </label>
                  
                  <label className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer 
                    ${watch('role') === 'organizer' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      value="organizer"
                      className="sr-only"
                      {...register('role')}
                    />
                    <span className={`text-sm font-medium ${watch('role') === 'organizer' ? 'text-primary-700' : 'text-gray-700'}`}>
                      Organizer
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
            </div>
        </div>
      </div>
      

      
      <div className="mt-8 text-center">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default Register;