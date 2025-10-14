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
