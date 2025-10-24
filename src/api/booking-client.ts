// - - - src/api/booking-client.ts
import axios from "axios";

const bookingClient = axios.create({
  baseURL: "https://booking.safaripro.net/api/v1/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// * bookingClient (Request Interceptor)
bookingClient.interceptors.request.use(
  (config) => {
    console.log(`- - - Request Log: bookingClient`, config);
    return config;
  },
  (error) => {
    console.log(`An Error has occurred: ${error.message}`);
    return Promise.reject(error);
  }
);

// * bookingClient (Response Interceptor)
bookingClient.interceptors.response.use(
  (response) => {
    console.log(`- - - Response Log: bookingClient`, response);
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      console.log(`401 An Error has occured: bookingClient`, error.message);
      console.log("Unauthorized request. Redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default bookingClient;
