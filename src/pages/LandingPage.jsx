import React from "react";
import { ClipboardList, Megaphone, Radio, ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="animate-fade">
      {/* Hero Section */}
      <section style={{
        textAlign: "center",
        padding: "4rem 0 3rem",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--success-light)",
          border: "1px solid rgba(82, 171, 152, 0.3)",
          color: "var(--success)",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "2rem"
        }}>
          <ShieldCheck size={16} />
          Chennai City Municipal Corporation
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.15,
          marginBottom: "1.5rem"
        }}>
          Report Civic Issues,
          <br />
          <span style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--success) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Track Real Progress
          </span>
        </h1>

        <p style={{
          fontSize: "1.15rem",
          color: "var(--text-secondary)",
          maxWidth: "600px",
          margin: "0 auto 2.5rem",
          lineHeight: 1.7
        }}>
          CrowdCare connects citizens with their municipal government. Report potholes, 
          sanitation problems, water leaks, and more — then watch as officials acknowledge 
          and resolve them in real time.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onGetStarted} style={{ fontSize: "1.05rem", padding: "1rem 2rem" }}>
            Get Started <ArrowRight size={18} />
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
          marginTop: "3rem",
          flexWrap: "wrap"
        }}>
          {[
            { value: "2.4K+", label: "Issues Reported" },
            { value: "85%", label: "Resolution Rate" },
            { value: "48h", label: "Avg. Response Time" }
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--success)" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2.5rem" }}>
          How It Works
        </h2>
        <div className="grid-3">
          {[
            {
              icon: <ClipboardList size={28} color="var(--primary)" />,
              title: "Report an Issue",
              desc: "Snap a photo, drop a pin, and describe the problem. Your report goes straight to the right department."
            },
            {
              icon: <Megaphone size={28} color="var(--info)" />,
              title: "Official Acknowledgment",
              desc: "Municipal officials receive every report, acknowledge it, and assign it for review and action."
            },
            {
              icon: <Radio size={28} color="var(--warning)" />,
              title: "Track Resolution",
              desc: "Follow real-time status updates from reported → acknowledged → in progress → resolved."
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background: "var(--bg-darker)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem"
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{feature.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ marginTop: "4rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>
          What Can You Report?
        </h2>
        <div className="grid-3">
          {[
            { emoji: "🗑️", name: "Sanitation & Waste", desc: "Garbage pileups, overflowing bins, drainage clogging" },
            { emoji: "🛣️", name: "Roads & Potholes", desc: "Potholes, broken footpaths, damaged street signs" },
            { emoji: "🚰", name: "Water & Sewage", desc: "Pipe bursts, sewage leaks, contaminated supply" },
            { emoji: "⚡", name: "Electricity & Lights", desc: "Broken streetlights, hanging wires, load shedding" },
            { emoji: "🛡️", name: "Public Safety", desc: "Stray animals, illegal parking, poor lighting" }
          ].map((cat, idx) => (
            <div key={idx} className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem" }}>{cat.emoji}</div>
              <div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>{cat.name}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        marginTop: "4rem",
        textAlign: "center",
        padding: "3rem 2rem",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(43, 103, 119, 0.15) 0%, rgba(82, 171, 152, 0.1) 100%)",
        border: "1px solid var(--border)"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Be Part of the Change
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.05rem" }}>
          Join thousands of citizens making their city better — one report at a time.
        </p>
        <button className="btn btn-primary" onClick={onGetStarted} style={{ fontSize: "1.05rem", padding: "1rem 2rem" }}>
          Create Your Account <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}