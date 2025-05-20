import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("authUser"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const email = user.email || "";
  const isAuthorized = email.endsWith("@lumieregyn.com.br");

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
