import React, { useState } from "react";
import { LogIn, Mail, Lock, Shield, User } from "lucide-react";
import { authService } from "../services/firebase";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [role, setRole] = useState("citizen"); // citizen or official
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await authService.signIn(email, password);
      // Ensure the logged in user matches the role selected in the toggle
      if (user.role !== role) {
        throw new Error(`This account is registered as a ${user.role}. Please select the correct portal.`);
      }
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      padding: "2rem 0"
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            background: "var(--primary-light)",
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            marginBottom: "1rem"
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Welcome Back</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Access your CrowdCare civic portal</p>
        </div>

        {/* Role Toggle Selector */}
        <div style={{
          display: "flex",
          background: "rgba(0,0,0,0.2)",
          padding: "0.25rem",
          borderRadius: "10px",
          marginBottom: "1.5rem"
        }}>
          <button 
            type="button"
            className="btn"
            onClick={() => setRole("citizen")}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: role === "citizen" ? "var(--primary)" : "transparent",
              color: role === "citizen" ? "white" : "var(--text-secondary)",
              gap: "0.4rem"
            }}
          >
            <User size={14} />
            Citizen Portal
          </button>
          <button 
            type="button"
            className="btn"
            onClick={() => setRole("official")}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: role === "official" ? "var(--success)" : "transparent",
              color: role === "official" ? "white" : "var(--text-secondary)",
              gap: "0.4rem"
            }}
          >
            <Shield size={14} />
            Official Portal
          </button>
        </div>

        {error && (
          <div style={{
            padding: "0.75rem 1rem",
            background: "var(--danger-light)",
            border: "1px solid var(--danger)",
            borderRadius: "8px",
            color: "var(--danger)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ position: "relative", marginBottom: "2rem" }}>
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", background: role === "official" ? "var(--success)" : "var(--primary)" }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <button 
            onClick={onSwitchToRegister}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--primary)", 
              fontWeight: 600, 
              cursor: "pointer",
              padding: 0
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
