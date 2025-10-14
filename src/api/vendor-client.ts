import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const baseURL = "http://vendor.safaripro.net/api/v1";

const vendorClient = axios.create({
  baseURL: baseURL,
  timeout: 15000,
});

vendorClient.interceptors.request.use(
  (config) => {
    // Attach the access token if it exists
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error(`An Error has occurred with the request: ${error.message}`);
    return Promise.reject(error);
  }
);

// --- Response interceptor with token refresh logic ---
vendorClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await useAuthStore
          .getState()
          .refreshTokenAction();
        if (newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return vendorClient(originalRequest);
        } else {
          return Promise.reject(error);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default vendorClient;
