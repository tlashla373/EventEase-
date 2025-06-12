
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EventsList from './pages/events/EventsList';
import EventDetails from './pages/events/EventDetails';
import TicketView from './pages/events/TicketView';
import OrganizerDashboard from './pages/dashboards/OrganizerDashboard';
import ParticipantDashboard from './pages/dashboards/ParticipantDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import ProfileSettings from './pages/settings/ProfileSettings';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'organizer' | 'participant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  // In a real app, we would check the user's authentication status and role
  // For this demo, we're just allowing all routes
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          
          {/* Protected Routes */}
          <Route 
            path="/tickets/:id" 
            element={
              <ProtectedRoute>
                <TicketView />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/organizer/dashboard" 
            element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/participant/dashboard" 
            element={
              <ProtectedRoute requiredRole="participant">
                <ParticipantDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/organizer/create-event" 
            element={
              <ProtectedRoute requiredRole="organizer">
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/organizer/edit-event/:id" 
            element={
              <ProtectedRoute requiredRole="organizer">
                <EditEvent />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
