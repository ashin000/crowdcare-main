import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart2, Trash2, AlertCircle } from "lucide-react";
import { getPolls, deletePoll } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";

export default function ManagePolls() {
  const { currentUser } = useAuthContext();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPollsList = async () => {
    setLoading(true);
    try {
      const data = await getPolls();
      setPolls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPollsList();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this poll? This action is logged.")) return;
    try {
      await deletePoll(id, currentUser);
      alert("Poll deleted successfully.");
      await loadPollsList();
    } catch (err) {
      alert("Failed to delete poll.");
    }
  };

  const getVoteSum = (votesMap) => {
    if (!votesMap) return 0;
    return Object.values(votesMap).reduce((sum, val) => sum + val, 0);
  };

  return (
    <div className="animate-fade container" style={{ maxWidth: "800px" }}>
      {/* Back button */}
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Moderate Surveys & Polls</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Monitor democratic community prioritization surveys and manage live voting listings.
      </p>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading polls registry...</p>
        ) : polls.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>No active polls found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {polls.map(p => {
              const totalVotes = getVoteSum(p.votes);
              return (
                <div 
                  key={p.id}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    background: "var(--bg-card)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{p.title}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{p.description}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="btn btn-danger"
                      style={{ padding: "0.5rem", borderRadius: "8px" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Option vote metrics */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                    {p.options.map((opt, idx) => {
                      const count = p.votes[idx] || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={idx} style={{ fontSize: "0.85rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span>{opt}</span>
                            <span style={{ fontWeight: 700 }}>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${percent}%`, height: "100%", background: "var(--primary)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                    <span>Total responses: <strong>{totalVotes}</strong></span>
                    <span>Ends: {new Date(p.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
