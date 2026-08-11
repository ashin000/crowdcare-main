import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import CitizenDashboard from "./CitizenDashboard";
import AuthorityDashboard from "./authority/AuthorityDashboard";
import VolunteerDashboard from "./volunteer/VolunteerDashboard";
import AdminDashboard from "./admin/AdminDashboard";

export default function Dashboard() {
  const { currentUser, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading dashboard portal...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  const role = currentUser.role || "citizen";
  
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "authority":
    case "official":
      return <AuthorityDashboard />;
    case "volunteer":
      return <VolunteerDashboard />;
    case "citizen":
    default:
      return <CitizenDashboard />;
  }
}
