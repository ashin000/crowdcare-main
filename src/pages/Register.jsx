import React, { useState } from "react";
import { UserPlus, Mail, Lock, Shield, User, Phone, MapPin, Building } from "lucide-react";
import { authService } from "../services/firebase";

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [role, setRole] = useState("citizen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Chennai");
  const [district, setDistrict] = useState("Chennai");
  const [state, setState] = useState("Tamil Nadu");
  const [department, setDepartment] = useState("Sanitation & Waste");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const additionalInfo = {
        name,
        role,
        phone,
        address,
        city,
        district,
        state,
        department: role === "official" ? department : ""
      };
      const user = await authService.signUp(email, password, additionalInfo);
      onRegisterSuccess(user);
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: "2rem 0"
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "550px", padding: "2.5rem 2rem" }}>
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
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Create Account</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Join CrowdCare civic engagement portal</p>
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
            Citizen
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
            Government Official
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ashwin Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
                required 
              />
            </div>
          </div>

          {role === "official" && (
            <div className="form-group">
              <label className="form-label">Assigned Department</label>
              <div style={{ position: "relative" }}>
                <Building size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <select 
                  className="form-control" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                >
                  <option value="Sanitation & Waste">Sanitation & Waste Management</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Water & Sewage Supply">Water & Sewage Supply</option>
                  <option value="Electricity & Lights">Electricity & Lights</option>
                  <option value="Public Security & Animals">Public Security & Animals</option>
                  <option value="Other">Other Admin Department</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Address</label>
            <div style={{ position: "relative" }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <textarea 
                className="form-control" 
                placeholder="Door No, Street Name..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: "2.5rem", minHeight: "60px" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                className="form-control" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input 
                type="text" 
                className="form-control" 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input 
                type="text" 
                className="form-control" 
                value={state}
                onChange={(e) => setState(e.target.value)}
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
            {loading ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <button 
            onClick={onSwitchToLogin}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--primary)", 
              fontWeight: 600, 
              cursor: "pointer",
              padding: 0
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
