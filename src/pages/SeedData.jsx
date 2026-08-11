import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Database, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { seedAllCollections } from "../firebase/firestore";

export default function SeedData() {
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check connection status
  const isFirebaseMode = localStorage.getItem("crowdcare_firebase_configured") === "true";

  const triggerSeed = async () => {
    setSeeding(true);
    try {
      await seedAllCollections();
      setSuccess(true);
    } catch (err) {
      alert("Failed to initialize database seeding: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="animate-fade container" style={{ maxWidth: "600px", marginTop: "4rem" }}>
      <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
        
        <div style={{
          background: "var(--primary-light)",
          width: "60px",
          height: "60px",
          borderRadius: "12px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary)",
          marginBottom: "1.5rem"
        }}>
          <Database size={32} />
        </div>

        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>System Database Seeding</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Initialize or reset sample municipal data, including categories, local zones, civic issues, announcements, and polls.
        </p>

        {/* Mode badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: isFirebaseMode ? "rgba(16, 185, 129, 0.1)" : "rgba(223, 144, 8, 0.1)",
          color: isFirebaseMode ? "var(--success)" : "var(--warning)",
          padding: "0.4rem 1rem",
          borderRadius: "8px",
          fontSize: "0.8rem",
          fontWeight: 700,
          marginBottom: "2rem",
          border: isFirebaseMode ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(223, 144, 8, 0.2)"
        }}>
          {isFirebaseMode ? "✓ Mode: Active Firebase Firestore" : "⚠ Mode: LocalStorage Sandbox"}
        </div>

        {success ? (
          <div className="animate-scale" style={{ marginBottom: "2rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--success-light)",
              border: "1px solid var(--success)",
              color: "var(--success)",
              padding: "1rem",
              borderRadius: "10px",
              textAlign: "left",
              fontSize: "0.9rem",
              marginBottom: "1.5rem"
            }}>
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Database Seeded Successfully!</strong>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                  Sample issues, category structures, comment threads, and priorities loaded.
                </p>
              </div>
            </div>
            
            <Link to="/issues" className="btn btn-primary" style={{ width: "100%" }}>
              Explore Civic Feed <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <button 
            onClick={triggerSeed} 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "1rem" }}
            disabled={seeding}
          >
            {seeding ? "Populating Database..." : "Seed Default Dataset"}
          </button>
        )}

        <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <p>
            * Note: Seeding in Firebase mode adds documents to your cloud store. Seeding in LocalStorage mode resets the sandbox data arrays.
          </p>
        </div>

      </div>
    </div>
  );
}
