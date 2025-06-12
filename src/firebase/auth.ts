import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  UserCredential,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export type UserRole = 'admin' | 'organizer' | 'participant';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  photoURL?: string;
}

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string,
  role: UserRole = 'participant'
): Promise<UserCredential> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    // Store user data in local storage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();
    
    // Update last login timestamp
    await setDoc(doc(db, 'users', userCredential.user.uid), 
      { lastLogin: serverTimestamp() }, 
      { merge: true }
    );
    
    // Store user data in local storage
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // Clear user data from local storage
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      // Update local storage
      localStorage.setItem('userData', JSON.stringify(userData));
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  user: User,
  data: Partial<Pick<UserData, 'displayName' | 'photoURL'>>
): Promise<void> => {
  try {
    // Update in Firebase Auth
    await updateProfile(user, data);
    
    // Update in Firestore
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    
    // Update local storage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    localStorage.setItem('userData', JSON.stringify({
      ...userData,
      ...data
    }));
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};