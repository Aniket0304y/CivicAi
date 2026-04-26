// backend/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { protect, admin } from "./middleware/authMiddleware.js";


// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Fix for ES modules (to use __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware setup
app.use(express.json()); // Parse JSON requests
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://civic-79gdpkqt0-aniketyadav9064-4223s-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
})); // Allow frontend (React) to access backend API

// ✅ Connect to MongoDB
connectDB();

// ✅ Test root route
app.get("/", (req, res) => {
  res.send(" AI-Powered Civic Issue Detection API is running...");
});

// ✅ Static folder to serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log(`📂 Serving uploaded images from: ${path.join(__dirname, "uploads")}`);


// ✅ Routes
app.use("/api/complaints", complaintRoutes); // Civic issue routes
app.use("/api/auth", authRoutes); // User authentication routes

// ✅ Warn if JWT secret not set (for login/register)
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  Warning: JWT_SECRET is missing in .env. Authentication will fail.");
}

// ✅ Error handling middleware (optional clean fallback)
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Server port
const PORT = process.env.PORT || 5000;

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Node.js Backend running on port ${PORT}`);
  console.log(`📡 Flask AI Model expected on port 5001`);
});
