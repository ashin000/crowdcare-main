import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Award, CheckSquare, Clock, Filter, Eye, AlertCircle, 
  MapPin, CheckCircle2 
} from "lucide-react";
import { getIssues, getCategories, assignIssue } from "../../firebase/firestore";
import { useAuthContext } from "../../context/AuthContext";
import MapView from "../../components/MapView";

export default function VolunteerDashboard() {
  const { currentUser } = useAuthContext();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [catFilter, setCatFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        getIssues(),
        getCategories()
      ]);
      setIssues(list);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptOpportunity = async (issueId) => {
    try {
      await assignIssue(issueId, currentUser.uid, "volunteer", currentUser);
      alert("Opportunity accepted! This ticket is now in your Assigned Tasks.");
      await loadData();
    } catch (err) {
      alert("Failed to accept opportunity.");
    }
  };

  // Calculations
  const myAssigned = issues.filter(i => i.assignedVolunteerId === currentUser.uid);
  const totalAssigned = myAssigned.length;
  const completedTasks = myAssigned.filter(i => i.status === "resolved").length;
  const pendingTasks = totalAssigned - completedTasks;

  // Available opportunities: unresolved (reported/acknowledged), not assigned to any volunteer
  const opportunities = issues.filter(i => 
    ["reported", "acknowledged"].includes(i.status) && 
    !i.assignedVolunteerId
  );

  const filteredOpportunities = opportunities.filter(i => 
    catFilter === "all" || i.category === catFilter
  );

  return (
    <div className="animate-fade container">
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        background: "linear-gradient(135deg, rgba(223, 144, 8, 0.05) 0%, transparent 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h2 style={{ fontSize: "1.6rem" }}>Volunteer Center: {currentUser?.fullName || currentUser?.name}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            District: {currentUser?.district || "Chennai"} • Community Volunteer
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/volunteer/tasks" className="btn btn-primary">
            View Assigned Tasks ({pendingTasks})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--success-light)", padding: "1rem", borderRadius: "12px" }}>
            <CheckCircle2 color="var(--success)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Completed Tasks</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{completedTasks}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tickets resolved by you</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--warning-light)", padding: "1rem", borderRadius: "12px" }}>
            <Clock color="var(--warning)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Active Tasks</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{pendingTasks}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Currently in progress</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary-light)", padding: "1rem", borderRadius: "12px" }}>
            <Award color="var(--primary)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Volunteer Badge</h4>
            <h2 style={{ fontSize: "1.6rem" }}>Silver Tier</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Community leader rank</p>
          </div>
        </div>
      </div>

      {/* Map of Open Opportunities */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Opportunities Map</h3>
        <MapView markers={opportunities} height="280px" />
      </div>

      {/* Opportunities List */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckSquare size={18} />
            Open Civic Opportunities ({filteredOpportunities.length})
          </h3>

          <select className="form-control" style={{ width: "160px" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading options...</p>
        ) : filteredOpportunities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>No open volunteering opportunities in your area right now.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpportunities.map(iss => (
                  <tr key={iss.id}>
                    <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{iss.issueId}</td>
                    <td style={{ fontWeight: 600 }}>{iss.title}</td>
                    <td style={{ fontSize: "0.85rem" }}>{iss.categoryName || iss.category}</td>
                    <td>
                      <span className={`badge badge-${iss.priority}`}>{iss.priority}</span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "250px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {iss.location?.address}
                    </td>
                    <td style={{ display: "flex", gap: "0.5rem" }}>
                      <Link to={`/issues/${iss.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                        <Eye size={12} /> View
                      </Link>
                      <button 
                        onClick={() => handleAcceptOpportunity(iss.id)}
                        className="btn btn-primary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", background: "var(--success)" }}
                      >
                        Accept Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
