import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  isLoggedIn: boolean;
  profileComplete: boolean;

  login: (token: string, profileCompleted?: boolean) => void;
  logout: () => void;
  completeProfile: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isLoggedIn: false,
      profileComplete: false,

      login: (token, profileCompleted = false) =>
        set({
          token,
          isLoggedIn: true,
          profileComplete: profileCompleted,
        }),

      logout: () =>
        set({
          token: null,
          isLoggedIn: false,
          profileComplete: false,
        }),

      completeProfile: () =>
        set({
          profileComplete: true,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
