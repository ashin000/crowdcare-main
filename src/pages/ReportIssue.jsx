import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Image, Video, Navigation, MapPin, Search } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { getCategories, checkDuplicateIssue, createIssue, upvoteIssue } from "../firebase/firestore";
import { uploadMediaFile } from "../firebase/storage";
import MapView from "../components/MapView";

const issueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  description: z.string().min(15, "Description must be at least 15 characters."),
  category: z.string().min(1, "Please select an issue category."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  address: z.string().min(5, "Address details are required."),
  city: z.string().min(2, "City is required."),
  district: z.string().min(2, "District is required."),
  state: z.string().min(2, "State is required.")
});

export default function ReportIssue() {
  const { currentUser } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 }); // Default: Chennai
  
  // Media uploads
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Workflow states
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [duplicateIssue, setDuplicateIssue] = useState(null);
  const [globalError, setGlobalError] = useState("");

  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      category: "",
      priority: "medium",
      address: "",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu"
    }
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Update form coordinates
  const handleLocationSelect = (loc) => {
    setCoords({ lat: loc.lat, lng: loc.lng });
    setValue("address", loc.address || "");
    
    // Auto-detect duplicate on selection if category is picked
    if (selectedCategory) {
      checkDuplicates(selectedCategory, loc.lat, loc.lng);
    }
  };

  // Helper trigger to inspect duplicates
  const checkDuplicates = async (cat, lat, lng) => {
    try {
      const dup = await checkDuplicateIssue(cat, lat, lng);
      setDuplicateIssue(dup);
    } catch (err) {
      console.error("Duplicate check failure:", err);
    }
  };

  // Trigger duplicate check when category changes
  useEffect(() => {
    if (selectedCategory && coords.lat) {
      checkDuplicates(selectedCategory, coords.lat, coords.lng);
    }
  }, [selectedCategory, coords]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be smaller than 5 MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Video size must be smaller than 50 MB");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmitForm = async (data, bypassDuplicate = false) => {
    if (duplicateIssue && !bypassDuplicate) {
      // Intercept submit, show warning
      return;
    }

    setSubmitting(true);
    setGlobalError("");
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadMediaFile("issues/images", imageFile);
      }

      const issuePayload = {
        ...data,
        latitude: coords.lat,
        longitude: coords.lng,
        imageUrl
      };

      const result = await createIssue(issuePayload, currentUser);
      setSuccessInfo(result);
      setDuplicateIssue(null);
    } catch (err) {
      console.error(err);
      setGlobalError(err.message || "Failed to submit civic ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvoteDuplicate = async () => {
    if (!duplicateIssue) return;
    try {
      await upvoteIssue(duplicateIssue.id, currentUser.uid);
      alert(`Successfully upvoted existing ticket: ${duplicateIssue.issueId}`);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to upvote duplicate issue.");
    }
  };

  if (successInfo) {
    return (
      <div className="animate-fade container" style={{ maxWidth: "600px", marginTop: "3rem" }}>
        <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid var(--success)" }}>
          <div style={{
            background: "var(--success-light)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--success)",
            marginBottom: "1.5rem"
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Issue Submitted!</h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Thank you. Your civic report is saved and sent to authorities.
          </p>

          <div style={{
            background: "rgba(0,0,0,0.15)",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "left",
            fontSize: "0.9rem",
            marginBottom: "2rem",
            border: "1px solid var(--border)"
          }}>
            <p style={{ marginBottom: "0.5rem" }}><strong>Ticket ID:</strong> {successInfo.issueId}</p>
            <p style={{ marginBottom: "0.5rem" }}><strong>Subject:</strong> {successInfo.title}</p>
            <p style={{ marginBottom: "0.5rem" }}><strong>Category:</strong> {successInfo.categoryName}</p>
            <p><strong>District Status:</strong> <span className="badge badge-status-reported">Reported</span></p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/dashboard" className="btn btn-secondary" style={{ flex: 1 }}>My Dashboard</Link>
            <Link to={`/issues/${successInfo.id}`} className="btn btn-primary" style={{ flex: 1 }}>View Ticket</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade container" style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", fontFamily: "var(--font-heading)" }}>Report Local Civic Problem</h2>
      
      {globalError && (
        <div style={{
          padding: "1rem",
          background: "var(--danger-light)",
          border: "1px solid var(--danger)",
          color: "var(--danger)",
          borderRadius: "10px",
          marginBottom: "1.5rem"
        }}>
          {globalError}
        </div>
      )}

      {/* Duplicate Warning Dialog */}
      {duplicateIssue && (
        <div className="glass-card animate-scale" style={{ border: "2px solid var(--warning)", background: "rgba(223, 144, 8, 0.03)", marginBottom: "2rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <AlertCircle color="var(--warning)" size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--warning)" }}>Similar Issue Found Nearby!</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                Another active ticket of category <strong>{duplicateIssue.categoryName}</strong> has already been reported nearby:
              </p>
              
              <div style={{
                background: "rgba(0,0,0,0.2)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginTop: "0.75rem",
                fontSize: "0.8rem",
                border: "1px solid var(--border)"
              }}>
                <p><strong>{duplicateIssue.issueId}</strong>: {duplicateIssue.title}</p>
                <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>Location: {duplicateIssue.location?.address}</p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={handleUpvoteDuplicate} className="btn btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                  Upvote Existing Ticket
                </button>
                <Link to={`/issues/${duplicateIssue.id}`} className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                  View Details
                </Link>
                <button type="button" onClick={handleSubmit((d) => onSubmitForm(d, true))} className="btn btn-danger" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", background: "transparent", border: "1px solid var(--danger)", color: "var(--danger)" }}>
                  Submit My Report Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => onSubmitForm(d, false))} className="grid-2" style={{ gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
        
        {/* Left Hand side: Form inputs */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div className="form-group">
            <label className="form-label">Issue Category</label>
            <select className="form-control" {...register("category")} required>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {errors.category && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.category.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Title / Subject</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Major pothole causing traffic" 
              {...register("title")} 
              required
            />
            {errors.title && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea 
              className="form-control" 
              placeholder="Explain size, impact on vehicle/foot traffic, safety risks, duration..." 
              {...register("description")} 
              style={{ minHeight: "120px" }}
              required
            />
            {errors.description && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.description.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Urgency Priority</label>
            <select className="form-control" {...register("priority")} required>
              <option value="low">Low (minor inconvenience)</option>
              <option value="medium">Medium (standard issue)</option>
              <option value="high">High (dangerous road/blockage)</option>
              <option value="critical">Critical (immediate safety hazard)</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Image size={14} /> Add Photo
              </label>
              <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} style={{ fontSize: "0.75rem" }} />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", marginTop: "0.5rem" }} 
                />
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Video size={14} /> Add Video
              </label>
              <input type="file" accept="video/*" className="form-control" onChange={handleVideoChange} style={{ fontSize: "0.75rem" }} />
              {videoPreview && (
                <video 
                  src={videoPreview} 
                  controls 
                  style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", marginTop: "0.5rem" }} 
                />
              )}
            </div>
          </div>

        </div>

        {/* Right Hand side: Map location selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={18} color="var(--primary)" />
              Geotag Issue Location
            </h3>

            <div className="form-group">
              <label className="form-label">Street Address Landmark</label>
              <textarea 
                className="form-control" 
                {...register("address")} 
                style={{ minHeight: "50px", fontSize: "0.85rem" }}
                required 
              />
              {errors.address && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.address.message}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.75rem" }}>City</label>
                <input type="text" className="form-control" {...register("city")} style={{ fontSize: "0.8rem", padding: "0.5rem" }} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.75rem" }}>District</label>
                <input type="text" className="form-control" {...register("district")} style={{ fontSize: "0.8rem", padding: "0.5rem" }} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.75rem" }}>State</label>
                <input type="text" className="form-control" {...register("state")} style={{ fontSize: "0.8rem", padding: "0.5rem" }} required />
              </div>
            </div>

            <MapView 
              center={coords} 
              interactive={true} 
              onLocationSelect={handleLocationSelect} 
              height="250px" 
            />

          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "1rem" }}
            disabled={submitting}
          >
            {submitting ? "Submitting Civic Report..." : "Submit Civic Ticket"}
          </button>

        </div>

      </form>
    </div>
  );
}
