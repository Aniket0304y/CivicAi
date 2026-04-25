import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

import Complaint from "../models/Complaint.js";
import departmentMapper from "../utils/departmentMapper.js";

const router = express.Router();

/* =======================
   📁 UPLOADS SETUP
   ======================= */
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

/* =======================
   🧾 POST /api/complaints
   ======================= */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      issueType: userIssueType,
      description,
      userName,
      userEmail,
      latitude,
      longitude,
      address,
    } = req.body;

    let finalIssueType = userIssueType;
    let aiConfidence = "";

    // 🧠 AI Prediction if issueType empty
    if ((!finalIssueType || finalIssueType === "") && req.file) {
      try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        const aiResponse = await axios.post(
          "http://127.0.0.1:5001/predict",
          formData,
          { headers: formData.getHeaders(), timeout: 5000 }
        );

        finalIssueType = aiResponse.data.prediction || "Unknown";
        aiConfidence = aiResponse.data.confidence || "";

        console.log("AI Prediction:", finalIssueType);
      } catch (err) {
        console.error("AI error:", err.message);
        finalIssueType = "AI_Error";
      }
    }

    // 🏢 MAP DEPARTMENT
    const { department, authority } = departmentMapper(finalIssueType);

    console.log("Mapped:", department, authority);

    // 💾 SAVE TO DB
    const newComplaint = new Complaint({
      issueType: finalIssueType,
      department,
      authority,
      description,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      aiConfidence,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
      },
      userName,
      userEmail,
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      data: savedComplaint,
    });
  } catch (error) {
    console.error("Save error:", error.message);
    res.status(500).json({
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
});

/* =======================
   📋 GET ALL (ADMIN)
   ======================= */
router.get("/all", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* =======================
   ✏️ UPDATE STATUS
   ======================= */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

/* =======================
   📊 STATS
   ======================= */
router.get("/stats", async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: "Resolved" });
    const pending = await Complaint.countDocuments({ status: "Pending" });
    res.json({ total, resolved, pending });
  } catch {
    res.status(500).json({ message: "Stats failed" });
  }
});

export default router;
