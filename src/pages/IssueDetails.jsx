import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Tag, Calendar, Eye, ThumbsUp, MessageSquare, 
  Send, Trash2, ShieldAlert, Award, User, RefreshCw, AlertCircle, 
  Camera, CheckSquare, Sparkles 
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { 
  getIssueById, 
  getStatusHistory, 
  getComments, 
  addComment, 
  deleteIssue,
  markSpam,
  upvoteIssue, 
  incrementViewCount, 
  updateIssueStatus, 
  assignIssue, 
  resolveIssue, 
  getUsers 
} from "../firebase/firestore";
import { uploadMediaFile } from "../firebase/storage";
import MapView from "../components/MapView";
import IssueTimeline from "../components/IssueTimeline";

export default function IssueDetails() {
  const { issueId } = useParams();
  const { currentUser } = useAuthContext();
  
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comments form
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Authority/Volunteer action states
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [newStatus, setNewStatus] = useState("acknowledged");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Resolution form states
  const [resolutionDesc, setResolutionDesc] = useState("");
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await getIssueById(issueId);
      if (!data) {
        setIssue(null);
        setLoading(false);
        return;
      }
      setIssue(data);
      setNewStatus(data.status);

      // Increment views count in background
      incrementViewCount(data.id);

      const [histLogs, commentsList, allUsers] = await Promise.all([
        getStatusHistory(data.id),
        getComments(data.id),
        getUsers()
      ]);

      setHistory(histLogs);
      setComments(commentsList);
      
      // Filter volunteers for delegation
      setVolunteers(allUsers.filter(u => u.role === "volunteer"));
    } catch (err) {
      console.error("Error loading issue details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [issueId]);

  const handleVote = async () => {
    if (!currentUser) {
      alert("Please sign in to upvote issues.");
      return;
    }
    try {
      const { count } = await upvoteIssue(issue.id, currentUser.uid);
      setIssue({ ...issue, upvoteCount: count, upvotes: count });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const commentObj = await addComment(issue.id, newComment, currentUser);
      setComments([...comments, commentObj]);
      setNewComment("");
    } catch (err) {
      alert("Failed to post comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Status/Delegation Action Handler
  const handleActionSubmit = async (actionType) => {
    setSubmittingAction(true);
    try {
      if (actionType === "status") {
        if (!statusNotes.trim()) throw new Error("Progress notes are required.");
        await updateIssueStatus(issue.id, newStatus, statusNotes, currentUser);
        setStatusNotes("");
        alert("Status updated successfully.");
      } else if (actionType === "assign") {
        if (!selectedVolunteer) throw new Error("Please select a volunteer.");
        await assignIssue(issue.id, selectedVolunteer, "volunteer", currentUser);
        alert("Issue delegated to volunteer.");
      } else if (actionType === "accept") {
        // Volunteer accepts ticket
        await assignIssue(issue.id, currentUser.uid, "volunteer", currentUser);
        alert("You have accepted this task.");
      } else if (actionType === "resolve") {
        if (!resolutionDesc.trim()) throw new Error("Resolution proof details are required.");
        
        let resolutionUrl = "";
        if (resolutionFile) {
          resolutionUrl = await uploadMediaFile("issues/resolution", resolutionFile);
        }

        await resolveIssue(issue.id, resolutionDesc, resolutionUrl, currentUser);
        setResolutionDesc("");
        setResolutionFile(null);
        setResolutionPreview(null);
        alert("Issue marked as resolved!");
      }
      
      // Reload issue
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to perform action.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Admin moderation tools
  const handleModerateSpam = async () => {
    const nextSpam = !issue.isSpam;
    try {
      await markSpam(issue.id, nextSpam, currentUser);
      setIssue({ ...issue, isSpam: nextSpam });
      alert(nextSpam ? "Issue marked as spam." : "Spam flag removed.");
    } catch (err) {
      alert("Moderation failed.");
    }
  };

  const handleModerateDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue? This action is logged.")) return;
    try {
      await deleteIssue(issue.id, currentUser);
      alert("Issue deleted.");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to delete issue.");
    }
  };

  const handleResolutionFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionFile(file);
      setResolutionPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "8rem" }}>
        <p>Loading issue details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "4rem" }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: "0 auto 1rem" }} />
        <h3>Issue Not Found</h3>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          The requested civic ticket ID does not exist or has been deleted.
        </p>
        <Link to="/issues" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  // Privacy Rule check: only official/admin/assignee can see reporter details
  const canSeeReporterDetails = currentUser && ["admin", "authority", "official"].includes(currentUser.role);

  // Upvote check
  const isUpvoted = currentUser ? localStorage.getItem(`upvoted_${issue.id}_${currentUser.uid}`) === "true" : false;

  return (
    <div className="animate-fade container">
      
      {/* Back button */}
      <Link to="/issues" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Civic Feed
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2.5rem" }} className="grid-2">
        
        {/* LEFT COLUMN: Media, Information, Comments */}
        <div>
          {/* Main Photo Banner */}
          <div style={{
            width: "100%",
            height: "300px",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#070f12",
            border: "1px solid var(--border)",
            marginBottom: "1.5rem"
          }}>
            <img 
              src={issue.imageUrl || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800"} 
              alt={issue.title} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Issue Header details */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 800 }}>{issue.issueId}</span>
              <h2 style={{ fontSize: "2rem", marginTop: "0.25rem", fontFamily: "var(--font-heading)" }}>{issue.title}</h2>
            </div>
            
            {/* Upvote triggers */}
            <button 
              onClick={handleVote} 
              className={`btn ${isUpvoted ? "btn-primary" : "btn-secondary"}`}
              style={{ gap: "0.5rem" }}
            >
              <ThumbsUp size={16} fill={isUpvoted ? "white" : "transparent"} />
              <span>{issue.upvoteCount || issue.upvotes || 0} Upvotes</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <span className={`badge badge-${issue.priority}`}>Priority: {issue.priority}</span>
            <span className={`badge badge-status-${issue.status}`}>Status: {issue.status.replace("_", " ")}</span>
            {issue.isSpam && <span className="badge badge-low" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}>Flagged Spam</span>}
          </div>

          {/* Primary details */}
          <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
              <MapPin size={16} color="var(--primary)" />
              <strong>Location:</strong> <span>{issue.location?.address}</span>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <Tag size={14} /> Category: {issue.categoryName || issue.category}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <Calendar size={14} /> Reported: {new Date(issue.reportedAt).toLocaleDateString()}
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {canSeeReporterDetails ? (
                <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "8px" }}>
                  <p><strong>Reported By:</strong> {issue.reporterName}</p>
                  <p><strong>Email:</strong> {issue.reporterEmail || "Unprovided"}</p>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--success)" }}>
                  <Award size={14} /> Reported by: verified citizen
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Problem Description</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {issue.description}
            </p>
          </div>

          {/* Resolution Proof display */}
          {issue.status === "resolved" && issue.resolutionProof && issue.resolutionProof.length > 0 && (
            <div className="glass-card animate-scale" style={{ border: "1px solid var(--success)", background: "rgba(16, 185, 129, 0.02)", padding: "2rem", marginBottom: "2.5rem" }}>
              <h3 style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", marginBottom: "1rem" }}>
                <Award size={20} /> Resolution Evidence
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                {issue.resolutionProof[0].description}
              </p>
              
              {issue.resolutionProof[0].imageUrl && (
                <div style={{ width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img 
                    src={issue.resolutionProof[0].imageUrl} 
                    alt="resolution evidence" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
              )}

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
                <span>Verified by: <strong>{issue.resolutionProof[0].resolvedBy}</strong></span>
                <span>Date: {new Date(issue.resolutionProof[0].resolvedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Comments Widget */}
          <div className="comments-container">
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageSquare size={18} /> Community Discussion ({comments.length})
            </h3>

            {currentUser ? (
              <form onSubmit={handleAddComment} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Share details, support notes, or ask questions..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={commentSubmitting} style={{ padding: "0.75rem" }}>
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <div className="glass-card" style={{ padding: "1rem", textAlign: "center", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Please <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign In</Link> to participate in the conversation.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No comments yet.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className={`comment-card ${c.isOfficial ? "official-comment" : ""}`}>
                    <div className="comment-header">
                      <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <User size={12} />
                        {c.userName}
                        {c.isOfficial && <span className="badge badge-low" style={{ fontSize: "0.6rem", textTransform: "uppercase", padding: "0.1rem 0.4rem" }}>Official Reply</span>}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{c.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Map, Timeline, Action Panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Non-interactive map preview */}
          {issue.location && (
            <div className="glass-card" style={{ padding: "1rem" }}>
              <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <MapPin size={16} color="var(--primary)" /> Issue Location
              </h4>
              <MapView 
                center={{ lat: issue.location.latitude, lng: issue.location.longitude }}
                zoom={14}
                markers={[issue]}
                height="220px"
              />
            </div>
          )}

          {/* Audit trail status timeline */}
          <IssueTimeline history={history} currentStatus={issue.status} />

          {/* Authority Panel Actions */}
          {currentUser && currentUser.role === "authority" && (
            <div className="glass-card animate-scale" style={{ border: "1px solid var(--success)", background: "rgba(16, 185, 129, 0.01)" }}>
              <h3 style={{ fontSize: "1.15rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <RefreshCw size={18} /> Official Action Panel
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* 1. Quick status progress note */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <label className="form-label">Set District Status</label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button 
                      onClick={() => handleActionSubmit("status")} 
                      className="btn btn-primary" 
                      style={{ background: "var(--success)" }}
                      disabled={submittingAction}
                    >
                      Update
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter status remarks (e.g. Inspector dispatched)"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                {/* 2. Assign to volunteer */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <label className="form-label">Delegate to Volunteer</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select className="form-control" value={selectedVolunteer} onChange={(e) => setSelectedVolunteer(e.target.value)}>
                      <option value="">Select Volunteer</option>
                      {volunteers.map(v => (
                        <option key={v.uid} value={v.uid}>{v.name} ({v.district})</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleActionSubmit("assign")} 
                      className="btn btn-secondary" 
                      disabled={submittingAction}
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* 3. Resolve Form */}
                {issue.status !== "resolved" && (
                  <div>
                    <label className="form-label" style={{ color: "var(--success)", fontWeight: 700 }}>Mark as Resolved</label>
                    <textarea 
                      className="form-control" 
                      placeholder="Explain the work done to resolve this issue (e.g. repaved, cleared trash)..."
                      value={resolutionDesc}
                      onChange={(e) => setResolutionDesc(e.target.value)}
                      style={{ minHeight: "60px", fontSize: "0.85rem", marginBottom: "0.5rem" }}
                    />
                    <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                      <label className="form-label" style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Camera size={12} /> Upload Resolution Proof (Photo)
                      </label>
                      <input type="file" accept="image/*" className="form-control" onChange={handleResolutionFile} style={{ fontSize: "0.75rem" }} />
                      {resolutionPreview && (
                        <img src={resolutionPreview} alt="resolution preview" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px", marginTop: "0.5rem" }} />
                      )}
                    </div>
                    <button 
                      onClick={() => handleActionSubmit("resolve")} 
                      className="btn btn-primary" 
                      style={{ width: "100%", background: "var(--success)" }}
                      disabled={submittingAction}
                    >
                      Verify and Close Ticket
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Volunteer Actions Panel */}
          {currentUser && currentUser.role === "volunteer" && (
            <div className="glass-card animate-scale" style={{ border: "1px solid var(--warning)", background: "rgba(223, 144, 8, 0.01)" }}>
              <h3 style={{ fontSize: "1.15rem", color: "var(--warning)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <CheckSquare size={18} /> Volunteer Task Center
              </h3>

              {issue.assignedVolunteerId !== currentUser.uid ? (
                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    This task has not been assigned to you. You can accept this task to work on resolving it.
                  </p>
                  <button 
                    onClick={() => handleActionSubmit("accept")} 
                    className="btn btn-primary" 
                    style={{ width: "100%", background: "var(--warning)", color: "black" }}
                    disabled={submittingAction}
                  >
                    Accept Task
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "0.5rem", background: "var(--warning-light)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--warning)", textAlign: "center", fontWeight: 700 }}>
                    ✓ Assigned to you
                  </div>
                  
                  {/* Mark resolved form */}
                  {issue.status !== "resolved" && (
                    <div>
                      <label className="form-label">Complete Task</label>
                      <textarea 
                        className="form-control" 
                        placeholder="Provide completion details..."
                        value={resolutionDesc}
                        onChange={(e) => setResolutionDesc(e.target.value)}
                        style={{ minHeight: "60px", fontSize: "0.85rem", marginBottom: "0.5rem" }}
                      />
                      <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                        <label className="form-label" style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Camera size={12} /> Upload Photo Proof
                        </label>
                        <input type="file" accept="image/*" className="form-control" onChange={handleResolutionFile} style={{ fontSize: "0.75rem" }} />
                        {resolutionPreview && (
                          <img src={resolutionPreview} alt="resolution preview" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px", marginTop: "0.5rem" }} />
                        )}
                      </div>
                      <button 
                        onClick={() => handleActionSubmit("resolve")} 
                        className="btn btn-primary" 
                        style={{ width: "100%", background: "var(--warning)", color: "black" }}
                        disabled={submittingAction}
                      >
                        Submit Completion Proof
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Admin Moderation Panel */}
          {currentUser && currentUser.role === "admin" && (
            <div className="glass-card animate-scale" style={{ border: "1px solid var(--danger)", background: "rgba(239, 68, 68, 0.01)" }}>
              <h3 style={{ fontSize: "1.15rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <ShieldAlert size={18} /> Administrative Actions
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <button 
                  onClick={handleModerateSpam} 
                  className="btn btn-secondary" 
                  style={{ width: "100%", color: "var(--warning)", border: "1px solid var(--warning)", background: "transparent" }}
                >
                  {issue.isSpam ? "Remove Spam Flag" : "Flag as Spam / Fake"}
                </button>
                <button 
                  onClick={handleModerateDelete} 
                  className="btn btn-danger" 
                  style={{ width: "100%" }}
                >
                  Delete Civic Ticket
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
