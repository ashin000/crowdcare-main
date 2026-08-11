import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react";
import { getIssues, getCategories, upvoteIssue } from "../firebase/firestore";
import { useAuthContext } from "../context/AuthContext";
import IssueCard from "../components/IssueCard";

export default function Issues() {
  const { currentUser } = useAuthContext();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, upvotes, urgent, unresolved

  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true);
      try {
        const list = await getIssues();
        const cats = await getCategories();
        setIssues(list);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading issues feed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, []);

  const handleVote = async (issueId) => {
    if (!currentUser) {
      alert("Please sign in to upvote issues.");
      return;
    }
    try {
      const { count } = await upvoteIssue(issueId, currentUser.uid);
      setIssues(issues.map(iss => {
        if (iss.id === issueId) {
          return { ...iss, upvoteCount: count, upvotes: count };
        }
        return iss;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort Logic
  const filteredIssues = issues
    .filter(iss => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        iss.title?.toLowerCase().includes(searchLower) ||
        iss.description?.toLowerCase().includes(searchLower) ||
        iss.issueId?.toLowerCase().includes(searchLower) ||
        iss.location?.address?.toLowerCase().includes(searchLower);

      const matchCategory = categoryFilter === "all" || iss.category === categoryFilter;
      const matchStatus = statusFilter === "all" || iss.status === statusFilter;
      const matchPriority = priorityFilter === "all" || iss.priority === priorityFilter;

      return matchSearch && matchCategory && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "upvotes") {
        const countA = a.upvoteCount || a.upvotes || 0;
        const countB = b.upvoteCount || b.upvotes || 0;
        return countB - countA;
      }
      if (sortBy === "urgent") {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return weightB - weightA;
      }
      if (sortBy === "unresolved") {
        const isResolvedA = a.status === "resolved" ? 1 : 0;
        const isResolvedB = b.status === "resolved" ? 1 : 0;
        return isResolvedA - isResolvedB;
      }
      return 0;
    });

  return (
    <div className="animate-fade container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-heading)" }}>Explore Civic Issues</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Monitor and support civic problems submitted by citizens across local wards.
          </p>
        </div>
      </div>

      {/* Advanced Filters Block */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "1.25rem" }} className="issues-filters-grid">
          
          {/* Text Search */}
          <div style={{ position: "relative" }}>
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search ID, title, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select className="form-control" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Sort: Newest</option>
              <option value="upvotes">Sort: Upvoted</option>
              <option value="urgent">Sort: Priority</option>
              <option value="unresolved">Sort: Unresolved</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p>Loading community issues feed...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <AlertCircle size={32} style={{ margin: "0 auto 1rem" }} />
          <p>No civic issues match your search criteria.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredIssues.map(iss => (
            <IssueCard 
              key={iss.id} 
              issue={iss} 
              currentUser={currentUser} 
              onVote={handleVote} 
            />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .issues-filters-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
          }
          .issues-filters-grid > div:first-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 576px) {
          .issues-filters-grid {
            grid-template-columns: 1fr !important;
          }
          .issues-filters-grid > div:first-child {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
