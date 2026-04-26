import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

import Sidebar from "../components/Sidebar";
import MarkerClusterGroup from "react-leaflet-cluster";


import "leaflet.heat";

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Marker colors
const markerColors = {
  garbage: "green",
  open_manhole: "red",
  potholes: "yellow",
  streetlight_bad: "blue",
  streetlight_good: "purple",
  ai_error: "gray",
  uncertain: "gray",
};

// Create colored marker icon
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}`,
    iconSize: [30, 45],
    iconAnchor: [15, 40],
  });

// ⭐ Heatmap Component (pure Leaflet)
function LeafletHeatmap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heat = L.heatLayer(
      points.map((p) => [p.lat, p.lng, 0.7]),
      { radius: 30 }
    ).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [issueFilter, setIssueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [heatmap, setHeatmap] = useState(false);

  const [mapRef, setMapRef] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://civicai-10cr.onrender.com/api/complaints/all");
        setComplaints(res.data);
      } catch (err) {
        console.error("Error loading complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filters
  const filteredComplaints = complaints.filter((c) => {
    const matchIssue =
      issueFilter === "all" || c.issueType === issueFilter;

    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;

    return matchIssue && matchStatus;
  });

  // Heatmap points
  const heatPoints = filteredComplaints
    .filter((c) => c.location?.latitude && c.location?.longitude)
    .map((c) => ({
      lat: c.location.latitude,
      lng: c.location.longitude,
    }));

  // Auto fit
  useEffect(() => {
  if (!mapRef || filteredComplaints.length === 0) return;

  const bounds = filteredComplaints.map((c) => [
    c.location.latitude,
    c.location.longitude,
  ]);

  mapRef.fitBounds(bounds, {
    padding: [100, 100],
    maxZoom: 15,
  });
}, [mapRef, filteredComplaints]);


  return (
  <div className="app-wrapper">

    <Sidebar />

    <div className="map-page">

      {/* FILTER PANEL */}
      <div className="filter-panel">
        <h3>Filters</h3>

        <label>Issue Type</label>
        <select
          value={issueFilter}
          onChange={(e) => setIssueFilter(e.target.value)}
        >
          <option value="all">All</option>
          {Object.keys(markerColors).map((type) => (
            <option key={type} value={type}>
              {type.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>

        <label>Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>

        <button onClick={() => setHeatmap(!heatmap)}>
          {heatmap ? "Disable Heatmap" : "Enable Heatmap"}
        </button>
      </div>

      {/* MAP AREA */}
      <div className="map-container-pro">
        <MapContainer
          center={[28.628, 77.3649]}
          zoom={13}
          whenCreated={setMapRef}
          className="map-area"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {heatmap && <LeafletHeatmap points={heatPoints} />}

          <MarkerClusterGroup chunkedLoading>
            {filteredComplaints.map((c, i) => (
              <Marker
                key={i}
                position={[c.location.latitude, c.location.longitude]}
                icon={createIcon(markerColors[c.issueType] || "gray")}
              >
                <Popup>
                  <div className="popup-card">
                    <h4>{c.issueType.toUpperCase()}</h4>
                    <p>{c.description}</p>
                    <p><b>Status:</b> {c.status}</p>

                    {c.imageUrl && (
                      <img
                        src={`http://localhost:5000${c.imageUrl}`}
                        alt=""
                        style={{ width: "120px", borderRadius: "8px" }}
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

    </div> {/* map-page ends */}

  </div>
);

}

export default MapView;
