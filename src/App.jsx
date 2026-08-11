import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NotificationDrawer from "./components/NotificationDrawer";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import OfficialDashboard from "./pages/OfficialDashboard";
import IssueDetail from "./pages/IssueDetail";
import { authService, dbService } from "./services/firebase";
import { Megaphone, Radio, BellOff } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // home, login, register, dashboard, report, announcements, polls
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // General page list states for quick access pages
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [issues, setIssues] = useState([]);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = authService.subscribeAuthState((user) => {
      setCurrentUser(user);
      if (user) {
        setActiveTab("dashboard");
        loadUserData(user.uid);
      } else {
        // Fallback to check localStorage for guest/mock sessions
        const cached = authService.getCurrentUser();
        if (cached) {
          setCurrentUser(cached);
          setActiveTab("dashboard");
          loadUserData(cached.uid);
        } else {
          setCurrentUser(null);
          if (activeTab !== "login" && activeTab !== "register") {
            setActiveTab("home");
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid) => {
    try {
      const notifs = await dbService.getNotifications(uid);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    }
  };

  // Poll notifications and global lists
  useEffect(() => {
    if (!currentUser) return;
    
    // Load initial data
    loadUserData(currentUser.uid);
    dbService.getAnnouncements().then(setAnnouncements).catch(console.error);
    dbService.getPolls().then(setPolls).catch(console.error);
    dbService.getIssues().then(setIssues).catch(console.error);

    // Dynamic poll for updates (simulating real-time updates every 8 seconds)
    const interval = setInterval(() => {
      loadUserData(currentUser.uid);
      dbService.getAnnouncements().then(setAnnouncements).catch(console.error);
      dbService.getPolls().then(setPolls).catch(console.error);
      dbService.getIssues().then(setIssues).catch(console.error);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentUser, activeTab]);

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setNotifications([]);
    setActiveTab("home");
  };

  const handleMarkNotifRead = async (notifId) => {
    await dbService.markNotificationRead(notifId);
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const handlePollVote = async (pollId, optionIdx) => {
    try {
      const { voters, votes } = await dbService.voteInPoll(pollId, optionIdx, currentUser.uid);
      setPolls(polls.map(p => p.id === pollId ? { ...p, voters, votes } : p));
    } catch (err) {
      alert(err.message || "Failed to submit vote");
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <Navbar 
        currentUser={currentUser}
        onLogout={handleLogout}
        toggleNotifDrawer={() => setIsNotifOpen(!isNotifOpen)}
        unreadNotifCount={unreadNotifCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, paddingBottom: "3rem" }}>
        
        {/* Landing Page */}
        {activeTab === "home" && (
          <LandingPage onGetStarted={() => setActiveTab(currentUser ? "dashboard" : "login")} />
        )}

        {/* Login Page */}
        {activeTab === "login" && (
          <Login 
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab("dashboard");
            }}
            onSwitchToRegister={() => setActiveTab("register")}
          />
        )}

        {/* Register Page */}
        {activeTab === "register" && (
          <Register 
            onRegisterSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab("dashboard");
            }}
            onSwitchToLogin={() => setActiveTab("login")}
          />
        )}

        {/* Dashboard */}
        {activeTab === "dashboard" && currentUser && (
          currentUser.role === "official" ? (
            <OfficialDashboard 
              currentUser={currentUser} 
              onSelectIssue={(iss) => setSelectedIssue(iss)} 
            />
          ) : (
            <CitizenDashboard 
              currentUser={currentUser} 
              onSelectIssue={(iss) => setSelectedIssue(iss)} 
            />
          )
        )}

        {/* Report Redirect for Citizen */}
        {activeTab === "report" && currentUser && (
          <CitizenDashboard 
            currentUser={currentUser} 
            onSelectIssue={(iss) => setSelectedIssue(iss)} 
            initialTab="report" // Handled internally
          />
        )}

        {/* Dedicated Announcements Feed */}
        {activeTab === "announcements" && currentUser && (
          <div className="animate-fade" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Megaphone size={24} color="var(--info)" />
              Official Government Announcements
            </h2>
            {announcements.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                <Megaphone size={32} opacity={0.5} style={{ marginBottom: "1rem" }} />
                <p>No announcements posted yet.</p>
              </div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="glass-card animate-scale" style={{ marginBottom: "1.5rem", padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span className="badge badge-status-acknowledged" style={{ fontSize: "0.75rem" }}>Official Update</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{ann.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {ann.content}
                  </p>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "right" }}>
                    Published by: <strong>{ann.officialName}</strong> • Municipal Department
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Dedicated Polls Feed */}
        {activeTab === "polls" && currentUser && (
          <div className="animate-fade" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Radio size={24} color="var(--warning)" />
              Civic Polls & Priorities
            </h2>
            {polls.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                <BellOff size={32} opacity={0.5} style={{ marginBottom: "1rem" }} />
                <p>No active polls currently available.</p>
              </div>
            ) : (
              polls.map(p => {
                const hasVoted = p.voters[currentUser.uid] !== undefined;
                const totalVotes = Object.values(p.votes).reduce((sum, v) => sum + v, 0);

                return (
                  <div key={p.id} className="glass-card animate-scale" style={{ marginBottom: "1.5rem", padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span className="badge badge-medium">Public Feedback</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Total responses: {totalVotes}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{p.title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{p.description}</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {p.options.map((opt, idx) => {
                        const optVotes = p.votes[idx] || 0;
                        const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        
                        return (
                          <div key={idx} style={{ position: "relative" }}>
                            {hasVoted ? (
                              <div style={{
                                width: "100%",
                                border: "1px solid var(--border)",
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                                fontSize: "0.9rem",
                                position: "relative",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "space-between",
                                background: p.voters[currentUser.uid] === idx ? "var(--primary-light)" : "transparent"
                              }}>
                                <div style={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: `${percentage}%`,
                                  background: "rgba(79, 70, 229, 0.12)",
                                  zIndex: 0,
                                  transition: "width 0.6s ease"
                                }} />
                                <span style={{ position: "relative", zIndex: 1, fontWeight: p.voters[currentUser.uid] === idx ? 700 : 400 }}>
                                  {opt} {p.voters[currentUser.uid] === idx && " ✓"}
                                </span>
                                <span style={{ position: "relative", zIndex: 1, fontWeight: 600 }}>
                                  {percentage}% ({optVotes})
                                </span>
                              </div>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                onClick={() => handlePollVote(p.id, idx)}
                                style={{
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  padding: "0.75rem 1.25rem",
                                  fontSize: "0.9rem"
                                }}
                              >
                                {opt}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "2rem",
        borderTop: "1px solid var(--border)",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
        background: "rgba(0,0,0,0.15)"
      }}>
        <p>© 2026 CrowdCare Portal. Chennai City Municipal Corporation. All rights reserved.</p>
        <p style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}>
          Built with React, Vite, Custom HSL Styling, and Firebase Serverless SDK.
        </p>
      </footer>

      {/* Sliding Notification Drawer */}
      <NotificationDrawer 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
      />

      {/* Details Modal */}
      {selectedIssue && (
        <IssueDetail 
          issue={selectedIssue}
          currentUser={currentUser}
          onClose={() => setSelectedIssue(null)}
          onRefresh={() => {
            // Refresh list data
            dbService.getIssues().then(setIssues).catch(console.error);
            // Sync current selected issue instance if updated
            dbService.getIssues().then(list => {
              const updated = list.find(i => i.id === selectedIssue.id);
              if (updated) setSelectedIssue(updated);
            });
          }}
        />
      )}
    </div>
  );
}
