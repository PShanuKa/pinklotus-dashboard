import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { logoutApi } from '../api/auth.api';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (data: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, accessToken: token, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await logoutApi();
        } catch (err) {
          console.error('Logout failed on server');
        } finally {
          delete apiClient.defaults.headers.common['Authorization'];
          set({ user: null, accessToken: null, isAuthenticated: false });
          // Optional: redirect to login
          window.location.href = '/login';
        }
      },
      updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
    }),
    {
      name: 'dashboard-auth-storage',
    }
  )
);
