import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AxiosError } from "axios";
import authClient from "@/api/auth-client";
import { toastError, toastSuccess } from "@/utils/toast";

// --- Type Definitions ---
export interface LoginCredentials {
  identifier: string; // Can be email or phone
  password: string;
}

export interface UserProfile {
  id: string; // This is the main member/profile ID
  user_id: string;
  role_id: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
}

// --- State and Actions Interface ---
interface AuthState {
  userProfile: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean; // To prevent concurrent refresh requests
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  refreshTokenAction: () => Promise<string | null>;
}

// --- Initial State ---
const initialState: Omit<
  AuthState,
  "login" | "logout" | "fetchUserProfile" | "refreshTokenAction"
> = {
  userProfile: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

// --- Zustand Store Definition ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- Login Action ---
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Get tokens from the login endpoint
          const tokenResponse = await authClient.post(
            "/auth/login",
            credentials
          );
          const { access_token, refresh_token } = tokenResponse.data;

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          // 2. Fetch the user's profile using the new access token
          await get().fetchUserProfile();

          // 3. Finalize state
          set({
            isAuthenticated: true,
            isLoading: false,
          });

          toastSuccess({
            title: "Login Successful!",
            description: "Redirecting to your dashboard...",
          });
        } catch (error) {
          const errorMessage = parseAxiosError(error);
          toastError({
            title: "Authentication Failed",
            description: errorMessage,
          });
          set({ ...initialState, error: errorMessage }); // Reset state on failure
          throw new Error(errorMessage);
        }
      },

      // --- Fetch User Profile Action ---
      fetchUserProfile: async () => {
        try {
          const response = await authClient.get("/auth/profile");
          // The profile data is nested inside a 'profile' object in the response
          const { profile } = response.data;
          set({ userProfile: profile });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // If profile fetch fails, it could be a stale/invalid token, so logout.
          await get().logout();
        }
      },

      // --- Token Refresh Action ---
      refreshTokenAction: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          get().logout();
          return null;
        }
        if (get().isRefreshing) {
          // If a refresh is already happening, this prevents a race condition.
          // It waits until the ongoing refresh is done and returns the new token.
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!get().isRefreshing) {
                clearInterval(interval);
                resolve(get().accessToken);
              }
            }, 100);
          });
        }
        set({ isRefreshing: true });
        try {
          const response = await authClient.post("/auth/refresh", {
            refresh_token: currentRefreshToken,
          });
          const { access_token, refresh_token } = response.data;
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });
          return access_token;
        } catch (error) {
          console.error("Failed to refresh token:", error);
          get().logout(); // Logout if refresh token is invalid/expired
          return null;
        } finally {
          set({ isRefreshing: false });
        }
      },

      // --- Logout Action ---
      logout: async () => {
        const token = get().accessToken;
        set({ isLoading: true });
        try {
          if (token) {
            await authClient.post("/auth/logout");
          }
        } catch (error) {
          console.error("Logout API call failed, cleaning up locally:", error);
        } finally {
          set({ ...initialState });
          // Force a redirect to the login page after state is cleared
          window.location.replace("/login");
        }
      },
    }),
    {
      name: "auth-storage", // Key for localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist these specific fields to keep the user logged in
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        userProfile: state.userProfile, // Persist profile to avoid re-fetching on every load
      }),
    }
  )
);

// --- Helper function to parse errors from Axios ---
function parseAxiosError(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    // The API returns errors in 'message' or 'detail' properties
    return data.message || data.detail || "An unexpected error occurred.";
  }
  return "An unexpected server error occurred. Please try again.";
}

// --- Custom hook to easily access user IDs ---
export const useUserIds = () => {
  return useAuthStore((state) => ({
    id: state.userProfile?.id,
    user_id: state.userProfile?.user_id,
    role_id: state.userProfile?.role_id,
  }));
};
