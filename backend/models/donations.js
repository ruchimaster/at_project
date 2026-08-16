const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donation_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  donor_id: {
    type: String,
    required: true,
    trim: true,
  },

  food_name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  pickup_address: {
    type: String,
    required: true,
    trim: true,
  },

  contact_number: {
    type: String,
    required: true,
    trim: true,
  },

  available_until: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: [
      "Available",
      "Requested",
      "Accepted",
      "PickedUp",
      "Completed",
      "Expired",
      "Cancelled",
    ],
    default: "Available",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  completed_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Donation", donationSchema);
