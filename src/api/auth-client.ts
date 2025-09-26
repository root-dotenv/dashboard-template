// // src/api/auth-client.ts

// import axios from "axios";
// import { useAuthStore } from "@/store/auth.store";

// const authClient = axios.create({
//   baseURL: import.meta.env.VITE_SSO_BASE_URL,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request Interceptor: Attaches the access token to every outgoing request.
// authClient.interceptors.request.use(
//   (config) => {
//     const { accessToken } = useAuthStore.getState();
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     console.log(`- - - Request Log: authClient`, config);
//     return config;
//   },
//   (error) => {
//     console.log(`An Error has occurred: ${error.message}`);
//     return Promise.reject(error);
//   }
// );

// // Response Interceptor: Handles responses and errors.
// authClient.interceptors.response.use(
//   (response) => {
//     console.log(`- - - Response Log: authClient`, response);
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       console.log(`401 Unauthorized Error: authClient`, error.message);
//       // On a 401 error, we log the user out to clear the invalid session data.
//       useAuthStore.getState().logout();
//     }
//     return Promise.reject(error);
//   }
// );

// export default authClient;

// - - - src/api/sso-client.ts
import axios from "axios";

const ssoClient = axios.create({
  baseURL: import.meta.env.VITE_SSO_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

ssoClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ssoClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default ssoClient;
