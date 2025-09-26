// // - - - src/routes/protected-routes.tsx
// import { useAuthStore } from "@/store/auth.store";
// import { Navigate, Outlet } from "react-router-dom";

// /**
//  * If the user is authenticated, render the requested component.
//  * Otherwise, redirect them to the /login page.
//  */
// export const ProtectedRoute = () => {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
// };

// /**
//  * If the user is authenticated, redirect them away from public pages (like login)
//  * to the main dashboard. Otherwise, show the public page.
//  */
// export const PublicRoute = () => {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
// };

import { useAuthStore } from "@/store/auth.store";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
