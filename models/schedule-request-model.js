// models/ScheduledRide.js
const mongoose = require("mongoose");

const scheduledRideSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: true,
  },
  carType: {
    type: String,
    required: true,
  },
  scheduleTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending",
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ScheduledRide = mongoose.model("ScheduledRide", scheduledRideSchema);

module.exports = ScheduledRide;