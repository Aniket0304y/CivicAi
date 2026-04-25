import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout"; 
import "../styles/dashboard.css";
// import "../styles/admin.css";

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/complaints/all");
        setComplaints(res.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const recentComplaints = complaints.slice(0, 3);

  return (
    <Layout>
      <div className="dashboard">
        <div className="page-content">
          {/* ✅ REMOVE THE NAVBAR FROM HERE — Layout already includes it */}

          <div className="dashboard-header">
            <h2 className="page-title">Dashboard Overview</h2>
          </div>

          {/* ======= STATS CARDS ======= */}
          <div className="stats-container">
            <div className="stat-card total">
              <h3>Total Complaints</h3>
              <p>{loading ? "..." : total}</p>
            </div>
            <div className="stat-card pending">
              <h3>Pending</h3>
              <p>{loading ? "..." : pending}</p>
            </div>
            <div className="stat-card resolved">
              <h3>Resolved</h3>
              <p>{loading ? "..." : resolved}</p>
            </div>
          </div>

          {/* ======= RECENT COMPLAINTS SECTION ======= */}
          <div className="recent-section">
            <h3>Recent Complaints</h3>

            {loading ? (
              <p className="no-data">Loading...</p>
            ) : error ? (
              <p className="no-data">{error}</p>
            ) : recentComplaints.length === 0 ? (
              <p className="no-data">No complaints yet.</p>
            ) : (
              <div className="recent-list">
                {recentComplaints.map((c) => (
                  <div key={c._id} className="recent-item">
                    <h4>{c.issueType || "Unknown Issue"}</h4>
                    <p>
                      <strong>Description:</strong> {c.description}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-badge ${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {c.location?.address
                        ? c.location.address
                        : c.location?.latitude && c.location?.longitude
                        ? `(${c.location.latitude}, ${c.location.longitude})`
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <a href="/complaints" className="view-all-link">
                View All Complaints →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
