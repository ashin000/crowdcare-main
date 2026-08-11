import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, Clock, BarChart2, Filter, Eye, AlertTriangle, 
  Megaphone, PlusCircle, Volume2 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { getIssues, getCategories, createAnnouncement, createPoll } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";

const COLORS = ["#2b6777", "#52ab98", "#df9008", "#ef4444", "#c8d8e4"];

export default function AuthorityDashboard() {
  const { currentUser } = useAuthContext();
  
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: queue, announce, poll
  const [activeSubTab, setActiveSubTab] = useState("queue");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Forms
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annSuccess, setAnnSuccess] = useState(false);

  const [pollTitle, setPollTitle] = useState("");
  const [pollDesc, setPollDesc] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollSuccess, setPollSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allIssues, allCats] = await Promise.all([
        getIssues(),
        getCategories()
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
    loadData();
  }, []);

  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({ title: annTitle, content: annContent }, currentUser);
      setAnnTitle("");
      setAnnContent("");
      setAnnSuccess(true);
      setTimeout(() => setAnnSuccess(false), 2000);
    } catch (err) {
      alert("Failed to publish announcement");
    }
  };

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

  const handlePollSubmit = async (e) => {
    e.preventDefault();
    const cleanOpts = pollOptions.filter(o => o.trim() !== "");
    if (cleanOpts.length < 2) {
      alert("Please provide at least 2 valid options.");
      return;
    }
    try {
      await createPoll({ title: pollTitle, description: pollDesc, options: cleanOpts }, currentUser);
      setPollTitle("");
      setPollDesc("");
      setPollOptions(["", ""]);
      setPollSuccess(true);
      setTimeout(() => setPollSuccess(false), 2000);
    } catch (err) {
      alert("Failed to launch poll.");
    }
  };

  // Calculations
  const totalCount = issues.length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;
  const pendingCount = issues.filter(i => ["reported", "acknowledged", "in_progress"].includes(i.status)).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Chart Data: Category
  const categoryData = categories.map(cat => {
    const count = issues.filter(iss => iss.category === cat.id).length;
    return { name: cat.name, count };
  }).filter(d => d.count > 0);

  // Chart Data: Status
  const statusCounts = {};
  issues.forEach(i => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status.toUpperCase().replace("_", " "),
    value: statusCounts[status]
  }));

  // Filters logic
  const filteredIssues = issues.filter(iss => {
    const matchStatus = statusFilter === "all" || iss.status === statusFilter;
    const matchPriority = priorityFilter === "all" || iss.priority === priorityFilter;
    const matchCategory = categoryFilter === "all" || iss.category === categoryFilter;
    return matchStatus && matchPriority && matchCategory;
  });

  return (
    <div className="animate-fade container">
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h2 style={{ fontSize: "1.6rem" }}>Official Panel: {currentUser?.fullName || currentUser?.name}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Department: {currentUser?.department || "General Administration"} • District Officer
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

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--success-light)", padding: "1rem", borderRadius: "12px" }}>
            <CheckCircle2 color="var(--success)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Resolution Rate</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{resolutionRate}%</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{resolvedCount} of {totalCount} tickets resolved</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--warning-light)", padding: "1rem", borderRadius: "12px" }}>
            <Clock color="var(--warning)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Pending Tickets</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{pendingCount}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Awaiting resolution progress</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary-light)", padding: "1rem", borderRadius: "12px" }}>
            <BarChart2 color="var(--primary)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Total District Reports</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{totalCount}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Registered in municipal ward</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts (using Recharts) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginBottom: "2rem" }} className="grid-2">
        
        {/* Recharts Bar Chart: Category distribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Issues by Category</h3>
          <div style={{ width: "100%", height: "250px" }}>
            {categoryData.length === 0 ? (
              <p style={{ textAlign: "center", paddingTop: "5rem", color: "var(--text-muted)" }}>No issue data to display</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: "var(--bg-dark)", borderColor: "var(--border)" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recharts Pie Chart: Status Breakdown */}
        <div className="glass-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Resolution Breakdown</h3>
          <div style={{ width: "100%", height: "250px", display: "flex", justifyContent: "center" }}>
            {statusData.length === 0 ? (
              <p style={{ textAlign: "center", paddingTop: "5rem", color: "var(--text-muted)" }}>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-dark)", borderColor: "var(--border)" }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* TABS INNER RENDERS */}

      {/* QUEUE TABLE */}
      {activeSubTab === "queue" && (
        <div className="glass-card animate-scale" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={18} />
              Issue Management Queue
            </h3>
            
            {/* Table Filters */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <select className="form-control" style={{ width: "150px" }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select className="form-control" style={{ width: "135px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select className="form-control" style={{ width: "135px" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            {loading ? (
              <p style={{ textAlign: "center", padding: "2rem" }}>Loading issues...</p>
            ) : filteredIssues.length === 0 ? (
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
            )}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT PUBLISHER */}
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

          <form onSubmit={handleAnnounceSubmit}>
            <div className="form-group">
              <label className="form-label">Announcement Title</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g., Scheduled Maintenance Shutdown Anna Salai"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content Details</label>
              <textarea 
                className="form-control" 
                placeholder="Details of the announcement (dates, instructions, affected streets)..."
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
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POLL LAUNCHER */}
      {activeSubTab === "poll" && (
        <div className="glass-card animate-scale" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PlusCircle color="var(--primary)" />
            Launch Civic Priority Poll
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

          <form onSubmit={handlePollSubmit}>
            <div className="form-group">
              <label className="form-label">Poll Question</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g., Which civic project should be funded next in Ward 4?"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Context / Description</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Brief context details for voters..."
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
                  Add Option Field
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSubTab("queue")} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                Launch Poll
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
