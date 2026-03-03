'use client';

import { createContext, useContext, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { ref, set, get, update, onValue, off } from 'firebase/database';
import { auth, googleProvider, database } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import type { UserProfile } from '@/lib/firebase';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val() as UserProfile;
          setUser(userData);

          // Update last login
          await update(userRef, { lastLogin: Date.now() });
        } else {
          // User exists in Firebase Auth but not in Realtime DB
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.uid.slice(0, 8),
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || '',
            bio: '',
            location: '',
            website: '',
            joinedAt: Date.now(),
            lastLogin: Date.now(),
            emailVerified: firebaseUser.emailVerified,
            fileCount: 0,
            totalStorageUsed: 0,
          };
          await set(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    const usernameRef = ref(database, `usernames/${username.toLowerCase()}`);
    const snapshot = await get(usernameRef);
    return !snapshot.exists() || snapshot.val() === user?.uid;
  }, [user?.uid]);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);

    const newUser: UserProfile = {
      uid: credential.user.uid,
      email,
      username: username.toLowerCase(),
      displayName,
      photoURL: '',
      bio: '',
      location: '',
      website: '',
      joinedAt: Date.now(),
      lastLogin: Date.now(),
      emailVerified: false,
      fileCount: 0,
      totalStorageUsed: 0,
    };

    await set(ref(database, `users/${credential.user.uid}`), newUser);
    await set(ref(database, `usernames/${username.toLowerCase()}`), credential.user.uid);
  }, [checkUsernameAvailability]);

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);

    const userRef = ref(database, `users/${credential.user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      const username = credential.user.email?.split('@')[0] || credential.user.uid.slice(0, 8);
      let finalUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

      // Check if username exists
      let counter = 0;
      while (await get(ref(database, `usernames/${finalUsername}`)).then(s => s.exists())) {
        counter++;
        finalUsername = `${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}_${counter}`;
      }

      const newUser: UserProfile = {
        uid: credential.user.uid,
        email: credential.user.email || '',
        username: finalUsername,
        displayName: credential.user.displayName || 'User',
        photoURL: credential.user.photoURL || '',
        bio: '',
        location: '',
        website: '',
        joinedAt: Date.now(),
        lastLogin: Date.now(),
        emailVerified: credential.user.emailVerified,
        fileCount: 0,
        totalStorageUsed: 0,
      };

      await set(userRef, newUser);
      await set(ref(database, `usernames/${finalUsername}`), credential.user.uid);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, [setUser]);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user || !auth.currentUser) return;

    const updates: Partial<UserProfile> = { ...data };

    if (data.username && data.username !== user.username) {
      const isAvailable = await checkUsernameAvailability(data.username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      // Remove old username mapping
      await set(ref(database, `usernames/${user.username}`), null);
      // Add new username mapping
      await set(ref(database, `usernames/${data.username.toLowerCase()}`), user.uid);
      updates.username = data.username.toLowerCase();
    }

    // Update in Firebase Auth if displayName or photoURL changed
    if (data.displayName || data.photoURL) {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: data.displayName || user.displayName,
        photoURL: data.photoURL || user.photoURL,
      });
    }

    // Update in Realtime Database
    await update(ref(database, `users/${user.uid}`), updates);
    setUser({ ...user, ...updates });
  }, [user, setUser, checkUsernameAvailability]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!auth.currentUser || !user?.email) return;

    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfile,
        changePassword,
        checkUsernameAvailability,
      }}
    >
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
