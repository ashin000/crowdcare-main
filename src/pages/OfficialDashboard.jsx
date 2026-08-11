import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Clock, Inbox, Megaphone, Radio, Send, Search, ShieldCheck, Plus, X } from "lucide-react";
import { dbService } from "../services/firebase";

const STATUS_OPTIONS = ["reported", "acknowledged", "in_progress", "resolved", "rejected"];

export default function OfficialDashboard({ currentUser, onSelectIssue }) {
  const [issues, setIssues] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Create announcement
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "" });

  // Create poll
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollForm, setPollForm] = useState({ title: "", description: "", options: ["", ""] });

  // Status update
  const [statusUpdateFor, setStatusUpdateFor] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "acknowledged", description: "" });

  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issueList, annList, pollList] = await Promise.all([
        dbService.getIssues(),
        dbService.getAnnouncements(),
        dbService.getPolls()
      ]);
      setIssues(issueList);
      setAnnouncements(annList);
      setPolls(pollList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await dbService.createAnnouncement(annForm, currentUser);
      setSuccessMsg("Announcement published successfully to all citizens!");
      setAnnForm({ title: "", content: "" });
      setShowAnnForm(false);
      setTimeout(() => setSuccessMsg(""), 5000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to create announcement.");
    }
  };

  const handlePollSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const options = pollForm.options.map(o => o.trim()).filter(o => o);
    if (options.length < 2) {
      setError("Please provide at least 2 poll options.");
      return;
    }
    try {
      await dbService.createPoll({ ...pollForm, options }, currentUser);
      setSuccessMsg("Poll created and sent to all citizens!");
      setPollForm({ title: "", description: "", options: ["", ""] });
      setShowPollForm(false);
      setTimeout(() => setSuccessMsg(""), 5000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to create poll.");
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await dbService.updateIssueStatus(
        statusUpdateFor.id,
        statusForm.status,
        statusForm.description,
        currentUser
      );
      setSuccessMsg(`Issue ${statusUpdateFor.issue_id} updated to ${statusForm.status.replace("_", " ")}!`);
      setStatusUpdateFor(null);
      setStatusForm({ status: "acknowledged", description: "" });
      setTimeout(() => setSuccessMsg(""), 5000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  };

  const handlePollOptionChange = (idx, value) => {
    const options = [...pollForm.options];
    options[idx] = value;
    setPollForm({ ...pollForm, options });
  };

  const addPollOption = () => {
    setPollForm({ ...pollForm, options: [...pollForm.options, ""] });
  };

  const removePollOption = (idx) => {
    if (pollForm.options.length <= 2) return;
    setPollForm({ ...pollForm, options: pollForm.options.filter((_, i) => i !== idx) });
  };

  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    if (priorityFilter !== "all" && issue.priority !== priorityFilter) return false;
    if (search && !`${issue.title} ${issue.description} ${issue.location} ${issue.issue_id} ${issue.citizenName}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: issues.length,
    reported: issues.filter(i => i.status === "reported").length,
    inProgress: issues.filter(i => i.status === "in_progress" || i.status === "acknowledged").length,
    resolved: issues.filter(i => i.status === "resolved" || i.status === "closed").length,
    critical: issues.filter(i => i.priority === "critical" && i.status !== "resolved" && i.status !== "closed").length
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
            Official Dashboard {currentUser.department && (
              <span style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                background: "var(--success-light)",
                color: "var(--success)",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                marginLeft: "0.5rem",
                verticalAlign: "middle"
              }}>
                {currentUser.department}
              </span>
            )}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage civic issues, post announcements, and launch polls.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            className={`btn ${showAnnForm ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setShowAnnForm(!showAnnForm)}
          >
            {showAnnForm ? <X size={16} /> : <Megaphone size={16} />}
            {showAnnForm ? "Cancel" : "New Announcement"}
          </button>
          <button
            className={`btn ${showPollForm ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setShowPollForm(!showPollForm)}
          >
            {showPollForm ? <X size={16} /> : <Radio size={16} />}
            {showPollForm ? "Cancel" : "New Poll"}
          </button>
        </div>
      </div>

      {/* Success/Error messages */}
      {successMsg && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--success-light)",
          border: "1px solid rgba(82, 171, 152, 0.3)",
          color: "var(--success)",
          padding: "1rem 1.25rem",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {error && (
        <div style={{
          background: "var(--danger-light)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "var(--danger)",
          padding: "0.75rem 1rem",
          borderRadius: "12px",
          fontSize: "0.9rem",
          marginBottom: "1.5rem"
        }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        {[
          { label: "Total Reports", value: stats.total, color: "var(--info)", icon: <Inbox size={20} /> },
          { label: "New (Reported)", value: stats.reported, color: "var(--primary)", icon: <AlertTriangle size={20} /> },
          { label: "In Progress", value: stats.inProgress, color: "var(--warning)", icon: <Clock size={20} /> },
          { label: "Resolved", value: stats.resolved, color: "var(--success)", icon: <CheckCircle2 size={20} /> },
          { label: "Critical Open", value: stats.critical, color: "var(--danger)", icon: <AlertTriangle size={20} /> }
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ color: stat.color, marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Announcement Form */}
      {showAnnForm && (
        <div className="glass-card animate-scale" style={{ marginBottom: "2rem", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={20} color="var(--info)" /> Publish Announcement
          </h2>
          <form onSubmit={handleAnnouncementSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Water Supply Shutdown - Ward 3"
                value={annForm.title}
                onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Detailed announcement content..."
                value={annForm.content}
                onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Publish to All Citizens
            </button>
          </form>
        </div>
      )}

      {/* Poll Form */}
      {showPollForm && (
        <div className="glass-card animate-scale" style={{ marginBottom: "2rem", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Radio size={20} color="var(--warning)" /> Create Civic Poll
          </h2>
          <form onSubmit={handlePollSubmit}>
            <div className="form-group">
              <label className="form-label">Poll Question</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Where should the new park be built?"
                value={pollForm.title}
                onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Additional context for the poll..."
                value={pollForm.description}
                onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Options</label>
              {pollForm.options.map((opt, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                    required
                  />
                  {pollForm.options.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removePollOption(idx)}
                      style={{ padding: "0 1rem" }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addPollOption} style={{ fontSize: "0.85rem" }}>
                <Plus size={14} /> Add Option
              </button>
            </div>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Launch Poll
            </button>
          </form>
        </div>
      )}

      {/* Issues Management */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Inbox size={20} color="var(--primary)" /> Issue Management
        </h2>

        {/* Filters */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
          alignItems: "center"
        }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search issue, ID, citizen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.6rem 1rem 0.6rem 2.5rem",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.2)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                width: "220px"
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.2)",
              color: "var(--text-primary)",
              fontSize: "0.85rem"
            }}
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.2)",
              color: "var(--text-primary)",
              fontSize: "0.85rem"
            }}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Issues table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <p>Loading issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <Inbox size={40} opacity={0.5} style={{ marginBottom: "1rem" }} />
            <p>No issues match your filters.</p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>Title</th>
                    <th>Citizen</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Upvotes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map(issue => (
                    <tr key={issue.id}>
                      <td style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {issue.issue_id}
                      </td>
                      <td>
                        <button
                          onClick={() => onSelectIssue(issue)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--primary)",
                            fontWeight: 600,
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          {issue.title}
                        </button>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {new Date(issue.reportedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>{issue.citizenName}</td>
                      <td style={{ fontSize: "0.85rem" }}>{issue.categoryName}</td>
                      <td>
                        <span className={`badge badge-${issue.priority}`}>{issue.priority}</span>
                      </td>
                      <td>
                        <span className={`badge badge-status-${issue.status}`}>
                          {issue.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>{issue.upvotes}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setStatusUpdateFor(issue);
                            setStatusForm({ status: issue.status === "reported" ? "acknowledged" : issue.status, description: "" });
                          }}
                          style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Status update modal */}
      {statusUpdateFor && (
        <div className="modal-backdrop animate-fade" onClick={() => setStatusUpdateFor(null)}>
          <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={22} color="var(--success)" />
                Update Issue Status
              </h2>
              <button className="btn btn-secondary" onClick={() => setStatusUpdateFor(null)} style={{ padding: "0.4rem", borderRadius: "50%", minWidth: "32px", height: "32px" }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                padding: "1rem",
                borderRadius: "10px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                marginBottom: "1.5rem"
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  {statusUpdateFor.issue_id} • {statusUpdateFor.categoryName}
                </div>
                <div style={{ fontWeight: 700 }}>{statusUpdateFor.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  {statusUpdateFor.description}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Reported by {statusUpdateFor.citizenName} at {statusUpdateFor.location}
                </div>
              </div>

              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-control"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Update Message</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe what action was taken..."
                    value={statusForm.description}
                    onChange={(e) => setStatusForm({ ...statusForm, description: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStatusUpdateFor(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} /> Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recent announcements */}
      {announcements.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={20} color="var(--info)" /> Your Recent Announcements
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {announcements.slice(0, 3).map(ann => (
              <div key={ann.id} className="glass-card" style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <div style={{ fontWeight: 700 }}>{ann.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {ann.content.length > 120 ? ann.content.substring(0, 120) + "..." : ann.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent polls */}
      {polls.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Radio size={20} color="var(--warning)" /> Your Recent Polls
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {polls.slice(0, 3).map(poll => {
              const totalVotes = Object.values(poll.votes || {}).reduce((sum, v) => sum + v, 0);
              return (
                <div key={poll.id} className="glass-card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <div style={{ fontWeight: 700 }}>{poll.title}</div>
                    <span className="badge badge-medium">
                      {totalVotes} vote{totalVotes !== 1 && "s"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {poll.options.join(" • ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}