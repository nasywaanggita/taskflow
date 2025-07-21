import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { userApi } from '@/lib/api/users';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Real Firebase authentication
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Get or create user in our API
          try {
            // Try to find user by Firebase UID
            const response = await userApi.getUserByFirebaseUID(firebaseUser.uid);
            set({ 
              user: response.data,
              firebaseUser,
              isAuthenticated: true,
              isLoading: false 
            });
          } catch (error) {
            // If user doesn't exist in our API, create one
            const newUserResponse = await userApi.createUser({
              name: firebaseUser.displayName || email.split('@')[0],
              email: firebaseUser.email!,
              firebase_uid: firebaseUser.uid,
            });
            
            set({ 
              user: newUserResponse.data,
              firebaseUser,
              isAuthenticated: true,
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Login failed');
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Create Firebase user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Create user in our API
          const response = await userApi.createUser({
            name,
            email,
            firebase_uid: firebaseUser.uid,
          });
          
          set({ 
            user: response.data,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Registration failed');
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ 
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setFirebaseUser: (firebaseUser: FirebaseUser | null) => {
        set({ firebaseUser });
      },

      initializeAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Get user from our API by Firebase UID
              const response = await userApi.getUserByFirebaseUID(firebaseUser.uid);
              set({ 
                user: response.data,
                firebaseUser,
                isAuthenticated: true,
                isLoading: false 
              });
            } catch (error) {
              // User exists in Firebase but not in our API
              set({ 
                firebaseUser,
                isAuthenticated: false,
                isLoading: false 
              });
            }
          } else {
            set({ 
              user: null,
              firebaseUser: null,
              isAuthenticated: false,
              isLoading: false 
            });
          }
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);