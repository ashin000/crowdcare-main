import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, ShieldAlert, Key, ClipboardList, TrendingUp, BarChart2, 
  Settings, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { getIssues, getUsers } from "../../firebase/firestore";

const COLORS = ["#2b6777", "#52ab98", "#df9008", "#ef4444", "#c8d8e4"];

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystemData = async () => {
      setLoading(true);
      try {
        const [allUsers, allIssues] = await Promise.all([
          getUsers(),
          getIssues()
        ]);
        setUsers(allUsers);
        setIssues(allIssues);
      } catch (err) {
        console.error("Admin dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSystemData();
  }, []);

  // System calculations
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.isVerified || u.identityVerification?.status === "verified").length;
  const verifiedRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

  const totalIssues = issues.length;
  const activeIssues = issues.filter(i => ["reported", "acknowledged", "in_progress"].includes(i.status)).length;
  const spamIssues = issues.filter(i => i.isSpam).length;

  const pendingPromotions = users.filter(u => u.promotionStatus === "pending").length;

  // Chart Data: Roles
  const roleCounts = {};
  users.forEach(u => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });
  const roleData = Object.keys(roleCounts).map(role => ({
    name: role.toUpperCase(),
    value: roleCounts[role]
  }));

  // Chart Data: Issue Priority
  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  issues.forEach(i => {
    if (priorityCounts[i.priority] !== undefined) {
      priorityCounts[i.priority]++;
    }
  });
  const priorityData = Object.keys(priorityCounts).map(pri => ({
    name: pri.toUpperCase(),
    count: priorityCounts[pri]
  }));

  return (
    <div className="animate-fade container">
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Settings size={24} /> Admin Control Center
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Municipal governance console • Database oversight & audit controls
          </p>
        </div>
        
        {/* Sub Navigation links */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link to="/admin/users" className="btn btn-secondary" style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <Users size={14} /> Manage Users {pendingPromotions > 0 && <span style={{ background: "var(--warning)", color: "black", padding: "0.1rem 0.4rem", borderRadius: "50%", fontSize: "0.7rem", fontWeight: 800 }}>{pendingPromotions}</span>}
          </Link>
          <Link to="/admin/issues" className="btn btn-secondary" style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <ClipboardList size={14} /> Moderate Issues
          </Link>
          <Link to="/admin/audit" className="btn btn-secondary" style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <Key size={14} /> Audit Trail Log
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary-light)", padding: "1rem", borderRadius: "12px" }}>
            <Users color="var(--primary)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>KYC Verification</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{verifiedRate}%</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{verifiedUsers} of {totalUsers} users verified</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--warning-light)", padding: "1rem", borderRadius: "12px" }}>
            <AlertTriangle color="var(--warning)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Promotion Queue</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{pendingPromotions}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Volunteer / Officer requests</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--danger-light)", padding: "1rem", borderRadius: "12px" }}>
            <ShieldAlert color="var(--danger)" size={24} />
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Flagged Spam Tickets</h4>
            <h2 style={{ fontSize: "1.8rem" }}>{spamIssues}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Civic tickets isolated</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p>Loading analytics metrics...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem", marginBottom: "2rem" }} className="grid-2">
          {/* Pie chart: role distribution */}
          <div className="glass-card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>System Role Demographics</h3>
            <div style={{ width: "100%", height: "250px", display: "flex", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-dark)", borderColor: "var(--border)" }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Priority weights */}
          <div className="glass-card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Tickets by Priority Urgency</h3>
            <div style={{ width: "100%", height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: "var(--bg-dark)", borderColor: "var(--border)" }} />
                  <Bar dataKey="count" fill="var(--danger)" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === "CRITICAL" ? "#ef4444" : "var(--primary)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Control shortcuts panel */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>System Admin Checklist</h3>
        <div className="grid-3" style={{ fontSize: "0.85rem", gap: "1rem" }}>
          <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Verify User Requests</h4>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Approve municipal roles and examine KYC details.</p>
            <Link to="/admin/users" style={{ color: "var(--primary)", fontWeight: 700 }}>Inspect Queue →</Link>
          </div>
          <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Moderate Spam Issues</h4>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Inspect flagged spam tickets or edit priorities.</p>
            <Link to="/admin/issues" style={{ color: "var(--primary)", fontWeight: 700 }}>Moderate Tickets →</Link>
          </div>
          <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Audit Database Logs</h4>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Inspect system logs and trace administrative changes.</p>
            <Link to="/admin/audit" style={{ color: "var(--primary)", fontWeight: 700 }}>View Security Log →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
