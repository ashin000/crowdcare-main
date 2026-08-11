import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, Eye, ShieldAlert, Trash2, AlertCircle } from "lucide-react";
import { getIssues, getCategories, markSpam, deleteIssue } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";

export default function ManageIssues() {
  const { currentUser } = useAuthContext();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [spamFilter, setSpamFilter] = useState("all"); // all, spam, non-spam

  const loadIssues = async () => {
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        getIssues(),
        getCategories()
      ]);
      setIssues(list);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleToggleSpam = async (issueId, currentSpam) => {
    try {
      await markSpam(issueId, !currentSpam, currentUser);
      alert(!currentSpam ? "Issue marked as spam." : "Spam flag removed.");
      await loadIssues();
    } catch (err) {
      alert("Failed to update spam flag.");
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue? This action is logged in audit trails.")) return;
    try {
      await deleteIssue(issueId, currentUser);
      alert("Issue deleted.");
      await loadIssues();
    } catch (err) {
      alert("Failed to delete issue.");
    }
  };

  const filteredIssues = issues.filter(iss => {
    const matchCat = catFilter === "all" || iss.category === catFilter;
    const matchStatus = statusFilter === "all" || iss.status === statusFilter;
    
    let matchSpam = true;
    if (spamFilter === "spam") matchSpam = iss.isSpam === true;
    if (spamFilter === "non-spam") matchSpam = !iss.isSpam;

    return matchCat && matchStatus && matchSpam;
  });

  return (
    <div className="animate-fade container">
      {/* Back button */}
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Moderate Civic Issues</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Review public tickets, moderate spam indicators, and perform administrative overrides.
      </p>

      {/* Filter toolbar */}
      <div className="glass-card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            <SlidersHorizontal size={16} /> Filters
          </div>

          <div>
            <select className="form-control" style={{ width: "160px" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <select className="form-control" style={{ width: "150px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select className="form-control" style={{ width: "150px" }} value={spamFilter} onChange={(e) => setSpamFilter(e.target.value)}>
              <option value="all">All (Spam & Valid)</option>
              <option value="spam">Flagged Spam Only</option>
              <option value="non-spam">Exclude Spam</option>
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
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading civic tickets database...</p>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>No civic tickets match the selected filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Spam Flag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(iss => (
                  <tr key={iss.id} style={{ background: iss.isSpam ? "rgba(239, 68, 68, 0.02)" : "transparent" }}>
                    <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{iss.issueId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{iss.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{iss.location?.address}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${iss.priority}`}>{iss.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-status-${iss.status}`}>{iss.status.replace("_", " ")}</span>
                    </td>
                    <td>
                      {iss.isSpam ? (
                        <span className="badge badge-low" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: "0.75rem" }}>
                          Spam
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Clean</span>
                      )}
                    </td>
                    <td style={{ display: "flex", gap: "0.4rem" }}>
                      <Link to={`/issues/${iss.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", gap: "0.25rem" }}>
                        <Eye size={12} /> View
                      </Link>
                      <button 
                        onClick={() => handleToggleSpam(iss.id, iss.isSpam)}
                        className="btn btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "var(--warning)", border: "1px solid var(--warning)", background: "transparent" }}
                      >
                        <ShieldAlert size={12} /> {iss.isSpam ? "Unflag" : "Spam"}
                      </button>
                      <button 
                        onClick={() => handleDelete(iss.id)}
                        className="btn btn-danger"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        <Trash2 size={12} />
                      </button>
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
