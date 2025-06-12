import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Mail, Key, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../firebase/auth';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    photoURL: userData?.photoURL || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile information
      await updateUserProfile(currentUser, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      setSuccess('Profile updated successfully!');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || !userData) {
    navigate('/login');
    return null;
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
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            Profile Settings
          </h1>
          <p className="text-white/90 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-primary-500 mr-2" />
              <h2 className="text-xl font-bold">Profile Information</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert 
                  variant="error"
                  message={error}
                  onClose={() => setError(null)}
                  className="mb-6"
                />
              )}
              
              {success && (
                <Alert 
                  variant="success"
                  message={success}
                  onClose={() => setSuccess(null)}
                  className="mb-6"
                />
              )}
              
              <div className="space-y-6">
                <Input
                  label="Display Name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Profile Picture URL"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleInputChange}
                  placeholder="https://example.com/profile-picture.jpg"
                />
                
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-6">
              <Settings className="h-6 w-6 text-primary-500 mr-2" />
              <h2 className="text-xl font-bold">Account Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">{userData.email}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1 flex items-center">
                  <Key className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 capitalize">{userData.role}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-error-100">
            <h2 className="text-xl font-bold text-error-600 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="error"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // Handle account deletion
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfileSettings;