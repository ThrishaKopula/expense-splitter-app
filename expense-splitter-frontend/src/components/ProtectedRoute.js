import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Usage in App.js

export default ProtectedRoute;