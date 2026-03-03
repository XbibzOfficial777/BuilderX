import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAwitkeoSDxHgfQn4-eQ8t4_2BZ77ceIyo",
  authDomain: "studio-pcuih.firebaseapp.com",
  databaseURL: "https://studio-pcuih-default-rtdb.firebaseio.com",
  projectId: "studio-pcuih",
  storageBucket: "studio-pcuih.firebasestorage.app",
  messagingSenderId: "262161066351",
  appId: "1:262161066351:web:9957c8bd83f196dcc5e09a"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, database, googleProvider };
