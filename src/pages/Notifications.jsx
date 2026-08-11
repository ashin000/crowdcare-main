import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, Megaphone, Radio, RefreshCw, ShieldCheck, CheckSquare, Trash } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { getNotifications, markNotificationRead } from "../firebase/firestore";

export default function Notifications() {
  const { currentUser } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const list = await getNotifications(currentUser.uid);
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => markNotificationRead(n.id)));
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone size={18} className="text-info" />;
      case "poll":
        return <Radio size={18} className="text-warning" />;
      case "status_changed":
      case "status_change":
        return <RefreshCw size={18} className="text-success" />;
      case "issue_assigned":
        return <ShieldCheck size={18} className="text-primary" />;
      default:
        return <Bell size={18} className="text-primary" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="animate-fade container" style={{ maxWidth: "700px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-heading)" }}>Notification Center</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Keep track of updates on your reported issues and community news.
          </p>
        </div>
        
        {notifications.filter(n => !n.isRead).length > 0 && (
          <button 
            onClick={handleMarkAllRead} 
            className="btn btn-secondary" 
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
          >
            <CheckSquare size={14} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.01)" }}>
          <BellOff size={40} opacity={0.3} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.9rem" }}>Your inbox is empty. No notifications received.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className="glass-card animate-scale"
              style={{
                padding: "1.25rem",
                background: notif.isRead ? "var(--bg-card)" : "rgba(79, 70, 229, 0.04)",
                borderLeft: notif.isRead ? "1px solid var(--border)" : "4px solid var(--primary)",
                transition: "all 0.2s ease",
                cursor: notif.isRead ? "default" : "pointer"
              }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: "0.5rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  marginTop: "2px"
                }}>
                  {getIcon(notif.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{notif.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(notif.createdAt)}</span>
                  </div>
                  
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
                    {notif.message}
                  </p>

                  {notif.issueId && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <Link 
                        to={`/issues/${notif.issueId}`} 
                        className="btn btn-secondary" 
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", borderRadius: "6px" }}
                      >
                        View Associated Ticket
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
