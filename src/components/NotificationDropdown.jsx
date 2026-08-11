import React from "react";
import { Check, Bell, Megaphone, Radio, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationDropdown({ isOpen, notifications = [], onMarkRead, onClose }) {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone size={14} className="text-info" />;
      case "poll":
        return <Radio size={14} className="text-warning" />;
      case "status_changed":
      case "status_change":
        return <RefreshCw size={14} className="text-success" />;
      case "issue_assigned":
        return <ShieldCheck size={14} className="text-primary" />;
      default:
        return <Bell size={14} className="text-primary" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleItemClick = (notif) => {
    onMarkRead(notif.id);
    if (onClose) onClose();
  };

  return (
    <div 
      className="glass-card animate-scale"
      style={{
        position: "absolute",
        top: "50px",
        right: "0",
        width: "360px",
        maxHeight: "450px",
        overflowY: "auto",
        zIndex: 100,
        padding: "1rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        background: "var(--bg-dark)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Recent Notifications</h4>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {notifications.filter(n => !n.isRead).length} unread
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <Bell size={24} opacity={0.4} style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ fontSize: "0.8rem" }}>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 5).map(notif => (
            <div 
              key={notif.id} 
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: notif.isRead ? "transparent" : "rgba(79, 70, 229, 0.05)",
                borderLeft: notif.isRead ? "1px solid var(--border)" : "3px solid var(--primary)",
                cursor: "pointer",
                position: "relative"
              }}
              onClick={() => handleItemClick(notif)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {getIcon(notif.type)}
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{notif.title}</span>
                </div>
                {!notif.isRead && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notif.id);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer"
                    }}
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
              
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.3, marginBottom: "0.25rem" }}>
                {notif.message}
              </p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem" }}>
                {notif.issueId ? (
                  <Link 
                    to={`/issues/${notif.issueId}`} 
                    style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 600 }}
                    onClick={onClose}
                  >
                    View Ticket →
                  </Link>
                ) : <span />}
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{formatDate(notif.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 5 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem", textAlign: "center" }}>
          <Link to="/notifications" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }} onClick={onClose}>
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
