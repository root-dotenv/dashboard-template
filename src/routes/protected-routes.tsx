// - - - src/routes/protected-routes.tsx
import { useAuthStore } from "../store/auth.store";
import { Navigate, Outlet } from "react-router-dom";

/**
 * --- Protected Route ---
 * If the user is authenticated, it renders the child components (the dashboard).
 * If the user is NOT authenticated, it redirects them to the /login page.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * --- Public Route ---
 * If the user is NOT authenticated, it renders the child components (the login page).
 * If the user IS authenticated, it redirects them away from the login page to the dashboard root (/).
 */
export const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
