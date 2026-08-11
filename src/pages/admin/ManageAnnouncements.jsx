import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Megaphone, Trash2, AlertCircle } from "lucide-react";
import { getAnnouncements, deleteAnnouncement } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";

export default function ManageAnnouncements() {
  const { currentUser } = useAuthContext();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnn = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnn();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement? This action is logged.")) return;
    try {
      await deleteAnnouncement(id, currentUser);
      alert("Announcement deleted successfully.");
      await loadAnn();
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  return (
    <div className="animate-fade container" style={{ maxWidth: "800px" }}>
      {/* Back button */}
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Moderate Announcements</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Review and moderate official municipal announcements published to the citizen dashboards.
      </p>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading announcements registry...</p>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>No active announcements found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {announcements.map(ann => (
              <div 
                key={ann.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "1.25rem",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  background: "var(--bg-card)"
                }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ background: "var(--info-light)", padding: "0.5rem", borderRadius: "8px", height: "fit-content" }}>
                    <Megaphone size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{ann.title}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>{ann.content}</p>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      Published by: <strong>{ann.officialName}</strong> • Date: {new Date(ann.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="btn btn-danger"
                  style={{ padding: "0.5rem", borderRadius: "8px" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
