import { create } from "zustand";

type User = {
  id: number;
  username: string;
  email: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setInitialized: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setInitialized: () =>
    set({
      initialized: true,
    }),
}));
