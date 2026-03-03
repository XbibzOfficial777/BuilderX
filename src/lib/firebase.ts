import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAwitkeoSDxHgfQn4-eQ8t4_2BZ77ceIyo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-pcuih.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://studio-pcuih-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-pcuih",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-pcuih.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "262161066351",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:262161066351:web:9957c8bd83f196dcc5e09a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const storage = getStorage(app);

export const CATBOX_USERHASH = process.env.NEXT_PUBLIC_CATBOX_USERHASH || "7eca8a232dfe09aeebe1fa29e";
export const CATBOX_API_URL = "https://catbox.moe/user/api.php";

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: number;
  thumbnail?: string;
}

export interface Album {
  short: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  files: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  location: string;
  website: string;
  joinedAt: number;
  lastLogin: number;
  emailVerified: boolean;
  fileCount: number;
  totalStorageUsed: number;
}

export interface Chat {
  id: string;
  participants: Record<string, boolean>;
  createdAt: number;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
    type: string;
    mediaUrl?: string;
  };
}

export interface Reaction {
  emoji: string;
  userId: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  mediaSize?: number;
  mediaName?: string;
  readBy: Record<string, number>;
  replyTo?: string;
  reactions?: Record<string, Reaction>; // key: reactionId
  deletedFor?: Record<string, boolean>; // userId -> true
  deletedForEveryone?: boolean;
}
