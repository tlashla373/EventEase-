import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData, UserData } from '../firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        setCurrentUser(user);
        
        if (user) {
          // Get additional user data from Firestore
          const data = await getUserData(user.uid);
          setUserData(data);
          
          // Store user data in local storage
          if (data) {
            localStorage.setItem('userData', JSON.stringify(data));
          }
        } else {
          setUserData(null);
          localStorage.removeItem('userData');
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setLoading(false);
      }
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  // Initialize userData from localStorage if available
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData && !userData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [userData]);

  const value = {
    currentUser,
    userData,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};