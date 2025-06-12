import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC2ja4f2wZSWMv-j9F-neGprvMWkmeflYU",
  authDomain: "event-ease-6b2b8.firebaseapp.com",
  projectId: "event-ease-6b2b8",
  storageBucket: "event-ease-6b2b8.firebasestorage.app",
  messagingSenderId: "287387866898",
  appId: "1:287387866898:web:c783662be24f345280c5cb",
  measurementId: "G-L2L86PQPKF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
export default app;