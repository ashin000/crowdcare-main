import React, { useState } from "react";
import { 
  User, ShieldCheck, Mail, Phone, MapPin, Edit3, 
  Award, ShieldAlert, BadgeInfo, KeyRound, Building, CheckCircle2 
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { updateUserProfile } from "../firebase/firestore";

export default function Profile() {
  const { currentUser, verifyIdentity } = useAuthContext();
  
  // Profile edit states
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || currentUser?.fullName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [city, setCity] = useState(currentUser?.city || "");
  const [district, setDistrict] = useState(currentUser?.district || "");
  const [state, setState] = useState(currentUser?.state || "");

  // Verification states
  const [aadhaarOpen, setAadhaarOpen] = useState(false);
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Application promotion states
  const [promotionRole, setPromotionRole] = useState("volunteer");
  const [promotionDept, setPromotionDept] = useState("Roads & Infrastructure");
  const [promotionNotes, setPromotionNotes] = useState("");
  const [promotionSubmitting, setPromotionSubmitting] = useState(false);
  const [promotionSuccess, setPromotionSuccess] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const updatedFields = {
        name,
        fullName: name,
        phone,
        address,
        city,
        district,
        state
      };
      await updateUserProfile(currentUser.uid, updatedFields);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile details.");
    }
  };

  const handleAadhaarVerify = async (e) => {
    e.preventDefault();
    if (aadhaarNum.length !== 12 || !/^\d+$/.test(aadhaarNum)) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setOtpSent(true);
    alert("Demo: Verification SMS OTP sent to registered Aadhaar mobile number.");
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (otpVal !== "123456") {
      alert("Invalid OTP code. For demo purposes, please enter 123456.");
      return;
    }
    setVerifying(true);
    try {
      await verifyIdentity(aadhaarNum);
      setVerificationSuccess(true);
      setTimeout(() => {
        setAadhaarOpen(false);
        setVerificationSuccess(false);
      }, 1500);
    } catch (err) {
      alert("Identity verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    setPromotionSubmitting(true);
    try {
      const promotionData = {
        requestedRole: promotionRole,
        requestedDept: promotionDept,
        promotionStatus: "pending",
        promotionNotes: promotionNotes
      };
      await updateUserProfile(currentUser.uid, promotionData);
      setPromotionSuccess(true);
    } catch (err) {
      alert("Failed to submit request.");
    } finally {
      setPromotionSubmitting(false);
    }
  };

  const isVerified = currentUser?.isVerified || currentUser?.identityVerification?.status === "verified";

  return (
    <div className="animate-fade container" style={{ maxWidth: "800px" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "2rem", fontFamily: "var(--font-heading)" }}>User Profile</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2.5rem" }} className="profile-grid">
        
        {/* LEFT PANEL: Profile Display & Editor */}
        <div>
          {editing ? (
            <div className="glass-card animate-scale" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Edit Profile Details</h3>
              <form onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <textarea className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} style={{ minHeight: "60px" }} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input type="text" className="form-control" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" className="form-control" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save Updates</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{
                  background: "var(--primary-light)",
                  border: "2px solid var(--primary)",
                  color: "var(--primary)",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "1.8rem"
                }}>
                  {currentUser?.name?.charAt(0) || currentUser?.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.5rem" }}>{currentUser?.fullName || currentUser?.name}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "capitalize", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {currentUser?.role !== "citizen" && <ShieldCheck size={14} color="var(--success)" />}
                    {currentUser?.role} Member
                  </p>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <span>{currentUser?.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                  <Phone size={16} color="var(--text-muted)" />
                  <span>{currentUser?.phone || "Phone unprovided"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9rem" }}>
                  <MapPin size={16} color="var(--text-muted)" style={{ marginTop: "4px" }} />
                  <span>{currentUser?.address ? `${currentUser.address}, ${currentUser.city}, ${currentUser.district}, ${currentUser.state}` : "Address details unprovided"}</span>
                </div>
              </div>

              <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ width: "100%", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <Edit3 size={16} /> Edit Profile Info
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Verification & Promotion Applications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* KYC Identity Verification Box */}
          <div className="glass-card" style={{ border: isVerified ? "1px solid var(--success)" : "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <KeyRound size={18} color={isVerified ? "var(--success)" : "var(--primary)"} />
              Identity Verification
            </h3>

            {isVerified ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "inline-flex", background: "var(--success-light)", color: "var(--success)", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", gap: "0.4rem", alignItems: "center" }}>
                  <ShieldCheck size={16} /> Aadhaar Verified
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Verified: {new Date(currentUser?.identityVerification?.verifiedAt).toLocaleDateString()}
                  <br />Ref: {currentUser?.identityVerification?.providerReference}
                </p>
              </div>
            ) : aadhaarOpen ? (
              <div className="animate-scale" style={{ background: "rgba(0,0,0,0.1)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border)" }}>
                {verificationSuccess ? (
                  <div style={{ textAlign: "center", padding: "1rem", color: "var(--success)" }}>
                    <CheckCircle2 size={24} style={{ margin: "0 auto 0.5rem" }} />
                    <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>Aadhaar Verification Successful!</p>
                  </div>
                ) : otpSent ? (
                  <form onSubmit={handleOtpVerify}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Enter 6-Digit OTP</label>
                    <input type="text" className="form-control" placeholder="123456" value={otpVal} onChange={(e) => setOtpVal(e.target.value)} maxLength={6} required style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }} />
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.5rem" }} disabled={verifying}>
                      {verifying ? "Verifying..." : "Verify OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAadhaarVerify}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Aadhaar Number (12 Digits)</label>
                    <input type="text" className="form-control" placeholder="123412341234" value={aadhaarNum} onChange={(e) => setAadhaarNum(e.target.value)} maxLength={12} required style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" onClick={() => setAadhaarOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: "0.5rem", fontSize: "0.8rem" }}>Send OTP</button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.4 }}>
                  Verify your account with Aadhaar KYC to reduce spam filters and gain full priority routing.
                </p>
                <button onClick={() => setAadhaarOpen(true)} className="btn btn-primary" style={{ width: "100%" }}>
                  Verify Identity Now
                </button>
              </div>
            )}
          </div>

          {/* Promotion Requests (Citizen only) */}
          {currentUser && currentUser.role === "citizen" && (
            <div className="glass-card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building size={18} color="var(--primary)" />
                Credential Applications
              </h3>

              {currentUser.promotionStatus === "pending" ? (
                <div style={{ background: "var(--warning-light)", color: "var(--warning)", border: "1px solid rgba(223,144,8,0.2)", padding: "1rem", borderRadius: "10px", fontSize: "0.8rem" }}>
                  <p style={{ fontWeight: 700 }}>Application Status: Pending Review</p>
                  <p style={{ marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                    You requested promotion to <strong>{currentUser.requestedRole.toUpperCase()}</strong> ({currentUser.requestedDept}). An administrator will review your credentials.
                  </p>
                </div>
              ) : promotionSuccess ? (
                <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "1rem", borderRadius: "10px", fontSize: "0.85rem" }}>
                  Application submitted successfully for review!
                </div>
              ) : (
                <form onSubmit={handlePromotionSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Apply for Government Official or Volunteer field credentials to update and resolve civic tickets.
                  </p>
                  
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Select Role</label>
                    <select className="form-control" value={promotionRole} onChange={(e) => setPromotionRole(e.target.value)} style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                      <option value="volunteer">Apply as Civic Volunteer</option>
                      <option value="authority">Apply as Municipal Officer</option>
                    </select>
                  </div>

                  {promotionRole === "authority" && (
                    <div>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Select Department</label>
                      <select className="form-control" value={promotionDept} onChange={(e) => setPromotionDept(e.target.value)} style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                        <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                        <option value="Sanitation & Waste">Sanitation & Waste Management</option>
                        <option value="Water & Sewage Supply">Water & Sewage Supply</option>
                        <option value="Electricity & Lights">Electricity & Lights</option>
                        <option value="Public Security">Public Security</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Reference Credentials / Notes</label>
                    <textarea className="form-control" placeholder="Provide municipal badge ID, volunteer group name, or experience..." value={promotionNotes} onChange={(e) => setPromotionNotes(e.target.value)} style={{ minHeight: "50px", fontSize: "0.85rem" }} required />
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ width: "100%" }} disabled={promotionSubmitting}>
                    {promotionSubmitting ? "Submitting Application..." : "Submit Application"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
