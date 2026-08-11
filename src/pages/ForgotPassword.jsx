import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPassword } from "../firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send reset link. Please check the email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "75vh",
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
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Reset Password</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Get a secure link to recover your access</p>
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
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            padding: "0.75rem 1rem",
            background: "var(--success-light)",
            border: "1px solid var(--success)",
            borderRadius: "8px",
            color: "var(--success)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>Check your inbox for a password recovery link!</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "0.85rem", borderRadius: "10px" }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Remember your password?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
