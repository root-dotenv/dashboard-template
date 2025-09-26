import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginPayload, LoginResponse, UserProfile } from "./auth-types";
import ssoClient from "@/api/auth-client";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  setTokens: (tokens: { access: string; refresh: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (tokens) => {
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        });
      },

      login: async (payload) => {
        const response = await ssoClient.post<LoginResponse>(
          "/auth/login",
          payload
        );
        const { access_token, refresh_token } = response.data;
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true,
        });
        await get().fetchUserProfile();
      },

      fetchUserProfile: async () => {
        const { accessToken } = get();
        if (accessToken) {
          const response = await ssoClient.get<UserProfile>("/auth/profile", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          set({ user: response.data });
        }
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        // Optionally, you could also call a /logout endpoint on the server here
      },
    }),
    {
      name: "auth-storage", // This name determines the key in localStorage
    }
  )
);
