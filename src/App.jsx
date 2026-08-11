import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Routing Guards
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Shared layout elements
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import SeedData from "./pages/SeedData";

// Protected Citizen Pages
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import Issues from "./pages/Issues";
import IssueDetails from "./pages/IssueDetails";
import TrackIssue from "./pages/TrackIssue";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// Protected Authority Pages
import AssignedIssues from "./pages/authority/AssignedIssues";

// Protected Volunteer Pages
import AssignedTasks from "./pages/volunteer/AssignedTasks";

// Protected Admin Pages
import ManageUsers from "./pages/admin/ManageUsers";
import ManageIssues from "./pages/admin/ManageIssues";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";
import ManagePolls from "./pages/admin/ManagePolls";
import AuditLogs from "./pages/admin/AuditLogs";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div style={{ 
            minHeight: "100vh", 
            display: "flex", 
            flexDirection: "column", 
            background: "var(--bg-dark)", 
            color: "var(--text-primary)",
            fontFamily: "var(--font-main)"
          }}>
            
            {/* Header navbar containing navigation controls */}
            <Navbar />

            {/* Central main route viewport */}
            <main style={{ flex: 1, padding: "2rem 0", minHeight: "75vh" }}>
              <Routes>
                {/* Public Access Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/seed" element={<SeedData />} />

                {/* General Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
                <Route path="/issues/:issueId" element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
                <Route path="/track" element={<ProtectedRoute><TrackIssue /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />

                {/* Citizen Specific Workflow */}
                <Route 
                  path="/report-issue" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["citizen"]}>
                        <ReportIssue />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />

                {/* Authority/Officer Specific Workflows */}
                <Route 
                  path="/authority/assigned" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["authority", "official"]}>
                        <AssignedIssues />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />

                {/* Volunteer Specific Workflows */}
                <Route 
                  path="/volunteer/tasks" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["volunteer"]}>
                        <AssignedTasks />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />

                {/* System Admin Specific Workflows */}
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ManageUsers />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/issues" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ManageIssues />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/announcements" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ManageAnnouncements />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/polls" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ManagePolls />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/audit" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <AuditLogs />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback Redirector */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* General platform footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
