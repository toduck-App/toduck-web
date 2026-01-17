import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  accessToken: string | null;
  userId: number | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (accessToken: string, userId: number) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAccessToken: (token: string) =>
        set({ accessToken: token }),

      setUser: (user: User) =>
        set({ user }),

      login: (accessToken: string, userId: number) =>
        set({
          accessToken,
          userId,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          accessToken: null,
          userId: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'toduck-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
