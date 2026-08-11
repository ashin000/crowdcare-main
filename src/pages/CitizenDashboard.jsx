import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, PlusCircle, AlertCircle, CheckCircle2, FileText, Vote, Megaphone } from "lucide-react";
import { dbService } from "../services/firebase";
import IssueCard from "../components/IssueCard";

export default function CitizenDashboard({ currentUser, onSelectIssue }) {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Tab control
  const [activeTab, setActiveTab] = useState("feed"); // feed, report, my_issues

  // New Issue Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newImage, setNewImage] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allIssues, allCats, allAnns, allPolls] = await Promise.all([
        dbService.getIssues(),
        dbService.getCategories(),
        dbService.getAnnouncements(),
        dbService.getPolls()
      ]);
      setIssues(allIssues);
      setCategories(allCats);
      setAnnouncements(allAnns);
      setPolls(allPolls);
      
      if (allCats.length > 0) {
        setNewCat(allCats[0].id);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleVote = async (issueId) => {
    try {
      const { upvotes, upvotedBy } = await dbService.upvoteIssue(issueId, currentUser.uid);
      setIssues(issues.map(iss => iss.id === issueId ? { ...iss, upvotes, upvotedBy } : iss));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePollVote = async (pollId, optionIdx) => {
    try {
      const { voters, votes } = await dbService.voteInPoll(pollId, optionIdx, currentUser.uid);
      setPolls(polls.map(p => p.id === pollId ? { ...p, voters, votes } : p));
    } catch (err) {
      alert(err.message || "Failed to submit vote");
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");
    setFormSuccess(false);
    
    try {
      const issueData = {
        title: newTitle,
        description: newDesc,
        location: newLoc,
        categoryId: newCat,
        priority: newPriority,
        imageUrl: newImage
      };
      
      const created = await dbService.createIssue(issueData, currentUser);
      setIssues([created, ...issues]);
      
      // Reset form
      setNewTitle("");
      setNewDesc("");
      setNewLoc("");
      setNewPriority("medium");
      setNewImage("");
      setFormSuccess(true);
      
      // Switch back to feed after short delay
      setTimeout(() => {
        setActiveTab("feed");
        setFormSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to submit issue");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtering Logic
  const filteredIssues = issues.filter(iss => {
    const matchesSearch = 
      iss.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      iss.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.issue_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || iss.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "all" || iss.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const myIssues = issues.filter(iss => iss.citizenId === currentUser.uid);

  return (
    <div className="animate-fade container">
      {/* Dashboard Header Banner */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%)"
      }}>
        <div>
          <h2 style={{ fontSize: "1.6rem" }}>Welcome, {currentUser.name}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Citizen Portal • Chennai City Corp • Address: {currentUser.address}, {currentUser.city}
          </p>
        </div>
        <button 
          className={`btn btn-primary`} 
          onClick={() => setActiveTab(activeTab === "report" ? "feed" : "report")}
        >
          <PlusCircle size={18} />
          Report New Issue
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "2rem" }} className="dashboard-grid">
        {/* Left Side: Main Tab Panels */}
        <div>
          {/* Dashboard Tabs Toggle */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <button 
              className={`btn ${activeTab === "feed" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("feed")}
              style={{ flex: 1 }}
            >
              Issues Feed
            </button>
            <button 
              className={`btn ${activeTab === "my_issues" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("my_issues")}
              style={{ flex: 1 }}
            >
              My Reported Issues ({myIssues.length})
            </button>
            <button 
              className={`btn ${activeTab === "report" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("report")}
              style={{ flex: 1 }}
            >
              Report Form
            </button>
          </div>

          {/* TAB 1: ISSUES FEED */}
          {activeTab === "feed" && (
            <div>
              {/* Filter controls */}
              <div className="glass-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }} className="filters-grid">
                  <div style={{ position: "relative" }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search title, description, ID, location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: "2.5rem" }}
                    />
                  </div>
                  <div>
                    <select 
                      className="form-control"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select 
                      className="form-control"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="reported">Reported</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "4rem" }}>
                  <p>Loading reported issues...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                  <AlertCircle size={32} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
                  <p>No matching issues found.</p>
                </div>
              ) : (
                <div className="grid-2">
                  {filteredIssues.map((iss) => (
                    <IssueCard 
                      key={iss.id} 
                      issue={iss} 
                      currentUser={currentUser} 
                      onVote={handleVote}
                      onSelect={onSelectIssue}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY ISSUES */}
          {activeTab === "my_issues" && (
            <div>
              {myIssues.length === 0 ? (
                <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                  <AlertCircle size={32} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
                  <p>You haven't reported any issues yet.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab("report")} style={{ marginTop: "1rem" }}>
                    File Your First Report
                  </button>
                </div>
              ) : (
                <div className="grid-2">
                  {myIssues.map((iss) => (
                    <IssueCard 
                      key={iss.id} 
                      issue={iss} 
                      currentUser={currentUser} 
                      onVote={handleVote}
                      onSelect={onSelectIssue}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPORT ISSUE FORM */}
          {activeTab === "report" && (
            <div className="glass-card animate-scale" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <PlusCircle color="var(--primary)" />
                Submit Civic Issue Report
              </h3>

              {formSuccess && (
                <div style={{
                  padding: "1rem",
                  background: "var(--success-light)",
                  border: "1px solid var(--success)",
                  color: "var(--success)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <CheckCircle2 size={20} />
                  <span>Your report has been successfully submitted to Chennai City Corp!</span>
                </div>
              )}

              {formError && (
                <div style={{
                  padding: "1rem",
                  background: "var(--danger-light)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                  borderRadius: "10px",
                  marginBottom: "1.5rem"
                }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateIssue}>
                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select 
                    className="form-control"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Title / Main Subject</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Short, descriptive title (e.g. Garbage overflowing on Mount Road)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea 
                    className="form-control"
                    placeholder="Please explain the details of the problem. Include sizes, impact on traffic/neighborhood, how long it has been present, etc."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Exact Location Address</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Street name, landmark, near shop, etc."
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Priority Severity</label>
                    <select 
                      className="form-control"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                    >
                      <option value="low">Low (minor inconvenience)</option>
                      <option value="medium">Medium (standard public issue)</option>
                      <option value="high">High (causes immediate disruption)</option>
                      <option value="critical">Critical (safety hazard/damage)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reference Image URL (optional)</label>
                    <input 
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/pothole.jpg"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setActiveTab("feed")}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? "Submitting Report..." : "Submit Civic Report"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Polls and Announcements widgets */}
        <div>
          {/* Active Polls Card */}
          <div className="glass-card animate-scale" style={{ marginBottom: "2rem", padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Vote size={18} color="var(--warning)" />
              Active Polls
            </h3>
            {polls.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>No active polls</p>
            ) : (
              polls.map(p => {
                const hasVoted = p.voters[currentUser.uid] !== undefined;
                const totalVotes = Object.values(p.votes).reduce((sum, v) => sum + v, 0);

                return (
                  <div key={p.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "0.9rem", marginBottom: "0.4rem", lineHeight: 1.3 }}>{p.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>{p.description}</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {p.options.map((opt, idx) => {
                        const optVotes = p.votes[idx] || 0;
                        const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        
                        return (
                          <div key={idx} style={{ position: "relative" }}>
                            {hasVoted ? (
                              <div style={{
                                width: "100%",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                padding: "0.5rem",
                                fontSize: "0.8rem",
                                position: "relative",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "space-between",
                                background: p.voters[currentUser.uid] === idx ? "var(--primary-light)" : "transparent"
                              }}>
                                {/* Visual progress fill */}
                                <div style={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: `${percentage}%`,
                                  background: "rgba(79, 70, 229, 0.1)",
                                  zIndex: 0
                                }} />
                                <span style={{ position: "relative", zIndex: 1, fontWeight: p.voters[currentUser.uid] === idx ? 700 : 400 }}>
                                  {opt}
                                </span>
                                <span style={{ position: "relative", zIndex: 1, color: "var(--text-secondary)" }}>
                                  {percentage}% ({optVotes})
                                </span>
                              </div>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                onClick={() => handlePollVote(p.id, idx)}
                                style={{
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.8rem",
                                  borderRadius: "8px"
                                }}
                              >
                                {opt}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Announcements Card */}
          <div className="glass-card animate-scale" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Megaphone size={18} color="var(--info)" />
              Announcements
            </h3>
            {announcements.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>No active announcements</p>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                  <h4 style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>{ann.title}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{ann.content}</p>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textAlign: "right", marginTop: "0.25rem" }}>
                    {new Date(ann.createdAt).toLocaleDateString()} by {ann.officialName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .filters-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
