import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "../styles/list.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ ADD THIS
const API = "https://civicai-1-u7ws.onrender.com";

function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch complaints
  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API}/api/complaints/all`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ✅ Mark as resolved
  const markAsResolved = async (id) => {
    try {
      await axios.put(`${API}/api/complaints/${id}`, {
        status: "Resolved",
      });

      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "Resolved" } : c))
      );

      toast.success("Complaint marked as resolved!", {
        position: "bottom-right",
        autoClose: 2000,
        theme: "colored",
      });

    } catch (err) {
      console.error("Error updating status:", err);

      toast.error("Failed to update status!", {
        position: "bottom-right",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  return (
    <Layout>
      <div className="complaints-container">
        <h2>All Complaints</h2>

        {loading ? (
          <p>Loading complaints...</p>
        ) : error ? (
          <p>{error}</p>
        ) : complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
          <div className="complaints-grid">
            {complaints.map((c) => (
              <div key={c._id} className="complaint-card">
                <h3>{c.issueType || "Unknown Issue"}</h3>

                <p><strong>Detected Issue:</strong> {c.issueType}</p>
                <p><strong>Department:</strong> {c.department || "Not Assigned"}</p>
                <p><strong>Authority:</strong> {c.authority || "N/A"}</p>
                <p><strong>Description:</strong> {c.description}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${c.status?.toLowerCase() || "pending"}`}>
                    {c.status || "Pending"}
                  </span>
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {c.location?.address ||
                    (c.location?.latitude && c.location?.longitude
                      ? `(${c.location.latitude}, ${c.location.longitude})`
                      : "N/A")}
                </p>

                {c.status !== "Resolved" && (
                  <button
                    className="resolve-btn"
                    onClick={() => markAsResolved(c._id)}
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <ToastContainer />
      </div>
    </Layout>
  );
}

export default ComplaintList;