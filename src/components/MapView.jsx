import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search, Navigation } from "lucide-react";

export default function MapView({ 
  center = { lat: 13.0827, lng: 80.2707 }, // Default: Chennai
  zoom = 13, 
  markers = [], 
  interactive = false, 
  onLocationSelect, 
  height = "400px" 
}) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(center);
  const [mockSearchText, setMockSearchText] = useState("");
  const [address, setAddress] = useState("Mount Road, Chennai");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      setGoogleMapsError(true);
      return;
    }

    const loadScript = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      // Check if script is already injected
      let script = document.getElementById("google-maps-script");
      if (!script) {
        script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      script.addEventListener("load", () => setMapLoaded(true));
      script.addEventListener("error", () => setGoogleMapsError(true));
    };

    loadScript();
  }, [apiKey]);

  // Handle Google Map rendering
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapsError) return;

    try {
      const mapOptions = {
        center: currentPosition,
        zoom: zoom,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }, { weight: 0.2 }]
          },
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#0f172a" }]
          },
          {
            featureType: "water",
            stylers: [{ color: "#1e293b" }]
          }
        ]
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add markers
      markers.forEach(m => {
        if (!m.latitude || !m.longitude) return;
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(m.latitude), lng: parseFloat(m.longitude) },
          map: map,
          title: m.title,
          icon: getMarkerIcon(m.status, m.category)
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="color: black; font-family: sans-serif; padding: 4px;">
            <strong style="display:block;margin-bottom:2px;">${m.title}</strong>
            <span style="font-size:12px;color:#475569;">Category: ${m.categoryName || m.category}</span><br/>
            <span style="font-size:12px;color:#475569;">Status: ${m.status}</span>
          </div>`
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });

      // Interactive location selection
      if (interactive) {
        const selectedMarker = new window.google.maps.Marker({
          position: currentPosition,
          map: map,
          draggable: true,
          icon: "http://maps.google.com/mapfiles/ms/icons/red-pushpin.png"
        });

        const geocoder = new window.google.maps.Geocoder();

        const updateLocation = (latLng) => {
          const lat = latLng.lat();
          const lng = latLng.lng();
          setCurrentPosition({ lat, lng });

          geocoder.geocode({ location: latLng }, (results, status) => {
            let addr = "Selected Location, Chennai";
            if (status === "OK" && results[0]) {
              addr = results[0].formatted_address;
            }
            setAddress(addr);
            if (onLocationSelect) {
              onLocationSelect({ lat, lng, address: addr });
            }
          });
        };

        map.addListener("click", (e) => {
          selectedMarker.setPosition(e.latLng);
          updateLocation(e.latLng);
        });

        selectedMarker.addListener("dragend", (e) => {
          updateLocation(e.latLng);
        });
      }
    } catch (err) {
      console.error("Google Maps rendering error:", err);
      setGoogleMapsError(true);
    }
  }, [mapLoaded, googleMapsError, markers, interactive]);

  // Browser Geolocation Helper
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPos = { lat, lng };
          setCurrentPosition(newPos);
          
          const mockAddr = `Geo-tracked Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setAddress(mockAddr);

          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: mockAddr });
          }

          if (window.google && mapRef.current && mapLoaded && !googleMapsError) {
            // Update Google Map center
            const map = new window.google.maps.Map(mapRef.current, {
              center: newPos,
              zoom: 15
            });
          }
        },
        (error) => {
          alert("Location access denied. Please select manually on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const getMarkerIcon = (status, category) => {
    // Helper to return URL for marker icons based on category
    if (status === "resolved") return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    if (status === "in_progress") return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  };

  // Mock search query
  const handleMockSearch = (e) => {
    e.preventDefault();
    if (!mockSearchText.trim()) return;

    // Simulate search coordinates for Chennai
    const mockLocations = {
      "mount road": { lat: 13.0401, lng: 80.2415, address: "Mount Road, Anna Salai, Chennai" },
      "t-nagar": { lat: 13.0305, lng: 80.2320, address: "T-Nagar Shopping Street, Chennai" },
      "adyar": { lat: 13.0012, lng: 80.2565, address: "Adyar Circle near Flyover, Chennai" },
      "velachery": { lat: 12.9796, lng: 80.2196, address: "Velachery Main Road, near Lake, Chennai" },
      "guindy": { lat: 13.0067, lng: 80.2206, address: "Guindy Industrial Estate, Chennai" },
      "chennai central": { lat: 13.0822, lng: 80.2754, address: "Chennai Central Railway Station Road, Chennai" }
    };

    const query = mockSearchText.toLowerCase();
    let found = null;
    
    // Exact or partial match search
    Object.keys(mockLocations).forEach(key => {
      if (key.includes(query) || query.includes(key)) {
        found = mockLocations[key];
      }
    });

    if (found) {
      setCurrentPosition({ lat: found.lat, lng: found.lng });
      setAddress(found.address);
      if (onLocationSelect) {
        onLocationSelect({ lat: found.lat, lng: found.lng, address: found.address });
      }
    } else {
      // Generate randomized coordinates in Chennai range
      const randomLat = 12.9800 + Math.random() * 0.12;
      const randomLng = 80.2000 + Math.random() * 0.08;
      const randomAddr = `${mockSearchText}, Chennai District`;
      setCurrentPosition({ lat: randomLat, lng: randomLng });
      setAddress(randomAddr);
      if (onLocationSelect) {
        onLocationSelect({ lat: randomLat, lng: randomLng, address: randomAddr });
      }
    }
  };

  // Render Mock Chennai Map UI
  if (googleMapsError) {
    return (
      <div className="glass-card" style={{ padding: "1.5rem", background: "rgba(15, 23, 42, 0.45)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
          <div>
            <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
              <MapPin size={18} color="var(--success)" />
              Chennai Interactive Grid Map (Demo Fallback)
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Currently pointing at: {address} ({currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)})
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }} onClick={handleUseCurrentLocation}>
              <Navigation size={14} /> Detect GPS
            </button>
          </div>
        </div>

        {interactive && (
          <form onSubmit={handleMockSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Chennai area (e.g. T-Nagar, Mount Road, Adyar)..."
              value={mockSearchText}
              onChange={(e) => setMockSearchText(e.target.value)}
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
              <Search size={14} />
            </button>
          </form>
        )}

        <div style={{ 
          height, 
          width: "100%", 
          background: "#070f12", 
          borderRadius: "12px", 
          position: "relative", 
          border: "1px solid var(--border)",
          overflow: "hidden",
          backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
          onClick={(e) => {
            if (!interactive) return;
            // Get click coordinate percentages inside the container
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Map percentages to Chennai coordinates
            // Chennai range roughly: Lat 12.95 to 13.12, Lng 80.18 to 80.30
            const lat = 13.12 - (y * 0.17);
            const lng = 80.18 + (x * 0.12);

            setCurrentPosition({ lat, lng });
            const mockAddress = `Selected coordinates: (${lat.toFixed(4)}, ${lng.toFixed(4)}) in Chennai district.`;
            setAddress(mockAddress);
            if (onLocationSelect) {
              onLocationSelect({ lat, lng, address: mockAddress });
            }
          }}
        >
          {/* Compass grid lines */}
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, borderLeft: "1px dashed rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px dashed rgba(255,255,255,0.05)" }} />

          {/* Render markers */}
          {markers.map((m, idx) => {
            if (!m.latitude || !m.longitude) return null;
            // Translate coordinates back to percentages
            const x = ((m.longitude - 80.18) / 0.12) * 100;
            const y = ((13.12 - m.latitude) / 0.17) * 100;

            if (x < 0 || x > 100 || y < 0 || y > 100) return null; // out of bounds

            let color = "var(--primary)";
            if (m.status === "resolved") color = "var(--success)";
            else if (m.status === "in_progress") color = "var(--warning)";

            return (
              <div 
                key={m.id || idx}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -100%)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
                title={`${m.title} (${m.status})`}
              >
                <div style={{
                  background: color,
                  padding: "0.25rem 0.5rem",
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  whiteSpace: "nowrap",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  color: "white",
                  marginBottom: "2px"
                }}>
                  {m.title.substring(0, 15)}...
                </div>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid white",
                  boxShadow: "0 0 8px rgba(255,255,255,0.3)"
                }} />
              </div>
            );
          })}

          {/* Selected marker (when interactive) */}
          {interactive && (
            (() => {
              const x = ((currentPosition.longitude || currentPosition.lng - 80.18) / 0.12) * 100;
              const y = ((13.12 - (currentPosition.latitude || currentPosition.lat)) / 0.17) * 100;
              return (
                <div style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    position: "absolute",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "2px solid var(--danger)",
                    animation: "ping 1.5s infinite",
                    background: "rgba(239, 68, 68, 0.1)"
                  }} />
                  <MapPin size={24} color="var(--danger)" style={{ zIndex: 5, transform: "translateY(-8px)" }} />
                </div>
              );
            })()
          )}

          {/* Instructions Overlay */}
          <div style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            background: "rgba(0,0,0,0.75)",
            padding: "0.4rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.7rem",
            color: "var(--text-secondary)"
          }}>
            {interactive ? "💡 Click anywhere on the grid to change locations" : "📍 Issue markers mapped inside Chennai District"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height, borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
      {/* Container where google map renders */}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
