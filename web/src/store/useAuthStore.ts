import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'patient' | 'doctor' | 'family' | null;

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'mediguardian-auth',
    }
  )
);
