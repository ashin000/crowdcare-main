import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Eye, AlertCircle } from "lucide-react";
import { getIssues, getCategories } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";

export default function AssignedIssues() {
  const { currentUser } = useAuthContext();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const loadAssigned = async () => {
      setLoading(true);
      try {
        const [list, cats] = await Promise.all([
          getIssues(),
          getCategories()
        ]);
        // Filter issues assigned to this official
        setIssues(list.filter(i => i.assignedAuthorityId === currentUser.uid));
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAssigned();
  }, [currentUser]);

  const filteredIssues = issues.filter(iss => {
    const matchStatus = statusFilter === "all" || iss.status === statusFilter;
    const matchPriority = priorityFilter === "all" || iss.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  return (
    <div className="animate-fade container">
      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Assigned Issues</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Civic reports routed to your department requiring field verification and resolution.
      </p>

      {/* Filter row */}
      <div className="glass-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            <Filter size={16} /> Filters
          </div>

          <div>
            <select className="form-control" style={{ width: "160px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <select className="form-control" style={{ width: "150px" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            Total Tickets: <strong>{filteredIssues.length}</strong>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading assigned tickets...</p>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>No assigned issues match the filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(iss => (
                  <tr key={iss.id}>
                    <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{iss.issueId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{iss.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{iss.location?.address}</div>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{iss.categoryName || iss.category}</td>
                    <td>
                      <span className={`badge badge-${iss.priority}`}>{iss.priority}</span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {new Date(iss.reportedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-status-${iss.status}`}>{iss.status.replace("_", " ")}</span>
                    </td>
                    <td>
                      <Link 
                        to={`/issues/${iss.id}`} 
                        className="btn btn-secondary" 
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", gap: "0.3rem" }}
                      >
                        <Eye size={12} /> Manage
                      </Link>
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
