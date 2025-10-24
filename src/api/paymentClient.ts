// src/api/paymentClient.ts
import axios from "axios";

// Base URL for the payment service
const PAYMENT_API_BASE_URL = "https://payment.safaripro.net/api/v1/";

const paymentClient = axios.create({
  baseURL: PAYMENT_API_BASE_URL,
  timeout: 30000, // Increased timeout for payment processing
  headers: {
    "Content-Type": "application/json",
    // Add any required Authorization headers here if needed
    // Example: 'Authorization': `Bearer ${token}`
  },
});

// Optional: Add interceptors like in bookingClient if needed for logging/auth
paymentClient.interceptors.request.use(
  (config) => {
    console.log(`- - - Request Log: paymentClient`, config);
    // TODO: Add token injection if required by payment API
    return config;
  },
  (error) => {
    console.error(`Payment Client Request Error: ${error.message}`);
    return Promise.reject(error);
  }
);

paymentClient.interceptors.response.use(
  (response) => {
    console.log(`- - - Response Log: paymentClient`, response);
    return response;
  },
  (error) => {
    console.error(
      `Payment Client Response Error: ${
        error.response?.data?.message || error.message
      }`
    );
    // Handle specific payment errors (e.g., insufficient funds, invalid number)
    return Promise.reject(error);
  }
);

export default paymentClient;
