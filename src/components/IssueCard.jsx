import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ThumbsUp, Calendar, MapPin, Tag } from "lucide-react";

export default function IssueCard({ issue, currentUser, onVote, onSelect }) {
  const navigate = useNavigate();
  
  // Upvote check - supports both user arrays or general counters
  const isUpvoted = currentUser ? (issue.upvotedBy?.includes(currentUser.uid) || localStorage.getItem(`upvoted_${issue.id}_${currentUser.uid}`) === "true") : false;

  const handleVoteClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Please sign in to upvote issues.");
      return;
    }
    onVote(issue.id);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(issue);
    } else {
      navigate(`/issues/${issue.id}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div 
      className="glass-card animate-scale" 
      onClick={handleCardClick}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: "360px",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div>
        {/* Card Image */}
        <div style={{
          width: "100%",
          height: "160px",
          overflow: "hidden",
          borderRadius: "12px",
          marginBottom: "1rem",
          position: "relative",
          background: "#1e293b"
        }}>
          <img 
            src={issue.imageUrl || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800"} 
            alt={issue.title} 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
          }}>
            <span className={`badge badge-${issue.priority}`}>
              {issue.priority}
            </span>
          </div>

          <div style={{
            position: "absolute",
            bottom: "8px",
            right: "8px"
          }}>
            <span className={`badge badge-status-${issue.status}`}>
              {issue.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Issue ID and date */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginBottom: "0.5rem"
        }}>
          <span style={{ fontWeight: 700, fontFamily: "var(--font-heading)" }}>{issue.issue_id}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Calendar size={12} /> {formatDate(issue.reportedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ 
          fontSize: "1.15rem", 
          marginBottom: "0.5rem",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {issue.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "1rem",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {issue.description}
        </p>
      </div>

      {/* Footer metadata */}
      <div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.4rem",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginBottom: "0.75rem"
        }}>
          <MapPin size={14} color="var(--primary)" />
          <span style={{ 
            textOverflow: "ellipsis", 
            overflow: "hidden", 
            whiteSpace: "nowrap",
            width: "100%"
          }}>{issue.location?.address || "Location detail unprovided"}</span>
        </div>

        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <Tag size={12} />
            <span>{issue.categoryName || issue.category}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <Eye size={14} /> {issue.viewsCount || 0}
            </span>
            <button 
              onClick={handleVoteClick}
              className={`btn ${isUpvoted ? "btn-primary" : "btn-secondary"}`}
              style={{ 
                padding: "0.35rem 0.75rem", 
                borderRadius: "8px", 
                fontSize: "0.8rem",
                gap: "0.3rem"
              }}
            >
              <ThumbsUp size={12} fill={isUpvoted ? "white" : "transparent"} />
              <span>{issue.upvoteCount || issue.upvotes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
