import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, MapPin, Camera, Plus, X, Search, Inbox } from "lucide-react";
import { dbService } from "../services/firebase";
import IssueCard from "../components/IssueCard";

export default function CitizenDashboard({ currentUser, onSelectIssue, initialTab }) {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || "all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    location: "",
    priority: "medium",
    imageUrl: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (activeTab === "report") setShowReportForm(true);
    else setShowReportForm(false);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issueList, catList] = await Promise.all([
        dbService.getIssues(),
        dbService.getCategories()
      ]);
      setIssues(issueList);
      setCategories(catList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (issueId) => {
    try {
      await dbService.upvoteIssue(issueId, currentUser.uid);
      setIssues(issues.map(i => i.id === issueId
        ? {
            ...i,
            upvotes: i.upvotedBy?.includes(currentUser.uid) ? i.upvotes - 1 : i.upvotes + 1,
            upvotedBy: i.upvotedBy?.includes(currentUser.uid)
              ? i.upvotedBy.filter(uid => uid !== currentUser.uid)
              : [...(i.upvotedBy || []), currentUser.uid]
          }
        : i
      ));
    } catch (err) {
      alert(err.message || "Failed to upvote issue");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError("");
    setSubmitting(true);
    try {
      if (!reportForm.categoryId) {
        setReportError("Please select a category.");
        setSubmitting(false);
        return;
      }
      await dbService.createIssue(reportForm, currentUser);
      setSuccessMsg("Your issue has been reported successfully!");
      setReportForm({ categoryId: "", title: "", description: "", location: "", priority: "medium", imageUrl: "" });
      setShowReportForm(false);
      setActiveTab("all");
      setTimeout(() => setSuccessMsg(""), 5000);
      loadData();
    } catch (err) {
      setReportError(err.message || "Failed to report issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    // Status filter
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    // My issues filter
    if (activeTab === "mine" && issue.citizenId !== currentUser.uid) return false;
    if (activeTab === "upvoted" && !issue.upvotedBy?.includes(currentUser.uid)) return false;
    // Search
    if (search && !`${issue.title} ${issue.description} ${issue.location} ${issue.categoryName}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const myIssues = issues.filter(i => i.citizenId === currentUser.uid);
  const resolvedCount = issues.filter(i => i.status === "resolved" || i.status === "closed").length;

  return (
    <div className="animate-fade">
      {/* Welcome Header */}
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
            Welcome, {currentUser.name.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Here's what's happening in your community.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowReportForm(!showReportForm)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {showReportForm ? <X size={18} /> : <Plus size={18} />}
          {showReportForm ? "Cancel" : "Report Issue"}
        </button>
      </div>

      {/* Success message */}
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

      {/* Stats cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        {[
          { label: "Total Issues", value: issues.length, color: "var(--info)" },
          { label: "My Reports", value: myIssues.length, color: "var(--primary)" },
          { label: "Resolved", value: resolvedCount, color: "var(--success)" }
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ textAlign: "center", padding: "1.25rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div className="glass-card animate-scale" style={{ marginBottom: "2rem", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={22} color="var(--danger)" />
            Report a New Issue
          </h2>

          <form onSubmit={handleReportSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={reportForm.categoryId}
                onChange={(e) => setReportForm({ ...reportForm, categoryId: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief summary of the problem"
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Describe the issue in detail — size, severity, how long it's been there..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <MapPin size={14} /> Location
                </span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Street name, landmark, area"
                value={reportForm.location}
                onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={reportForm.priority}
                  onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Camera size={14} /> Photo URL (optional)
                  </span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/photo.jpg"
                  value={reportForm.imageUrl}
                  onChange={(e) => setReportForm({ ...reportForm, imageUrl: e.target.value })}
                />
              </div>
            </div>

            {reportError && (
              <div style={{
                background: "var(--danger-light)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--danger)",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                marginBottom: "1.25rem"
              }}>
                {reportError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting Report..." : "Submit Report"}
            </button>
          </form>
        </div>
      )}

      {/* Tabs and Filters */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Issues" },
            { id: "mine", label: "My Reports" },
            { id: "upvoted", label: "Upvoted" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.5rem 1rem 0.5rem 2.5rem",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.2)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                width: "180px"
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.2)",
              color: "var(--text-primary)",
              fontSize: "0.85rem"
            }}
          >
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <p>Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <Inbox size={40} opacity={0.5} style={{ marginBottom: "1rem" }} />
          <p>No issues found{activeTab !== "all" ? ` in "${activeTab}"` : ""}.</p>
          {activeTab === "mine" && (
            <button className="btn btn-secondary" onClick={() => setShowReportForm(true)} style={{ marginTop: "1rem" }}>
              <Plus size={16} /> Report Your First Issue
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filteredIssues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              currentUser={currentUser}
              onVote={handleVote}
              onSelect={onSelectIssue}
            />
          ))}
        </div>
      )}
    </div>
  );
}