import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
import { getUsers, updateUserRole } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";

export default function ManageUsers() {
  const { currentUser } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsersList = async () => {
    setLoading(true);
    try {
      const allUsers = await getUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  const handleApprovePromotion = async (userId, targetRole, department) => {
    try {
      await updateUserRole(userId, targetRole, department || "", "approved", currentUser);
      alert(`Successfully promoted user to ${targetRole}!`);
      await loadUsersList();
    } catch (err) {
      alert("Failed to approve promotion request.");
    }
  };

  const handleRejectPromotion = async (userId) => {
    try {
      await updateUserRole(userId, "", "", "rejected", currentUser);
      alert("Promotion request rejected.");
      await loadUsersList();
    } catch (err) {
      alert("Failed to reject promotion request.");
    }
  };

  const pendingRequests = users.filter(u => u.promotionStatus === "pending");
  const verifiedUsers = users.filter(u => u.isVerified || u.identityVerification?.status === "verified");

  return (
    <div className="animate-fade container">
      {/* Back button */}
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Manage Users & Promotions</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Review citizen KYC verifications, approve field volunteers, and assign municipal authority roles.
      </p>

      {/* Promotion requests queue */}
      <div className="glass-card animate-scale" style={{ border: pendingRequests.length > 0 ? "1px solid var(--warning)" : "1px solid var(--border)", padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", color: pendingRequests.length > 0 ? "var(--warning)" : "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <AlertCircle size={20} />
          Pending Role Applications ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
            No pending promotion applications to review.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Requested Role</th>
                  <th>Department / Jurisdiction</th>
                  <th>Reference Notes</th>
                  <th>Action Approval</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(app => (
                  <tr key={app.uid}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.name || app.fullName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{app.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-low" style={{ background: "rgba(255,255,255,0.05)", textTransform: "uppercase" }}>{app.requestedRole}</span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{app.requestedDept || "General"}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "250px" }}>{app.promotionNotes}</td>
                    <td style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        onClick={() => handleApprovePromotion(app.uid, app.requestedRole, app.requestedDept)}
                        className="btn btn-primary"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", background: "var(--success)", display: "inline-flex", gap: "0.25rem" }}
                      >
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button 
                        onClick={() => handleRejectPromotion(app.uid)}
                        className="btn btn-danger"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.25rem" }}
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Users database Table */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={20} color="var(--primary)" />
          User Registry ({users.length})
        </h3>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading user database...</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Account Role</th>
                  <th>Location</th>
                  <th>KYC Identity</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.fullName || u.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{u.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-low" style={{ background: "rgba(255,255,255,0.05)", textTransform: "capitalize" }}>{u.role}</span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {u.city ? `${u.city}, ${u.state}` : "Unprovided"}
                    </td>
                    <td>
                      {u.isVerified || u.identityVerification?.status === "verified" ? (
                        <span className="badge badge-status-resolved" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
                          <ShieldCheck size={12} /> Aadhaar Verified
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Not Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
