import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "../styles/form.css";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ComplaintForm() {
  const LOCATIONIQ_API_KEY = "pk.858c70e800dd415cdb0a7df637469a25";

  // ✅ BASE URL (BEST PRACTICE)
  const API = "https://civicai-1-u7ws.onrender.com";

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

  /* ================= LOCATION ================= */
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

          if (data?.display_name) {
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

  /* ================= MAP PICKER ================= */
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
        <p><strong>📍 Click on map</strong></p>
        <MapContainer center={[28.6139, 77.209]} zoom={12} style={{ height: "400px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
    );
  }

  /* ================= IMAGE + AI ================= */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));

    try {
      setPredicting(true);

      const aiData = new FormData();
      aiData.append("file", file);

      // ✅ FIXED AI URL
      const res = await fetch(`${API}/predict`, {
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));

      // ✅ FIXED BACKEND URL
      await axios.post(`${API}/api/complaints`, payload);

      setMessage("✅ Complaint submitted!");

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

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="form-card">
        <h2>Submit Complaint</h2>

        {showLocationConfirm && (
          <div>
            <p>{formData.address}</p>
            <button onClick={() => setShowLocationConfirm(false)}>✔ OK</button>
            <button onClick={() => setShowMapPicker(true)}>Change</button>
          </div>
        )}

        {showMapPicker && (
          <LocationPicker close={() => setShowMapPicker(false)} />
        )}

        <form onSubmit={handleSubmit}>
          <input name="userName" placeholder="Name" onChange={(e)=>setFormData({...formData,userName:e.target.value})}/>
          <input name="userEmail" placeholder="Email" onChange={(e)=>setFormData({...formData,userEmail:e.target.value})}/>
          
          <textarea name="description" onChange={(e)=>setFormData({...formData,description:e.target.value})}/>

          <input type="file" onChange={handleImageChange} />

          {preview && <img src={preview} width="100" />}

          <button type="submit">Submit</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </Layout>
  );
}

export default ComplaintForm;