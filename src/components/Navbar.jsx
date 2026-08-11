import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Sun, Moon, LogOut, Menu, X, User, Shield, Info } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

export default function Navbar({ toggleNotifDrawer, unreadNotifCount }) {
  const { currentUser, logout } = useAuthContext();
  const { theme, toggleTheme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Define links based on user role
  const getNavLinks = () => {
    if (!currentUser) {
      return [{ path: "/", label: "Home" }];
    }

    const role = currentUser.role || "citizen";
    switch (role) {
      case "admin":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/admin/users", label: "Users" },
          { path: "/admin/issues", label: "Issues" },
          { path: "/admin/announcements", label: "Announcements" },
          { path: "/admin/polls", label: "Polls" },
          { path: "/admin/audit-logs", label: "Audit Logs" }
        ];
      case "authority":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/authority/issues", label: "Assigned Issues" },
          { path: "/map", label: "Civic Map" },
          { path: "/announcements", label: "Announcements" }
        ];
      case "volunteer":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/volunteer/tasks", label: "Tasks" },
          { path: "/map", label: "Nearby Issues" }
        ];
      case "citizen":
      default:
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/report-issue", label: "Report Issue" },
          { path: "/issues", label: "Explore Issues" },
          { path: "/map", label: "Map" },
          { path: "/track", label: "Track" },
          { path: "/announcements", label: "Announcements" },
          { path: "/polls", label: "Polls" }
        ];
    }
  };

  const links = getNavLinks();

  return (
    <nav className="glass-card" style={{
      borderRadius: "0 0 16px 16px",
      borderTop: "none",
      padding: "1rem 2rem",
      marginBottom: "2rem",
      position: "sticky",
      top: 0,
      zIndex: 80,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => setIsOpen(false)}>
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
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-menu" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {links.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `btn btn-secondary ${isActive ? "nav-item-active" : ""}`}
              style={{ background: "transparent", border: "none" }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          
          {/* Theme Toggle */}
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
              {/* Notification Bell */}
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

              {/* Profile Shortcut */}
              <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingLeft: "0.5rem" }} className="user-menu-shortcut">
                <div style={{ textAlign: "right" }} className="user-profile-details">
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                    {currentUser.fullName || currentUser.name || "Citizen"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                    {currentUser.role !== "citizen" && <Shield size={10} color="var(--success)" />}
                    <span style={{ textTransform: "capitalize" }}>{currentUser.role}</span>
                  </div>
                </div>
                
                {currentUser.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt="profile" 
                    style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }}
                  />
                ) : (
                  <div style={{
                    background: currentUser.role !== "citizen" ? "var(--success-light)" : "var(--primary-light)",
                    border: `1px solid ${currentUser.role !== "citizen" ? "var(--success)" : "var(--primary)"}`,
                    color: currentUser.role !== "citizen" ? "var(--success)" : "var(--primary)",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold"
                  }}>
                    <User size={18} />
                  </div>
                )}
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ padding: "0.5rem", borderRadius: "50%", minWidth: "40px", height: "40px" }} 
                title="Log Out"
              >
                <LogOut size={18} color="var(--danger)" />
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }} className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Icon */}
          <button 
            className="btn btn-secondary mobile-menu-btn" 
            onClick={() => setIsOpen(!isOpen)}
            style={{ display: "none", padding: "0.5rem", borderRadius: "50%", minWidth: "40px", height: "40px" }}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer/Overlay */}
      {isOpen && (
        <div className="mobile-menu animate-fade" style={{
          marginTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1rem"
        }}>
          {links.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `btn btn-secondary ${isActive ? "nav-item-active" : ""}`}
              onClick={() => setIsOpen(false)}
              style={{ justifyContent: "flex-start", width: "100%", border: "none", background: "rgba(255,255,255,0.01)" }}
            >
              {link.label}
            </NavLink>
          ))}
          {currentUser && (
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `btn btn-secondary ${isActive ? "nav-item-active" : ""}`}
              onClick={() => setIsOpen(false)}
              style={{ justifyContent: "flex-start", width: "100%", border: "none", background: "rgba(255,255,255,0.01)" }}
            >
              My Profile
            </NavLink>
          )}
        </div>
      )}

      {/* CSS injection for responsive classes */}
      <style>{`
        @media (max-width: 992px) {
          .desktop-menu { display: none !important; }
          .user-profile-details { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
          .auth-buttons { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
