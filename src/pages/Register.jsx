import React, { useState } from "react";
import { UserPlus, Mail, Lock, User, Phone, MapPin, ShieldCheck, Building2, Eye, EyeOff } from "lucide-react";
import { authService } from "../services/firebase";

// Tamil Nadu districts with their major cities/towns
const DISTRICT_CITIES = {
  "Kanyakumari": ["Nagercoil", "Thuckalay", "Padmanabhapuram", "Colachel", "Marthandam", "Kuzhithurai", "Eraniel", "Killiyoor"],
  "Tirunelveli": ["Tirunelveli", "Palayamkottai", "Tenkasi", "Sankarankovil", "Nanguneri", "Ambasamudram", "Radhapuram"],
  "Thoothukudi": ["Thoothukudi", "Kovilpatti", "Sathankulam", "Tiruchendur", "Kayalpatnam", "Ottapidaram"],
  "Virudhunagar": ["Virudhunagar", "Sivakasi", "Rajapalayam", "Sattur", "Aruppukkottai", "Srivilliputhur"],
  "Madurai": ["Madurai", "Melur", "Usilampatti", "Thirumangalam", "Vadipatti", "Peraiyur"],
  "Dindigul": ["Dindigul", "Palani", "Kodaikanal", "Oddanchatram", "Nilakkottai", "Vedasandur"],
  "Theni": ["Theni", "Allinagaram", "Uthamapalayam", "Periyakulam", "Bodinayakanur", "Andipatti"],
  "Ramanathapuram": ["Ramanathapuram", "Rameswaram", "Paramakudi", "Kamuthi", "Tiruvadanai", "Mudukulathur"],
  "Sivaganga": ["Sivaganga", "Karaikudi", "Devakottai", "Manamadurai", "Tiruppattur", "Ilayangudi"],
  "Pudukkottai": ["Pudukkottai", "Aranthangi", "Alangudi", "Gandarvakottai", "Thirumayam", "Karambakudi"],
  "Thanjavur": ["Thanjavur", "Kumbakonam", "Papanasam", "Pattukottai", "Orathanadu", "Thiruvidaimarudur"],
  "Tiruvarur": ["Tiruvarur", "Nannilam", "Papanasam", "Mannargudi", "Nagapattinam"],
  "Nagapattinam": ["Nagapattinam", "Mayiladuthurai", "Sirkazhi", "Vedaranyam", "Kilvelur"],
  "Cuddalore": ["Cuddalore", "Chidambaram", "Panruti", "Neyveli", "Virudhachalam", "Bhuvanagiri"],
  "Villupuram": ["Villupuram", "Tindivanam", "Gingee", "Ulundurpet", "Kallakurichi", "Vanur"],
  "Kallakurichi": ["Kallakurichi", "Sankarapuram", "Ulundurpet", "Chinnasalem", "Tirukoilur"],
  "Vellore": ["Vellore", "Vaniyambadi", "Gudiyatham", "Ambur", "Tirupathur", "Arakkonam"],
  "Tirupattur": ["Tirupattur", "Ambur", "Vaniyambadi", "Jolarpettai", "Natrampalli"],
  "Ranipet": ["Ranipet", "Arcot", "Walajah", "Arakkonam", "Sholinghur"],
  "Kanchipuram": ["Kanchipuram", "Chengalpattu", "Sriperumbudur", "Tambaram", "Uthiramerur"],
  "Chengalpattu": ["Chengalpattu", "Madurantakam", "Tambaram", "Pallavaram", "Vandalur"],
  "Chennai": ["Chennai", "Tambaram", "Avadi", "Ambattur", "Sholinganallur", "Perambur", "Royapettah"],
  "Tiruvallur": ["Tiruvallur", "Avadi", "Poonamallee", "Gummidipoondi", "Tiruttani", "Ponneri"],
  "Salem": ["Salem", "Omalur", "Mettur", "Edapadi", "Attur", "Yercaud", "Veerapandi"],
  "Namakkal": ["Namakkal", "Rasipuram", "Tiruchengode", "Paramathi-Velur", "Kumarapalayam", "Kolli Hills"],
  "Dharmapuri": ["Dharmapuri", "Palacodu", "Pappireddipatti", "Pennagaram", "Harur", "Nallampalli"],
  "Krishnagiri": ["Krishnagiri", "Hosur", "Shoolagiri", "Denkanikottai", "Kaveripattinam", "Pochampalli"],
  "Erode": ["Erode", "Tiruppur", "Bhavani", "Gobichettipalayam", "Perundurai", "Anthiyur"],
  "Tiruppur": ["Tiruppur", "Palladam", "Udumalaipettai", "Dharapuram", "Avinashi", "Kangeyam"],
  "Coimbatore": ["Coimbatore", "Pollachi", "Mettupalayam", "Valparai", "Annur", "Sulur"],
  "Nilgiris": ["Ooty", "Coonoor", "Kotagiri", "Gudalur", "Kundah", "Pandalur"],
  "Tiruchirappalli": ["Tiruchirappalli", "Lalgudi", "Srirangam", "Thuraiyur", "Musiri", "Manapparai"],
  "Karur": ["Karur", "Kulithalai", "Aravakurichi", "Krishnarayapuram", "Kadavur"],
  "Perambalur": ["Perambalur", "Kunnam", "Ariyalur", "Veppanthattai"],
  "Ariyalur": ["Ariyalur", "Jayankondam", "Andimadam", "Udayarpalayam", "Sendurai"],
  "Tiruvannamalai": ["Tiruvannamalai", "Polur", "Arani", "Cheyyar", "Vandavasi", "Chetpet"],
};

