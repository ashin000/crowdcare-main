import React from "react";
import { X, Check, BellRing, Megaphone, Radio, RefreshCw } from "lucide-react";
import { dbService } from "../services/firebase";

export default function NotificationDrawer({ isOpen, onClose, notifications, onMarkRead }) {
  const getIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone size={16} color="var(--info)" />;
      case "poll":
        return <Radio size={16} color="var(--warning)" />;
      case "status_change":
      case "issue_update":
        return <RefreshCw size={16} color="var(--success)" />;
      default:
        return <BellRing size={16} color="var(--primary)" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      {isOpen && (
        <div className="notif-backdrop animate-fade" onClick={onClose} />
      )}
      <div className={`notif-drawer ${isOpen ? "open" : ""}`}>
        <div className="notif-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
            <BellRing size={20} color="var(--primary)" />
            Notifications
          </h3>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: "0.4rem", borderRadius: "50%", minWidth: "32px", height: "32px" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="notif-body">
          {notifications.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              color: "var(--text-muted)",
              gap: "0.5rem"
            }}>
              <BellRing size={32} opacity={0.5} />
              <p style={{ fontSize: "0.9rem" }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`notif-item ${notif.isRead ? "" : "unread"}`}
                onClick={() => !notif.isRead && onMarkRead(notif.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {getIcon(notif.type)}
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {notif.title}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(notif.id);
                      }}
                      style={{ padding: "0.15rem", borderRadius: "4px", minWidth: "20px", height: "20px" }}
                      title="Mark as Read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
                
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", lineHeight: 1.4 }}>
                  {notif.message}
                </p>

                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "right" }}>
                  {formatDate(notif.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
