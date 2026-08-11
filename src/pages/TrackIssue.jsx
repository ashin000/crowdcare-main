import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, AlertCircle, ArrowRight } from "lucide-react";
import { getIssueById, getIssues, getStatusHistory } from "../firebase/firestore";
import { useAuthContext } from "../context/AuthContext";
import IssueTimeline from "../components/IssueTimeline";

export default function TrackIssue() {
  const { currentUser } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get("id") || "";

  const [ticketId, setTicketId] = useState(queryId);
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load current user's submitted issues for quick select
    if (currentUser) {
      getIssues().then(list => {
        setMyIssues(list.filter(i => i.reportedBy === currentUser.uid));
      }).catch(console.error);
    }
  }, [currentUser]);

  const loadTicket = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setIssue(null);
    setHistory([]);
    try {
      const data = await getIssueById(id.trim());
      if (data) {
        setIssue(data);
        const histLogs = await getStatusHistory(data.id);
        setHistory(histLogs);
      } else {
        setError("No civic ticket matches the provided ID.");
      }
    } catch (err) {
      setError("Failed to retrieve ticket info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      loadTicket(queryId);
    }
  }, [queryId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setSearchParams({ id: ticketId.trim() });
  };

  const handleSelectMyIssue = (id) => {
    setTicketId(id);
    setSearchParams({ id });
  };

  return (
    <div className="animate-fade container" style={{ maxWidth: "800px" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Track Civic Ticket Status</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
        Enter a unique issue ID to track the real-time resolution timeline of local problems.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="track-layout">
        
        {/* Left Side: Search form and list */}
        <div>
          <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Enter Issue ID</h4>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. CC-2026-000001"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                style={{ textTransform: "uppercase" }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem" }}>
                <Search size={16} />
              </button>
            </form>
          </div>

          {currentUser && myIssues.length > 0 && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>My Submitted Tickets</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "250px", overflowY: "auto" }}>
                {myIssues.map(iss => (
                  <button 
                    key={iss.id} 
                    onClick={() => handleSelectMyIssue(iss.id)}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      background: queryId === iss.id ? "var(--primary-light)" : "rgba(255,255,255,0.01)",
                      border: queryId === iss.id ? "1px solid var(--primary)" : "1px solid var(--border)"
                    }}
                  >
                    <span>{iss.issueId}</span>
                    <span className={`badge badge-status-${iss.status}`} style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
                      {iss.status.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Results timeline */}
        <div>
          {loading && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p>Fetching ticket logs...</p>
            </div>
          )}

          {error && (
            <div className="glass-card" style={{ border: "1px solid var(--danger)", background: "rgba(239, 68, 68, 0.02)", textAlign: "center", padding: "2rem" }}>
              <AlertCircle size={32} color="var(--danger)" style={{ margin: "0 auto 0.75rem" }} />
              <p style={{ fontSize: "0.9rem" }}>{error}</p>
            </div>
          )}

          {issue && (
            <div className="animate-scale">
              <div className="glass-card" style={{ marginBottom: "1rem", padding: "1rem 1.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Active Ticket: {issue.issueId}</span>
                <h3 style={{ fontSize: "1.2rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>{issue.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Category: {issue.categoryName} • Status: <span className="badge badge-low" style={{ background: "rgba(255,255,255,0.05)", textTransform: "capitalize" }}>{issue.status.replace("_", " ")}</span>
                </p>
                <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                  <Link to={`/issues/${issue.id}`} style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    View Full Details Page <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <IssueTimeline history={history} currentStatus={issue.status} />
            </div>
          )}

          {!loading && !error && !issue && (
            <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.01)" }}>
              <Search size={32} opacity={0.3} style={{ margin: "0 auto 1rem" }} />
              <p style={{ fontSize: "0.85rem" }}>Awaiting Ticket search. Select an issue to inspect its timeline.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .track-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