const DISTRICTS = Object.keys(DISTRICT_CITIES).sort();
const DEFAULT_DISTRICT = "Kanyakumari";

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [role, setRole] = useState("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: DISTRICT_CITIES[DEFAULT_DISTRICT][0],
    district: DEFAULT_DISTRICT,
    state: "Tamil Nadu",
    department: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "district") {
      // Reset city to first option of newly selected district
      setForm({ ...form, district: value, city: DISTRICT_CITIES[value][0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (role === "official" && !form.department) {
      setError("Please enter your department.");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signUp(form.email, form.password, {
        name: form.name,
        role,
        phone: form.phone,
        address: form.address,
        city: form.city,
        district: form.district,
        state: form.state,
        department: role === "official" ? form.department : ""
      });
      onRegisterSuccess(user);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: "560px", margin: "0 auto" }}>
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
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Create Account</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Join CrowdCare and start making a difference</p>
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
          {/* Full name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                  display: "flex", alignItems: "center", padding: 0
                }}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: "relative" }}>
              <Phone size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={handleChange}
                style={{ paddingLeft: "2.75rem" }}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Address</label>
            <div style={{ position: "relative" }}>
              <MapPin size={16} style={{ position: "absolute", left: "1rem", top: "1rem", color: "var(--text-muted)" }} />
              <textarea
                name="address"
                className="form-control"
                placeholder="Street, area, landmark"
                value={form.address}
                onChange={handleChange}
                style={{ paddingLeft: "2.75rem", minHeight: "80px" }}
                required
              />
            </div>
          </div>

          {/* City / District / State */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label">District</label>
              <select
                name="district"
                className="form-control"
                value={form.district}
                onChange={handleChange}
                required
              >
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City / Town</label>
              <select
                name="city"
                className="form-control"
                value={form.city}
                onChange={handleChange}
                required
              >
                {(DISTRICT_CITIES[form.district] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={form.state}
                onChange={handleChange}
                required
                readOnly
                style={{ background: "rgba(0,0,0,0.15)", cursor: "default" }}
              />
            </div>
          </div>

          {/* Department for officials */}
          {role === "official" && (
            <div className="form-group animate-fade">
              <label className="form-label">Department</label>
              <div style={{ position: "relative" }}>
                <Building2 size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  placeholder="e.g. Roads & Infrastructure"
                  value={form.department}
                  onChange={handleChange}
                  style={{ paddingLeft: "2.75rem" }}
                  required={role === "official"}
                />
              </div>
            </div>
          )}

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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}