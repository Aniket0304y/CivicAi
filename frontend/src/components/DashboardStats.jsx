import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";

const API = "https://civicai-1-u7ws.onrender.com";

function DashboardStats() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/api/complaints/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="stats-container">
      <div className="stat-card total">
        <h3>Total Complaints</h3>
        <p>{loading ? "..." : stats.total}</p>
      </div>

      <div className="stat-card pending">
        <h3>Pending</h3>
        <p>{loading ? "..." : stats.pending}</p>
      </div>

      <div className="stat-card resolved">
        <h3>Resolved</h3>
        <p>{loading ? "..." : stats.resolved}</p>
      </div>
    </div>
  );
}

export default DashboardStats;