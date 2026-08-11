import React, { useState, useEffect } from "react";
import { SlidersHorizontal, MapPin, Navigation } from "lucide-react";
import { getIssues, getCategories } from "../firebase/firestore";
import MapView from "../components/MapView";

export default function MapPage() {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState({ lat: 13.0827, lng: 80.2707 }); // Chennai default

  // Filters
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const list = await getIssues();
        const cats = await getCategories();
        setIssues(list);
        setCategories(cats);
      } catch (err) {
        console.error("Map page loading failure:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCenterNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          alert("Could not detect location. Manual map scrolling is required.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const filteredIssues = issues.filter(iss => {
    const matchCat = catFilter === "all" || iss.category === catFilter;
    const matchStatus = statusFilter === "all" || iss.status === statusFilter;
    const matchPriority = priorityFilter === "all" || iss.priority === priorityFilter;
    return matchCat && matchStatus && matchPriority;
  });

  return (
    <div className="animate-fade container" style={{ paddingBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-heading)" }}>Civic Issues Map</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Explore reported civic infrastructure problems overlayed on the municipal zone map.
          </p>
        </div>
        <button 
          onClick={handleCenterNearMe} 
          className="btn btn-secondary" 
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Navigation size={14} /> Center Near Me
        </button>
      </div>

      {/* Filter Toolbar overlay */}
      <div className="glass-card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }} className="map-filters">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginRight: "1rem" }}>
            <SlidersHorizontal size={16} /> Filters
          </div>

          <div>
            <select className="form-control" style={{ width: "160px" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select className="form-control" style={{ width: "150px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select className="form-control" style={{ width: "150px" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            Showing <strong>{filteredIssues.length}</strong> active markers on map
          </div>
        </div>
      </div>

      {/* Map rendering */}
      {loading ? (
        <div style={{ height: "450px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", borderRadius: "12px" }}>
          <p>Loading maps data...</p>
        </div>
      ) : (
        <MapView 
          center={center} 
          zoom={13} 
          markers={filteredIssues} 
          height="500px" 
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .map-filters { width: 100%; }
          .map-filters select { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
