import React, { useState, useEffect } from "react";
import { X, Send, User, Calendar, MapPin, Tag, RefreshCw, MessageSquare, CheckCircle, ShieldAlert } from "lucide-react";
import { dbService } from "../services/firebase";

export default function IssueDetail({ issue, currentUser, onClose, onRefresh }) {
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Status updating form states (Officials only)
  const [newStatus, setNewStatus] = useState(issue.status);
  const [updateDesc, setUpdateDesc] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const loadIssueDetails = async () => {
    try {
      // Increment views count in background
      dbService.incrementViewCount(issue.id);
      
      const [allUpdates, allComments] = await Promise.all([
        dbService.getIssueUpdates(issue.id),
        dbService.getComments(issue.id)
      ]);
      setUpdates(allUpdates);
      setComments(allComments);
    } catch (err) {
      console.error("Error loading issue details:", err);
    }
  };

  useEffect(() => {
    loadIssueDetails();
  }, [issue.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    setCommentSubmitting(true);
    try {
      const added = await dbService.addComment(issue.id, newComment, currentUser);
      setComments([...comments, added]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (updateDesc.trim() === "") {
      alert("Please provide progress details for status update.");
      return;
    }
    setStatusSubmitting(true);
    try {
      await dbService.updateIssueStatus(issue.id, newStatus, updateDesc, currentUser);
      setUpdateDesc("");
      
      // Reload details and trigger parent state refresh
      await loadIssueDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Timeline helper
  const statuses = ["reported", "acknowledged", "in_progress", "resolved"];
  const currentStatusIndex = statuses.indexOf(issue.status);

  return (
    <div className="modal-backdrop animate-fade">
      <div className="modal-content animate-scale" style={{ width: "100%", maxWidth: "800px" }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>{issue.issue_id}</span>
            <h2 style={{ fontSize: "1.4rem", marginTop: "0.25rem" }}>{issue.title}</h2>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: "0.4rem", borderRadius: "50%", minWidth: "36px", height: "36px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }} className="grid-2">
            
            {/* Left side: Information, media, comments */}
            <div>
              {/* Image */}
              <div style={{
                width: "100%",
                height: "220px",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "1rem",
                background: "#1e293b"
              }}>
                <img 
                  src={issue.imageUrl} 
                  alt={issue.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>

              {/* Location and Category details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span>{issue.location}</span>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <Tag size={14} />
                    {issue.categoryName}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <Calendar size={14} />
                    Reported: {new Date(issue.reportedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className={`badge badge-${issue.priority}`}>Priority: {issue.priority}</span>
                  <span className={`badge badge-status-${issue.status}`} style={{ marginLeft: "0.5rem" }}>
                    Status: {issue.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Description</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {issue.description}
                </p>
              </div>

              {/* Comments Section */}
              <div className="comments-container">
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MessageSquare size={16} />
                  Community Discussion
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ask a question or comment on this issue..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem" }} disabled={commentSubmitting}>
                    <Send size={16} />
                  </button>
                </form>

                {/* Comments List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {comments.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>No comments yet. Start the conversation!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className={`comment-card ${c.isOfficial ? "official-comment" : ""}`}>
                        <div className="comment-header">
                          <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <User size={12} />
                            {c.userName}
                            {c.isOfficial && <span className="badge badge-low" style={{ textTransform: "uppercase", fontSize: "0.6rem", padding: "0.1rem 0.4rem" }}>Official Reply</span>}
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{formatDate(c.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Status Updates timeline & Admin forms */}
            <div>
              {/* Progress Timeline */}
              <div className="glass-card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Resolution Progress</h3>
                
                <div className="timeline">
                  {/* Reported Status */}
                  <div className={`timeline-item ${currentStatusIndex >= 0 ? "active" : ""}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>Report Filed</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(issue.reportedAt)}</div>
                    </div>
                  </div>

                  {/* Acknowledged Status */}
                  <div className={`timeline-item ${currentStatusIndex >= 1 ? "active" : ""}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>Acknowledged & Assigned</div>
                      {updates.find(u => u.status === "acknowledged") && (
                        <>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                            {updates.find(u => u.status === "acknowledged").description}
                          </p>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {formatDate(updates.find(u => u.status === "acknowledged").createdAt)} by {updates.find(u => u.status === "acknowledged").officialName}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* In Progress Status */}
                  <div className={`timeline-item ${currentStatusIndex >= 2 ? "active" : ""}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>Work In Progress</div>
                      {updates.find(u => u.status === "in_progress") && (
                        <>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                            {updates.find(u => u.status === "in_progress").description}
                          </p>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {formatDate(updates.find(u => u.status === "in_progress").createdAt)} by {updates.find(u => u.status === "in_progress").officialName}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resolved Status */}
                  <div className={`timeline-item ${currentStatusIndex >= 3 ? "active" : ""}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>Issue Resolved</div>
                      {updates.find(u => u.status === "resolved") && (
                        <>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                            {updates.find(u => u.status === "resolved").description}
                          </p>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {formatDate(updates.find(u => u.status === "resolved").createdAt)} by {updates.find(u => u.status === "resolved").officialName}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Form (Officials Only) */}
              {currentUser && currentUser.role === "official" && (
                <div className="glass-card animate-scale" style={{ border: "1px solid var(--success)", background: "rgba(16, 185, 129, 0.02)" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <RefreshCw size={16} />
                    Update Issue Status
                  </h3>
                  
                  <form onSubmit={handleUpdateStatus}>
                    <div className="form-group">
                      <label className="form-label">Set Status</label>
                      <select 
                        className="form-control" 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="reported">Reported</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Progress Update Notes</label>
                      <textarea 
                        className="form-control" 
                        placeholder="Details of progress or explanation for resolution/rejection..."
                        value={updateDesc}
                        onChange={(e) => setUpdateDesc(e.target.value)}
                        style={{ minHeight: "80px" }}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: "100%", background: "var(--success)" }}
                      disabled={statusSubmitting}
                    >
                      {statusSubmitting ? "Updating..." : "Submit Status Update"}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
