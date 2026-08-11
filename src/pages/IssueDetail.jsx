import React, { useState, useEffect } from "react";
import { X, MapPin, Calendar, Eye, ThumbsUp, Tag, MessageSquare, Send, RefreshCw, User, ShieldCheck } from "lucide-react";
import { dbService } from "../services/firebase";

export default function IssueDetail({ issue, currentUser, onClose, onRefresh }) {
  const [comments, setComments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [issue.id]);

  useEffect(() => {
    dbService.incrementViewCount(issue.id).catch(console.error);
  }, [issue.id]);

  const loadDetail = async () => {
    try {
      const [commentList, updateList] = await Promise.all([
        dbService.getComments(issue.id),
        dbService.getIssueUpdates(issue.id)
      ]);
      setComments(commentList);
      setUpdates(updateList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await dbService.addComment(issue.id, commentText.trim(), currentUser);
      setCommentText("");
      loadDetail();
    } catch (err) {
      alert(err.message || "Failed to add comment");
    } finally {
      setSending(false);
    }
  };

  const handleVote = async () => {
    try {
      await dbService.upvoteIssue(issue.id, currentUser.uid);
      onRefresh();
    } catch (err) {
      alert(err.message || "Failed to upvote issue");
    }
  };

  const isUpvoted = currentUser ? issue.upvotedBy?.includes(currentUser.uid) : false;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="modal-header" style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-dark)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <span className={`badge badge-${issue.priority}`}>{issue.priority}</span>
              <span className={`badge badge-status-${issue.status}`}>{issue.status.replace("_", " ")}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                {issue.issue_id}
              </span>
            </div>
            <h2 style={{ fontSize: "1.5rem", lineHeight: 1.3 }}>{issue.title}</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "40px", height: "40px" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Image */}
          {issue.imageUrl && (
            <div style={{
              width: "100%",
              height: "280px",
              borderRadius: "14px",
              overflow: "hidden",
              marginBottom: "1.5rem",
              background: "#1e293b"
            }}>
              <img
                src={issue.imageUrl}
                alt={issue.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Metadata */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            padding: "1rem 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            color: "var(--text-secondary)"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={15} color="var(--primary)" /> {issue.location}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Calendar size={15} /> {formatDate(issue.reportedAt)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Eye size={15} /> {issue.viewsCount} views
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Tag size={15} /> {issue.categoryName}
            </span>
          </div>

          {/* Reporter info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            marginBottom: "1.5rem"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              border: "1px solid var(--primary)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}>
              <User size={18} />
            </div>
            <div>
              {/* Officials see the full name; citizens/guests see only the user ID */}
              {currentUser?.role === "official" ? (
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{issue.citizenName}</div>
              ) : (
                <div style={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-heading)", letterSpacing: "0.03em" }}>
                  {issue.citizenId
                    ? `User #${issue.citizenId.slice(0, 8).toUpperCase()}`
                    : "Anonymous"}
                </div>
              )}
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Reported {formatDate(issue.reportedAt)}
              </div>
            </div>
            {issue.assignedOfficialName && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={18} color="var(--success)" />
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{issue.assignedOfficialName}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Assigned Official</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Description</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {issue.description}
            </p>
          </div>

          {/* Status Timeline */}
          {!loading && updates.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RefreshCw size={18} color="var(--success)" /> Status Timeline
              </h3>
              <div className="timeline">
                {updates.map((update, idx) => (
                  <div key={update.id} className={`timeline-item ${idx === 0 ? "active" : ""}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                        flexWrap: "wrap",
                        gap: "0.5rem"
                      }}>
                        <span className={`badge badge-status-${update.status}`}>
                          {update.status.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        {update.description}
                      </p>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <ShieldCheck size={13} color="var(--success)" />
                        {update.officialName} • Official
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageSquare size={18} color="var(--primary)" /> Comments ({comments.length})
            </h3>

            <div className="comments-container" style={{ marginTop: "0" }}>
              {comments.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem 0" }}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className={`comment-card ${comment.isOfficial ? "official-comment" : ""}`}>
                    <div className="comment-header">
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                        {comment.isOfficial && <ShieldCheck size={14} color="var(--success)" />}
                        {comment.userName}
                        {comment.isOfficial && (
                          <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600 }}>Official</span>
                        )}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <form onSubmit={handleAddComment} style={{ marginTop: "1rem" }}>
              <textarea
                className="form-control"
                rows={3}
                placeholder={currentUser ? "Write a comment or update..." : "Please sign in to comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!currentUser}
                required
              />
              {currentUser && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleVote}
                    style={{
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.85rem"
                    }}
                  >
                    <ThumbsUp size={15} fill={isUpvoted ? "white" : "transparent"} />
                    {isUpvoted ? "Upvoted" : "Upvote"} ({issue.upvotes})
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={sending} style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
                    <Send size={15} /> {sending ? "Sending..." : "Submit"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}