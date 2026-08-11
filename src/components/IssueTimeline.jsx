import React from "react";
import { CheckCircle2, Clock, Hammer, Flag, AlertCircle } from "lucide-react";

export default function IssueTimeline({ history = [], currentStatus = "pending" }) {
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const statusMeta = {
    pending: { label: "Report Submitted", color: "var(--primary)", icon: <AlertCircle size={12} color="white" /> },
    acknowledged: { label: "Acknowledged & Reviewed", color: "var(--info)", icon: <Flag size={12} color="black" /> },
    in_progress: { label: "Work In Progress", color: "var(--warning)", icon: <Hammer size={12} color="white" /> },
    resolved: { label: "Issue Resolved", color: "var(--success)", icon: <CheckCircle2 size={12} color="white" /> },
    rejected: { label: "Issue Rejected", color: "var(--danger)", icon: <XIcon size={12} color="white" /> }
  };

  // Get active index for timeline progression
  const steps = ["pending", "acknowledged", "in_progress", "resolved"];
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="glass-card animate-scale" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Resolution Timeline</h3>

      <div className="timeline">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const meta = statusMeta[step];
          
          // Find matching logs in status history
          const matchingLog = history.find(h => h.status === step);

          return (
            <div key={step} className={`timeline-item ${isActive ? "active" : ""}`} style={{ marginBottom: "1.5rem" }}>
              <div 
                className="timeline-dot" 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isActive ? meta.color : "var(--bg-darker)",
                  borderColor: isActive ? meta.color : "var(--border)"
                }}
              >
                {isActive && meta.icon}
              </div>
              <div className="timeline-content" style={{ opacity: isActive ? 1 : 0.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "capitalize" }}>
                    {meta.label}
                  </span>
                  {matchingLog && (
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {formatDate(matchingLog.createdAt)}
                    </span>
                  )}
                </div>

                {matchingLog ? (
                  <>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      {matchingLog.comment}
                    </p>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem", textAlign: "right" }}>
                      Updated by: <strong style={{ textTransform: "uppercase" }}>{matchingLog.changedByRole}</strong>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", fontStyle: "italic" }}>
                    Awaiting status progression...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple stub for X icon
function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
