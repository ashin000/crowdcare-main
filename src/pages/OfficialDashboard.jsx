import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, BarChart2, PlusCircle, Volume2, Megaphone, Clock, Filter, Eye } from "lucide-react";
import { dbService } from "../services/firebase";

export default function OfficialDashboard({ currentUser, onSelectIssue }) {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs for sub-forms
  const [activeSubTab, setActiveSubTab] = useState("queue"); // queue, announce, poll

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  // Poll form
  const [pollTitle, setPollTitle] = useState("");
  const [pollDesc, setPollDesc] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [pollSuccess, setPollSuccess] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allIssues, allCats] = await Promise.all([
        dbService.getIssues(),
        dbService.getCategories()
      ]);
      setIssues(allIssues);
      setCategories(allCats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Submit announcement
  const handleAnnounce = async (e) => {
    e.preventDefault();
    setAnnSubmitting(true);
    try {
      await dbService.createAnnouncement({ title: annTitle, content: annContent }, currentUser);
      setAnnTitle("");
      setAnnContent("");
      setAnnSuccess(true);
      setTimeout(() => setAnnSuccess(false), 2000);
    } catch (err) {
      alert("Failed to publish announcement");
    } finally {
      setAnnSubmitting(false);
    }
  };

  // Poll options change
  const handleOptionChange = (idx, val) => {
    const opts = [...pollOptions];
    opts[idx] = val;
    setPollOptions(opts);
  };

  const addOptionField = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, ""]);
  };

  const removeOptionField = (idx) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  // Submit Poll
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOpts = pollOptions.filter(o => o.trim() !== "");
    if (cleanOpts.length < 2) {
      alert("Please provide at least 2 valid options.");
      return;
    }
    setPollSubmitting(true);
    try {
      await dbService.createPoll({
        title: pollTitle,
        description: pollDesc,
        options: cleanOpts
      }, currentUser);
      setPollTitle("");
      setPollDesc("");
      setPollOptions(["", ""]);
      setPollSuccess(true);
      setTimeout(() => setPollSuccess(false), 2000);
    } catch (err) {
      alert("Failed to create poll");
    } finally {
      setPollSubmitting(false);
    }
  };

  // Statistics Calculations
  const totalCount = issues.length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;
  const pendingCount = issues.filter(i => ["reported", "acknowledged", "in_progress"].includes(i.status)).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Category chart calculation
  const categoryChartData = categories.map(cat => {
    const count = issues.filter(iss => iss.categoryId === cat.id).length;
    return { name: cat.name, count };
  });

  const maxCategoryCount = Math.max(...categoryChartData.map(d => d.count), 1);

  // Issues queue filtering
  const filteredIssues = issues.filter(iss => {
    const matchStatus = statusFilter === "all" || iss.status === statusFilter;
    const matchPriority = priorityFilter === "all" || iss.priority === priorityFilter;
    const matchCategory = categoryFilter === "all" || iss.categoryId === categoryFilter;
    return matchStatus && matchPriority && matchCategory;
  });

  return (
    <div className="animate-fade container">
      {/* Official banner */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h2 style={{ fontSize: "1.6rem" }}>Official Panel: {currentUser.name}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Department: {currentUser.department || "General Administration"} • Chennai Municipal Office
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={`btn btn-secondary ${activeSubTab === "queue" ? "btn-primary" : ""}`} onClick={() => setActiveSubTab("queue")}>
            Issues Queue
          </button>
          <button className={`btn btn-secondary ${activeSubTab === "announce" ? "btn-primary" : ""}`} onClick={() => setActiveSubTab("announce")}>
            Post Announcement
          </button>
          <button className={`btn btn-secondary ${activeSubTab === "poll" ? "btn-primary" : ""}`} onClick={() => setActiveSubTab("poll")}>
            Create Poll
          </button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--success-light)", padding: "1rem", borderRadius: "12px" }}>
            <CheckCircle2 color="var(--success)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Resolution Rate</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{resolutionRate}%</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{resolvedCount} of {totalCount} issues closed</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--warning-light)", padding: "1rem", borderRadius: "12px" }}>
            <Clock color="var(--warning)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Pending Tickets</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{pendingCount}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Requires active official action</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary-light)", padding: "1rem", borderRadius: "12px" }}>
            <BarChart2 color="var(--primary)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Total Submissions</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{totalCount}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Registered in civic district</p>
          </div>
        </div>
      </div>

      {/* Dynamic SVG Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }} className="grid-2">
        <div className="glass-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Issues by Administrative Category</h3>
          
          <div className="chart-container">
            <svg viewBox="0 0 400 220" className="chart-svg">
              {/* Category bars */}
              {categoryChartData.map((d, idx) => {
                const barWidth = 40;
                const gap = 35;
                const x = 50 + idx * (barWidth + gap);
                const height = d.count > 0 ? (d.count / maxCategoryCount) * 140 : 5;
                const y = 170 - height;
                
                return (
                  <g key={idx}>
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={height} 
                      rx={4} 
                      className="chart-bar" 
                    />
                    {/* Count label above bar */}
                    <text x={x + barWidth/2} y={y - 8} textAnchor="middle" className="chart-text" style={{ fontWeight: "bold" }}>
                      {d.count}
                    </text>
                    {/* Category initials / name */}
                    <text x={x + barWidth/2} y={190} textAnchor="middle" className="chart-text">
                      {d.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
              {/* Ground axis line */}
              <line x1="20" y1="170" x2="380" y2="170" stroke="var(--border)" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Active Resolution Distribution</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {["reported", "acknowledged", "in_progress", "resolved", "rejected"].map(status => {
              const count = issues.filter(i => i.status === status).length;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              let barColor = "var(--primary)";
              if (status === "resolved") barColor = "var(--success)";
              if (status === "rejected") barColor = "var(--danger)";
              if (status === "in_progress") barColor = "var(--warning)";

              return (
                <div key={status}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                    <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{status.replace("_", " ")}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{count} ({percent}%)</span>
                  </div>
                  <div style={{ height: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: barColor, borderRadius: "999px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area depending on Sub Tab */}

      {/* TAB: QUEUE TABLE */}
      {activeSubTab === "queue" && (
        <div className="glass-card animate-scale" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }} className="filters-header">
            <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={18} />
              Issue Management Queue
            </h3>
            
            {/* Table filters */}
            <div style={{ display: "flex", gap: "0.5rem" }} className="queue-filters">
              <select className="form-control" style={{ width: "150px" }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select className="form-control" style={{ width: "130px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="reported">Reported</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select className="form-control" style={{ width: "130px" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            {filteredIssues.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No issues match filters.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Issue Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((iss) => (
                    <tr key={iss.id}>
                      <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{iss.issue_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{iss.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{iss.location}</div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{iss.categoryName}</td>
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
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => onSelectIssue(iss)}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", gap: "0.3rem" }}
                        >
                          <Eye size={12} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: ANNOUNCEMENT WRITER */}
      {activeSubTab === "announce" && (
        <div className="glass-card animate-scale" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Volume2 color="var(--success)" />
            Compose Government Announcement
          </h3>

          {annSuccess && (
            <div style={{
              padding: "1rem",
              background: "var(--success-light)",
              border: "1px solid var(--success)",
              color: "var(--success)",
              borderRadius: "10px",
              marginBottom: "1.5rem"
            }}>
              Announcement published successfully! Citizens notified.
            </div>
          )}

          <form onSubmit={handleAnnounce}>
            <div className="form-group">
              <label className="form-label">Announcement Title</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g., Water Supply Suspension Ward 4"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content details</label>
              <textarea 
                className="form-control"
                placeholder="Details of the announcement (dates, affected streets, instructions)..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                style={{ minHeight: "150px" }}
                required
              />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSubTab("queue")} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={annSubmitting}>
                {annSubmitting ? "Publishing..." : "Publish Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: POLL CREATOR */}
      {activeSubTab === "poll" && (
        <div className="glass-card animate-scale" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PlusCircle color="var(--primary)" />
            Create Civic Preference Poll
          </h3>

          {pollSuccess && (
            <div style={{
              padding: "1rem",
              background: "var(--success-light)",
              border: "1px solid var(--success)",
              color: "var(--success)",
              borderRadius: "10px",
              marginBottom: "1.5rem"
            }}>
              Poll created successfully! Citizens notified to vote.
            </div>
          )}

          <form onSubmit={handleCreatePoll}>
            <div className="form-group">
              <label className="form-label">Poll Question / Title</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g., Which road should we prioritize for repaving?"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description / Context</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Context for citizens to vote on..."
                value={pollDesc}
                onChange={(e) => setPollDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Poll Options (Min 2, Max 5)</label>
              {pollOptions.map((opt, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required={idx < 2}
                  />
                  {pollOptions.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => removeOptionField(idx)} 
                      className="btn btn-danger" 
                      style={{ padding: "0.5rem 0.75rem", borderRadius: "10px" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 5 && (
                <button 
                  type="button" 
                  onClick={addOptionField} 
                  className="btn btn-secondary" 
                  style={{ marginTop: "0.5rem", width: "100%", fontSize: "0.85rem", padding: "0.5rem" }}
                >
                  Add Another Option
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSubTab("queue")} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={pollSubmitting}>
                {pollSubmitting ? "Creating..." : "Launch Poll"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .filters-header { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
          .queue-filters { width: 100%; flex-wrap: wrap; }
          .queue-filters select { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
