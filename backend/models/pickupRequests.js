const mongoose = require("mongoose");

const pickupRequestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  donation_id: {
    type: String,
    required: true,
    trim: true,
  },

  ngo_id: {
    type: String,
    required: true,
    trim: true,
  },

  request_status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Cancelled", "Completed"],
    default: "Pending",
  },

  request_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PickupRequest", pickupRequestSchema);
