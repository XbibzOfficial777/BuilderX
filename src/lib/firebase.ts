import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push, 
  update,
  remove,
  onValue,
  off,
  type DatabaseReference
} from 'firebase/database';

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAwitkeoSDxHgfQn4-eQ8t4_2BZ77ceIyo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'studio-pcuih.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'studio-pcuih',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'studio-pcuih.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '262161066351',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:262161066351:web:9957c8bd83f196dcc5e09a',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://studio-pcuih-default-rtdb.firebaseio.com',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Database functions
export const createProject = async (userId: string, projectData: {
  name: string;
  widgetTree: unknown;
  thumbnail?: string;
}) => {
  try {
    const projectsRef = ref(database, `users/${userId}/projects`);
    const newProjectRef = push(projectsRef);
    const timestamp = Date.now();
    
    await set(newProjectRef, {
      ...projectData,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    
    return { projectId: newProjectRef.key, error: null };
  } catch (error) {
    return { projectId: null, error: error as Error };
  }
};

export const updateProject = async (userId: string, projectId: string, updates: {
  name?: string;
  widgetTree?: unknown;
  thumbnail?: string;
}) => {
  try {
    const projectRef = ref(database, `users/${userId}/projects/${projectId}`);
    await update(projectRef, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const deleteProject = async (userId: string, projectId: string) => {
  try {
    const projectRef = ref(database, `users/${userId}/projects/${projectId}`);
    await remove(projectRef);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getProject = async (userId: string, projectId: string) => {
  try {
    const projectRef = ref(database, `users/${userId}/projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      return { project: { id: projectId, ...snapshot.val() }, error: null };
    }
    return { project: null, error: new Error('Project not found') };
  } catch (error) {
    return { project: null, error: error as Error };
  }
};

export const getUserProjects = async (userId: string) => {
  try {
    const projectsRef = ref(database, `users/${userId}/projects`);
    const snapshot = await get(projectsRef);
    
    if (snapshot.exists()) {
      const projects: Array<{ id: string; [key: string]: unknown }> = [];
      snapshot.forEach((childSnapshot) => {
        projects.push({
          id: childSnapshot.key!,
          ...childSnapshot.val(),
        });
      });
      return { projects, error: null };
    }
    return { projects: [], error: null };
  } catch (error) {
    return { projects: [], error: error as Error };
  }
};

export const subscribeToProjects = (
  userId: string, 
  callback: (projects: Array<{ id: string; [key: string]: unknown }>) => void
) => {
  const projectsRef = ref(database, `users/${userId}/projects`);
  
  const unsubscribe = onValue(projectsRef, (snapshot) => {
    if (snapshot.exists()) {
      const projects: Array<{ id: string; [key: string]: unknown }> = [];
      snapshot.forEach((childSnapshot) => {
        projects.push({
          id: childSnapshot.key!,
          ...childSnapshot.val(),
        });
      });
      callback(projects);
    } else {
      callback([]);
    }
  });
  
  return () => off(projectsRef, 'value', unsubscribe);
};

export { ref, onValue, off };
export type { FirebaseUser, DatabaseReference };
