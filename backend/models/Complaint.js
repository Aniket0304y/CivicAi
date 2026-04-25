import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    issueType: {
  type: String,
  enum: [
    "garbage",
    "open_manhole",
    "potholes",
    "streetlight_bad",
    "streetlight_good"
  ],
  required: true,
},
     department: {
      type: String,
      required: true,
    },
    authority: {
      type: String,
      required: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    aiConfidence: {
      type: String,
      default: "",
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    userName: {
      type: String,
      default: "Anonymous",
    },
    userEmail: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
