import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles }) {
  const { currentUser, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading user role details...</p>
      </div>
    );
  }

  const role = currentUser?.role || "citizen";
  const isAuthorized = allowedRoles.includes(role);

  return isAuthorized ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
