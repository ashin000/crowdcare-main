import React from "react";
import { ShieldAlert, TrendingUp, BarChart2, Megaphone, ArrowRight } from "lucide-react";
import horizontalBgImg from "../assets/horizontal_bg.png";

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="animate-fade" style={{ paddingBottom: "4rem" }}>
      {/* Hero Section */}
      <header className="glass-card" style={{
        padding: "5.5rem 2rem",
        backgroundImage: `linear-gradient(135deg, rgba(5, 5, 26, 0.6) 0%, rgba(5, 5, 26, 0.48) 100%), url(${horizontalBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        marginBottom: "3rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          right: "-50%",
          bottom: "-50%",
          background: "radial-gradient(circle, rgba(255, 153, 51, 0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "3.6rem", 
            lineHeight: 1.15, 
            marginBottom: "1.5rem",
            color: "#FF9933", // Saffron
            fontFamily: "var(--font-heading)",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.85)"
          }}>
            Bridge the Gap Between <br />
            <span style={{ color: "#138808", textShadow: "0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.85)" }}>Citizens & Government</span>
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            color: "#FFFFFF", // White text
            fontWeight: "600",
            maxWidth: "700px", 
            margin: "0 auto 2.5rem",
            lineHeight: 1.6,
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.85)"
          }}>
            CrowdCare is a transparent civic engagement portal allowing citizens to report local infrastructure issues, vote on municipal priorities, and monitor resolution progress in real-time.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              className="btn" 
              onClick={onGetStarted} 
              style={{ 
                background: "#FF9933", // Saffron
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(255, 153, 51, 0.2)",
                padding: "0.85rem 2rem", 
                fontSize: "1.05rem" 
              }}
            >
              Get Started Now <ArrowRight size={18} />
            </button>
            <a 
              href="#features" 
              className="btn" 
              style={{ 
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                padding: "0.85rem 2rem", 
                fontSize: "1.05rem", 
                display: "inline-flex", 
                alignItems: "center" 
              }}
            >
              Explore Features
            </a>
          </div>
        </div>
      </header>

      {/* Stats Counter Section */}
      <section style={{ marginBottom: "4rem" }}>
        <div className="grid-3">
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--success)", marginBottom: "0.5rem" }}>94.2%</h2>
            <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>Issue Resolution Rate</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Verified by municipal audits this quarter</p>
          </div>
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--primary)", marginBottom: "0.5rem" }}>12,800+</h2>
            <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>Active Citizens Engaged</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Collaborating to report issues daily</p>
          </div>
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--info)", marginBottom: "0.5rem" }}>2.4 hrs</h2>
            <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>Average Acknowledgment</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Fast response time from municipal teams</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ marginBottom: "2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2.5rem", fontFamily: "var(--font-heading)" }}>
          How CrowdCare Transforms Civic Collaboration
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
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Intuitive Issue Reporting</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Snap a photo of the local issue (road potholes, water leakage, garbage overflow), tag the exact location, select priority, and submit in seconds.
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
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Transparent Status Tracking</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Track the ticket progression timeline from "Reported" to "Acknowledged", "In Progress", and "Resolved". Receive instant updates at each step.
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
                Vote on upcoming neighborhood projects and civic budgets. Provide immediate feedback so officials allocate funds where they are needed most.
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
              <Megaphone size={22} color="var(--info)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Direct official Announcements</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Receive official communications directly regarding scheduled repairs, utility maintenance shutdowns, vaccination drives, and safety warnings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
