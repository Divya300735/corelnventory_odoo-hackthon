import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'staff';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    localStorage.removeItem('core_inventory_session');
    sessionStorage.removeItem('core_inventory_session');
    set({ user: null, isAuthenticated: false });
  },
}));
