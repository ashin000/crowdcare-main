import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Filter, AlertCircle, RefreshCw } from "lucide-react";
import { getAuditLogs } from "../../firebase/firestore";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    const matchRole = roleFilter === "all" || log.actorRole === roleFilter;
    return matchAction && matchRole;
  });

  return (
    <div className="animate-fade container">
      {/* Back button */}
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Security Audit Trails</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Review administrative overrides, user role modifications, and ticket status changes.
      </p>

      {/* Filter toolbar */}
      <div className="glass-card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            <Filter size={16} /> Filters
          </div>

          <div>
            <select className="form-control" style={{ width: "180px" }} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="USER_ROLE_PROMOTED">User Role Promoted</option>
              <option value="USER_ROLE_REJECTED">User Role Rejected</option>
              <option value="ISSUE_STATUS_CHANGED">Issue Status Changed</option>
              <option value="ISSUE_ASSIGNED">Issue Assigned</option>
              <option value="ISSUE_RESOLVED">Issue Resolved</option>
              <option value="ISSUE_MARKED_SPAM">Issue Marked Spam</option>
              <option value="ISSUE_DELETED">Issue Deleted</option>
            </select>
          </div>

          <div>
            <select className="form-control" style={{ width: "150px" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Actor Roles</option>
              <option value="admin">Admin</option>
              <option value="authority">Authority</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <button onClick={loadLogs} className="btn btn-secondary" style={{ padding: "0.5rem", marginLeft: "auto" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Logs registry */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading system logs...</p>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>No audit logs match selected filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Trigger</th>
                  <th>Actor Role (ID)</th>
                  <th>Target ID</th>
                  <th>Previous</th>
                  <th>New Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-low" style={{ background: "rgba(255,255,255,0.05)", textTransform: "uppercase" }}>{log.action.replace(/_/g, " ")}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{log.actorRole}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>ID: {log.actorId}</div>
                    </td>
                    <td>{log.issueId || "System"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{log.previousValue || "-"}</td>
                    <td style={{ color: "var(--primary)", fontWeight: 600 }}>{log.newValue || "-"}</td>
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
