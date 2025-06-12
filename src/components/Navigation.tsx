import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../firebase/auth';
import { 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home,
  LayoutDashboard,
  Settings,
  Bell
} from 'lucide-react';

import Button from './ui/Button';

const Navigation: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={20} /> },
    { to: '/events', label: 'Events', icon: <Calendar size={20} /> },
  ];

  // Add conditional links based on user role
  if (currentUser && userData) {
    if (userData.role === 'organizer' || userData.role === 'admin') {
      navLinks.push({ 
        to: '/organizer/dashboard', 
        label: 'Dashboard', 
        icon: <LayoutDashboard size={20} /> 
      });
    } else {
      navLinks.push({ 
        to: '/participant/dashboard', 
        label: 'My Events', 
        icon: <Calendar size={20} /> 
      });
    }
  }

  return (
    <nav className="bg-gray-100 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">

            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Event</span><span className="text-xl font-bold text-primary-600">Ease</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium 
                    ${location.pathname === link.to 
                      ? 'text-primary-600 border-b-2 border-primary-500' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Authentication Buttons */}
          <div className="hidden md:flex md:items-center md:ml-6">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700 relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent-500"></span>
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {userData?.photoURL ? (
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={userData.photoURL} 
                        alt={userData.displayName || 'User'} 
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                        {userData?.displayName?.[0] || 'U'}
                      </div>
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{userData?.displayName}</p>
                        <p className="text-xs text-gray-500">{userData?.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <User size={16} className="mr-2" />
                          Profile
                        </span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <Settings size={16} className="mr-2" />
                          Settings
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <LogOut size={16} className="mr-2" />
                          Sign out
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Button 
                  variant="secondary"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center pl-3 pr-4 py-2 text-base font-medium
                ${location.pathname === link.to
                  ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700'
                  : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }
              `}
              onClick={closeMenu}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Mobile Authentication Section */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {currentUser ? (
            <>
              <div className="flex items-center px-4">
                {userData?.photoURL ? (
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src={userData.photoURL}
                      alt={userData.displayName || 'User'}
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                    {userData?.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {userData?.displayName}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {userData?.email}
                  </div>
                </div>
                <button className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500">
                  <Bell size={20} />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <span className="flex items-center">
                    <User size={18} className="mr-3" />
                    Profile
                  </span>
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <span className="flex items-center">
                    <Settings size={18} className="mr-3" />
                    Settings
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <LogOut size={18} className="mr-3" />
                    Sign out
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1 px-2">
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => {
                  navigate('/login');
                  closeMenu();
                }}
              >
                Log in
              </Button>
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  navigate('/register');
                  closeMenu();
                }}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;