import React, { useState } from "react";
import { LogIn, Mail, Lock, ShieldCheck, User, Eye, EyeOff } from "lucide-react";
import { authService } from "../services/firebase";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setEmail("citizen@example.com");
    setPassword("Admin@123456");
    setRole("citizen");
  };

  const fillDemoOfficial = () => {
    setEmail("official@example.com");
    setPassword("Admin@123456");
    setRole("official");
  };

  return (
    <div className="animate-fade" style={{ maxWidth: "480px", margin: "0 auto" }}>
      <div className="glass-card" style={{ padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--success) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            color: "white"
          }}>
            <LogIn size={28} />
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sign in to your CrowdCare account</p>
        </div>

        {/* Role selector */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "1.5rem"
        }}>
          <button
            type="button"
            onClick={() => setRole("citizen")}
            className={`btn ${role === "citizen" ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <User size={16} /> Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole("official")}
            className={`btn ${role === "official" ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <ShieldCheck size={16} /> Official
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                  display: "flex", alignItems: "center", padding: 0
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "var(--danger-light)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--danger)",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              fontSize: "0.85rem",
              marginBottom: "1.25rem"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.9rem", fontSize: "1rem" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Demo accounts */}
        <div style={{
          marginTop: "2rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem"
        }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "0.75rem" }}>
            Quick Demo Access
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={fillDemoCitizen} style={{ flex: 1, fontSize: "0.85rem" }}>
              <User size={14} /> Demo Citizen
            </button>
            <button className="btn btn-secondary" onClick={fillDemoOfficial} style={{ flex: 1, fontSize: "0.85rem" }}>
              <ShieldCheck size={14} /> Demo Official
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}