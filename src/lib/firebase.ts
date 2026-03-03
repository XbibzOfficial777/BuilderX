import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwitkeoSDxHgfQn4-eQ8t4_2BZ77ceIyo",
  authDomain: "studio-pcuih.firebaseapp.com",
  databaseURL: "https://studio-pcuih-default-rtdb.firebaseio.com",
  projectId: "studio-pcuih",
  storageBucket: "studio-pcuih.firebasestorage.app",
  messagingSenderId: "262161066351",
  appId: "1:262161066351:web:9957c8bd83f196dcc5e09a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const storage = getStorage(app);

export const CATBOX_USERHASH = "5248d18542a1e43ae36a18ba0";
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
