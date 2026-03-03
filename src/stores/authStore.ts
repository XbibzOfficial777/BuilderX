import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FirebaseUser } from '@/lib/firebase';
import { onAuthChange } from '@/lib/firebase';

interface AuthState {
  user: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
    }),
    {
      name: 'flutterforge-auth',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth listener
let unsubscribe: (() => void) | null = null;

export const initAuthListener = () => {
  if (unsubscribe) return;
  
  const { setUser, setLoading } = useAuthStore.getState();
  setLoading(true);
  
  unsubscribe = onAuthChange((user) => {
    setUser(user);
  });
};

export const cleanupAuthListener = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};
