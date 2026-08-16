const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    organization_name: {
      type: String,
      trim: true,
    },

    organization_type: {
      type: String,
      enum: ["Restaurant", "Hotel", "Caterer", "NGO", "Other"],
    },

    contact_person: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Donor", "NGO", "Admin"],
      required: true,
    },

    account_status: {
      type: String,
      enum: ["Pending", "Active", "Rejected", "Suspended"],
      default: "Pending",
    },

    warning_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
