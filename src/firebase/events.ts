import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentReference
} from 'firebase/firestore';
import { db } from './config';

export interface EventLocation {
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  virtualLink?: string;
  isVirtual: boolean;
}

export interface EventType {
  id: string;
  name: string;
  color: string;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  location: EventLocation;
  organizerId: string;
  organizerName: string;
  imageUrl?: string;
  capacity: number;
  price: number;
  currency: string;
  type: EventType;
  tags: string[];
  isPublished: boolean;
  registrationDeadline: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface EventRegistration {
  id?: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  registrationDate: Date | Timestamp;
  ticketId: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  paymentStatus?: 'paid' | 'unpaid' | 'refunded';
  checkInTime?: Date | Timestamp;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: Date | Timestamp;
  };
}

// Create a new event
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const eventRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return eventRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get event by ID
export const getEvent = async (eventId: string): Promise<Event | null> => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    
    if (eventDoc.exists()) {
      return { id: eventDoc.id, ...eventDoc.data() } as Event;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'events', eventId), {
      ...eventData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get all events (with optional filters)
export const getEvents = async (filters?: {
  organizerId?: string;
  isPublished?: boolean;
  fromDate?: Date;
  type?: string;
  limit?: number;
}): Promise<Event[]> => {
  try {
    let eventsQuery = collection(db, 'events');
    let queryConstraints = [];
    
    if (filters?.organizerId) {
      queryConstraints.push(where('organizerId', '==', filters.organizerId));
    }
    
    if (filters?.isPublished !== undefined) {
      queryConstraints.push(where('isPublished', '==', filters.isPublished));
    }
    
    if (filters?.fromDate) {
      queryConstraints.push(where('startDate', '>=', filters.fromDate));
    }
    
    if (filters?.type) {
      queryConstraints.push(where('type.id', '==', filters.type));
    }
    
    queryConstraints.push(orderBy('startDate', 'asc'));
    
    if (filters?.limit) {
      queryConstraints.push(limit(filters.limit));
    }
    
    const q = query(eventsQuery, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Event);
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

// Register user for an event
export const registerForEvent = async (registrationData: Omit<EventRegistration, 'id' | 'registrationDate'>): Promise<string> => {
  try {
    // Get event to check capacity
    const eventDoc = await getDoc(doc(db, 'events', registrationData.eventId));
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
    
    const eventData = eventDoc.data() as Event;
    
    // Check remaining capacity
    const registrationsQuery = query(
      collection(db, 'registrations'),
      where('eventId', '==', registrationData.eventId),
      where('status', '==', 'confirmed')
    );
    
    const registrationsSnapshot = await getDocs(registrationsQuery);
    
    if (registrationsSnapshot.size >= eventData.capacity) {
      throw new Error('Event has reached maximum capacity');
    }
    
    // Create registration
    const registrationRef = await addDoc(collection(db, 'registrations'), {
      ...registrationData,
      registrationDate: serverTimestamp(),
      status: 'confirmed',
      paymentStatus: eventData.price > 0 ? 'unpaid' : 'paid'
    });
    
    return registrationRef.id;
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
};

// Get user registrations
export const getUserRegistrations = async (userId: string): Promise<EventRegistration[]> => {
  try {
    const q = query(
      collection(db, 'registrations'),
      where('userId', '==', userId),
      orderBy('registrationDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EventRegistration);
  } catch (error) {
    console.error('Error getting user registrations:', error);
    throw error;
  }
};

// Get event registrations (for organizers)
export const getEventRegistrations = async (eventId: string): Promise<EventRegistration[]> => {
  try {
    const q = query(
      collection(db, 'registrations'),
      where('eventId', '==', eventId),
      orderBy('registrationDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EventRegistration);
  } catch (error) {
    console.error('Error getting event registrations:', error);
    throw error;
  }
};

// Submit feedback for an event
export const submitEventFeedback = async (
  registrationId: string, 
  feedback: { rating: number; comment: string; }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'registrations', registrationId), {
      feedback: {
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: serverTimestamp()
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

// Check in attendee
export const checkInAttendee = async (registrationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'registrations', registrationId), {
      checkInTime: serverTimestamp(),
      status: 'confirmed'
    });
  } catch (error) {
    console.error('Error checking in attendee:', error);
    throw error;
  }
};