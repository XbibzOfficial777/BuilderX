'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setFirebaseUser, setLoading, logout } = useAuthStore();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Check if user exists in our database
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName,
              avatar: userData.avatar || firebaseUser.photoURL,
              firebaseUid: firebaseUser.uid,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          } else {
            // Create new user in database
            const newUser = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              avatar: firebaseUser.photoURL || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            
            setUser({
              id: firebaseUser.uid,
              email: newUser.email,
              name: newUser.name,
              avatar: newUser.avatar,
              firebaseUid: firebaseUser.uid,
              createdAt: newUser.createdAt,
              updatedAt: newUser.updatedAt,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setFirebaseUser, setLoading, db]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      name: name || '',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    logout();
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
