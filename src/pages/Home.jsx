import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, TrendingUp, BarChart2, Megaphone, ArrowRight, Activity, Users, CheckCircle } from "lucide-react";
import { getIssues, getUsers } from "../firebase/firestore";
import MapView from "../components/MapView";

export default function Home() {
  const [stats, setStats] = useState({
    total: 142,
    resolved: 118,
    active: 24,
    citizens: 1280
  });
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const issuesList = await getIssues();
        const usersList = await getUsers();
        
        const total = issuesList.length;
        const resolved = issuesList.filter(i => i.status === "resolved").length;
        const active = total - resolved;
        const citizens = usersList.filter(u => u.role === "citizen").length || 1280;

        setStats({ total, resolved, active, citizens });
        setRecentIssues(issuesList.slice(0, 5));
      } catch (err) {
        console.error("Error loading home page statistics:", err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="animate-fade" style={{ paddingBottom: "4rem" }}>
      {/* Hero Section */}
      <header className="glass-card" style={{
        padding: "5rem 2rem",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(43, 103, 119, 0.08) 0%, rgba(82, 171, 152, 0.04) 100%)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        marginBottom: "3rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          right: "-50%",
          bottom: "-50%",
          background: "radial-gradient(circle, rgba(43, 103, 119, 0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            lineHeight: 1.1, 
            marginBottom: "1.5rem",
            color: "var(--primary)"
          }}>
            Bridge the Gap Between <br />
            <span style={{ color: "var(--success)" }}>Citizens & Government</span>
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            color: "var(--text-secondary)", 
            maxWidth: "700px", 
            margin: "0 auto 2.5rem",
            lineHeight: 1.6
          }}>
            Report local civic issues, track real-time resolution timelines, participate in community prioritization polls, and build a better neighborhood.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/report-issue" className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}>
              Report an Issue <ArrowRight size={18} />
            </Link>
            <Link to="/track" className="btn btn-secondary" style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}>
              Track an Issue
            </Link>
            <Link to="/issues" className="btn btn-outline" style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}>
              Explore Issues
            </Link>
          </div>
        </div>
      </header>

      {/* Statistics Row */}
      <section style={{ marginBottom: "4rem" }}>
        <div className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "0.75rem", background: "var(--primary-light)", borderRadius: "50%", color: "var(--primary)", marginBottom: "0.75rem" }}>
              <Activity size={24} />
            </div>
            <h2 style={{ fontSize: "2.2rem", color: "var(--primary)", marginBottom: "0.25rem" }}>{stats.total}</h2>
            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Total Issues Reported</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Civic problems documented by citizens</p>
          </div>
          
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "0.75rem", background: "var(--success-light)", borderRadius: "50%", color: "var(--success)", marginBottom: "0.75rem" }}>
              <CheckCircle size={24} />
            </div>
            <h2 style={{ fontSize: "2.2rem", color: "var(--success)", marginBottom: "0.25rem" }}>{stats.resolved}</h2>
            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Resolved Tickets</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Patched, cleaned, or restored issues</p>
          </div>

          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "0.75rem", background: "var(--warning-light)", borderRadius: "50%", color: "var(--warning)", marginBottom: "0.75rem" }}>
              <Users size={24} />
            </div>
            <h2 style={{ fontSize: "2.2rem", color: "var(--warning)", marginBottom: "0.25rem" }}>{stats.citizens}</h2>
            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Active Citizens</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Collaborating in local wards</p>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" style={{ marginBottom: "4rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2.5rem", fontFamily: "var(--font-heading)" }}>
          How CrowdCare Transforms Civic Engagement
        </h2>
        
        <div className="grid-2">
          <div className="glass-card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
            <div style={{
              background: "var(--danger-light)",
              border: "1px solid var(--danger)",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <ShieldAlert size={22} color="var(--danger)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Submit & Track Issues</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Tag potholes, streetlights, or waste dumps. Upload files, capture GPS locations, and track resolutions transparently.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
            <div style={{
              background: "var(--success-light)",
              border: "1px solid var(--success)",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <TrendingUp size={22} color="var(--success)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Transparent Governance</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Track official action logs. View before/after status reports and assigned contractors or volunteers.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
            <div style={{
              background: "var(--warning-light)",
              border: "1px solid var(--warning)",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <BarChart2 size={22} color="var(--warning)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Democratic Priority Polls</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Participate in neighborhood prioritize surveys. Help local officials decide where budget funds are allocated first.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
            <div style={{
              background: "var(--info-light)",
              border: "1px solid var(--info)",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Megaphone size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Live official Announcements</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Receive notifications about scheduled utility pipe maintenance, road closures, safety messages, and local civic announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Preview section */}
      <section className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.6rem" }}>Community Civic Map</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Explore recently reported infrastructure issues mapped in real-time.
            </p>
          </div>
          <Link to="/map" className="btn btn-primary">
            View Full Screen Map
          </Link>
        </div>

        <MapView markers={recentIssues} height="350px" />
      </section>
    </div>
  );
}
