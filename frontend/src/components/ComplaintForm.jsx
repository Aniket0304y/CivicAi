import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "../styles/form.css";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ComplaintForm() {
  const LOCATIONIQ_API_KEY = "pk.858c70e800dd415cdb0a7df637469a25";

  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    address: "",
    userName: "",
    userEmail: "",
    image: null,
    latitude: "",
    longitude: "",
  });

  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  /* ======================================================
     📍 AUTO FETCH LOCATION
     ====================================================== */
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();

          if (data && data.display_name) {
            setFormData((prev) => ({
              ...prev,
              address: data.display_name,
            }));
            setShowLocationConfirm(true);
          }
        } catch (err) {
          console.error("Address fetch failed", err);
        }
      },
      () => alert("Please allow location access"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ======================================================
     🗺️ MAP PICKER COMPONENT
     ====================================================== */
  function LocationPicker({ close }) {
    const LocationMarker = () => {
      useMapEvents({
        async click(e) {
          const lat = e.latlng.lat;
          const lon = e.latlng.lng;

          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();

          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            address: data.display_name || "Selected location",
          }));

          close();
        },
      });
      return null;
    };

    return (
      <div className="map-wrapper">
        <p><strong>📍 Click on map to choose location</strong></p>
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          style={{ height: "400px", borderRadius: "10px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
    );
  }

  /* ======================================================
     🧾 FORM HANDLERS
     ====================================================== */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));

    try {
      setPredicting(true);
      const aiData = new FormData();
      aiData.append("file", file);

      const res = await fetch("http://127.0.0.1:5001/predict", {
        method: "POST",
        body: aiData,
      });

      const data = await res.json();
      if (data.prediction) {
        setFormData((prev) => ({
          ...prev,
          issueType: data.prediction.toLowerCase(),
        }));
        alert(`🧠 AI Detected: ${data.prediction}`);
      }
    } catch (err) {
      console.error("AI error", err);
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));

      await axios.post("http://localhost:5000/api/complaints", payload);
      setMessage("✅ Complaint submitted successfully!");

      setFormData({
        ...formData,
        issueType: "",
        description: "",
        userName: "",
        userEmail: "",
        image: null,
      });
      setPreview(null);
    } catch {
      setMessage("❌ Failed to submit complaint");
    }
  };

  /* ======================================================
     🧱 UI
     ====================================================== */
  return (
    <Layout>
      <div className="form-card">
        <h2>Submit a Complaint</h2>

        {/* LOCATION CONFIRM */}
        {showLocationConfirm && (
          <div className="location-confirm-box">
            <p><strong>📍 Detected Location</strong></p>
            <p>{formData.address}</p>

            <button
              type="button"
              className="btn-confirm"
              onClick={() => setShowLocationConfirm(false)}
            >
              ✔ Correct
            </button>

            <button
              type="button"
              className="btn-change"
              onClick={() => {
                setShowLocationConfirm(false);
                setShowMapPicker(true);
              }}
            >
              ✏ Change on Map
            </button>
          </div>
        )}

        {/* MAP PICKER */}
        {showMapPicker && (
          <LocationPicker close={() => setShowMapPicker(false)} />
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>Issue Type</label>
          <select name="issueType" value={formData.issueType} onChange={handleChange}>
            <option value="">Select issue (or AI)</option>
            <option value="garbage">Garbage</option>
            <option value="potholes">Pothole</option>
            <option value="open_manhole">Open Manhole</option>
            <option value="streetlight_bad">Streetlight (Bad)</option>
          </select>

          {predicting && <p>🧠 Detecting issue…</p>}

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />

          <label>Address</label>
          <input name="address" value={formData.address} readOnly />

          <label>Your Name</label>
          <input name="userName" value={formData.userName} onChange={handleChange} required />

          <label>Your Email</label>
          <input name="userEmail" value={formData.userEmail} onChange={handleChange} required />

          <label>Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {preview && <img src={preview} className="preview-img" alt="preview" />}

          <button className="btn-primary" type="submit">
            Submit Complaint
          </button>
        </form>

        {message && <p className="form-message">{message}</p>}
      </div>
    </Layout>
  );
}

export default ComplaintForm;
