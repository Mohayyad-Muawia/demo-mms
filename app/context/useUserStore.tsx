import { create } from "zustand";

export type UserType = {
  username: string;
  fullname: string;
  avatar: string;
  role: string;
};

type UserState = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
