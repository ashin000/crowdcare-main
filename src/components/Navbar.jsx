import React, { useState, useEffect } from "react";
import { Bell, Sun, Moon, LogOut, Menu, X, User, Shield } from "lucide-react";
import { authService } from "../services/firebase";

export default function Navbar({ currentUser, onLogout, toggleNotifDrawer, unreadNotifCount, activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Set default light theme class
    document.body.classList.add("light-mode");
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.body.classList.remove("light-mode");
      setTheme("dark");
    } else {
      document.body.classList.add("light-mode");
      setTheme("light");
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <nav className="glass-card" style={{
      borderRadius: "0 0 16px 16px",
      borderTop: "none",
      padding: "1rem 2rem",
      marginBottom: "2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 80,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }} onClick={() => handleNavClick("home")}>
        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--success) 100%)",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.2rem"
        }}>
          C
        </div>
        <span style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
          Crowd<span style={{ color: "var(--success)" }}>Care</span>
        </span>
      </div>

      {/* Desktop navigation */}
      <div className="desktop-menu" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {currentUser ? (
          <>
            <button 
              className={`btn btn-secondary ${activeTab === "dashboard" ? "nav-item-active" : ""}`}
              onClick={() => handleNavClick("dashboard")}
              style={{ background: "transparent", border: "none" }}
            >
              Dashboard
            </button>
            
            {currentUser.role === "citizen" && (
              <button 
                className={`btn btn-secondary ${activeTab === "report" ? "nav-item-active" : ""}`}
                onClick={() => handleNavClick("report")}
                style={{ background: "transparent", border: "none" }}
              >
                Report Issue
              </button>
            )}

            <button 
              className={`btn btn-secondary ${activeTab === "announcements" ? "nav-item-active" : ""}`}
              onClick={() => handleNavClick("announcements")}
              style={{ background: "transparent", border: "none" }}
            >
              Announcements
            </button>

            <button 
              className={`btn btn-secondary ${activeTab === "polls" ? "nav-item-active" : ""}`}
              onClick={() => handleNavClick("polls")}
              style={{ background: "transparent", border: "none" }}
            >
              Polls
            </button>
          </>
        ) : (
          <>
            <button 
              className={`btn btn-secondary ${activeTab === "home" ? "nav-item-active" : ""}`}
              onClick={() => handleNavClick("home")}
              style={{ background: "transparent", border: "none" }}
            >
              Home
            </button>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button 
          onClick={toggleTheme} 
          className="btn btn-secondary" 
          style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "40px", height: "40px" }}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {currentUser ? (
          <>
            <div 
              onClick={toggleNotifDrawer} 
              style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}
              className="btn btn-secondary"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--danger)",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--bg-dark)"
                }}>
                  {unreadNotifCount}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingLeft: "0.5rem" }}>
              <div style={{ textAlign: "right", display: "none", content: "desktop-only" }} className="user-profile-details">
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{currentUser.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                  {currentUser.role === "official" && <Shield size={10} color="#10b981" />}
                  {currentUser.role === "official" ? "Official" : "Citizen"}
                </div>
              </div>
              <div style={{
                background: currentUser.role === "official" ? "var(--success-light)" : "var(--primary-light)",
                border: `1px solid ${currentUser.role === "official" ? "var(--success)" : "var(--primary)"}`,
                color: currentUser.role === "official" ? "var(--success)" : "var(--primary)",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }} title={`${currentUser.name} (${currentUser.role})`}>
                <User size={18} />
              </div>

              <button onClick={onLogout} className="btn btn-secondary" style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "40px", height: "40px" }} title="Log Out">
                <LogOut size={18} color="var(--danger)" />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary" onClick={() => handleNavClick("login")}>Login</button>
            <button className="btn btn-primary" onClick={() => handleNavClick("register")}>Sign Up</button>
          </div>
        )}

        {/* Mobile menu trigger */}
        <button 
          className="btn btn-secondary mobile-menu-btn" 
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: "none", padding: "0.5rem", borderRadius: "50%", minWidth: "40px", height: "40px" }}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* CSS injection for responsive hide/shows */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .user-profile-details { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}
