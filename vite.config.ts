// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- ADDED: PROXY CONFIGURATION FOR DEVELOPMENT ---
  server: {
    proxy: {
      // Proxy for SSO/Authentication API
      "/api/sso": {
        target: "http://sso.safaripro.net/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sso/, ""),
      },
      // Proxy for Hotel API
      "/api/hotel": {
        target: "http://hotel.safaripro.net/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hotel/, ""),
      },
      // Proxy for Booking API
      "/api/booking": {
        target: "http://booking.safaripro.net/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/booking/, ""),
      },
      // Proxy for Vendor API
      "/api/vendor": {
        target: "http://vendor.safaripro.net/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vendor/, ""),
      },
      // Proxy for Payment API
      "/api/payment": {
        target: "http://payment.safaripro.net/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payment/, ""),
      },
      // Proxy for Billing API
      "/api/billing": {
        target: "http://billing.safaripro.net/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/billing/, ""),
      },
    },
  },
});
