import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg-darker)",
      color: "var(--text-secondary)",
      padding: "3rem 1.5rem 1.5rem 1.5rem",
      fontSize: "0.9rem",
      lineHeight: 1.6
    }}>
      <div className="container" style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: "2rem",
        marginBottom: "2rem"
      }} className="footer-grid">
        
        {/* Brand Column */}
        <div>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem", fontFamily: "var(--font-heading)" }}>
            Crowd<span style={{ color: "var(--success)" }}>Care</span>
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "280px" }}>
            A civic-tech initiative to bridge the gap between citizens and local government for a cleaner, safer, and better-managed community.
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <a href="#" className="btn btn-secondary" style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "36px", height: "36px" }}><Github size={16} /></a>
            <a href="#" className="btn btn-secondary" style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "36px", height: "36px" }}><Twitter size={16} /></a>
            <a href="#" className="btn btn-secondary" style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "36px", height: "36px" }}><Facebook size={16} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Platform</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><Link to="/issues" style={{ color: "var(--text-muted)" }}>Explore Issues</Link></li>
            <li><Link to="/map" style={{ color: "var(--text-muted)" }}>Civic Map</Link></li>
            <li><Link to="/announcements" style={{ color: "var(--text-muted)" }}>Announcements</Link></li>
            <li><Link to="/polls" style={{ color: "var(--text-muted)" }}>Community Polls</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Company</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>About Us</a></li>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>How It Works</a></li>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>Contact Support</a></li>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>Help FAQ</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Legal</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>Terms of Service</a></li>
            <li><a href="#" style={{ color: "var(--text-muted)" }}>Disclaimers</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "1.5rem",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.8rem"
      }}>
        <p>© 2026 CrowdCare Portal. Chennai City Municipal Corporation. All rights reserved.</p>
        <p style={{ marginTop: "0.25rem", fontSize: "0.7rem" }}>
          Built with React, Vite, Tailwind CSS, Google Maps API, and Firebase.
        </p>
      </div>

      {styleTag}
    </footer>
  );
}

const styleTag = (
  <style>{`
    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 1.5rem !important;
      }
    }
    @media (max-width: 480px) {
      .footer-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `}</style>
);
